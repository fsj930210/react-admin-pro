import type {
	CreateTreeOptions,
	TreeFeature,
	TreeInstance,
	TreeItemInstance,
	TreeNode,
} from "../types";

export function resolveFeatures(features: TreeFeature[]): TreeFeature[] {
	const nameMap = new Map<string, TreeFeature>();
	features.forEach((f) => nameMap.set(f.name, f));

	for (const f of features) {
		if (f.confilts)
			for (const c of f.confilts) {
				if (nameMap.has(c))
					throw new Error(`Feature "${f.name}" conflicts with "${c}"`);
			}
	}

	const result: TreeFeature[] = [];
	const visited = new Set<string>();

	function visit(f: TreeFeature) {
		if (visited.has(f.name)) return;
		visited.add(f.name);

		if (f.depends)
			for (const dep of f.depends) {
				const depF = nameMap.get(dep);
				if (!depF)
					throw new Error(`Feature "${f.name}" depends on missing "${dep}"`);
				visit(depF);
			}

		result.push(f);
	}

	for (const f of features) visit(f);
	return Array.from(new Set(result));
}

export function createTree(nodes: TreeNode[], options: CreateTreeOptions) {
	const items = new Map<string, TreeItemInstance>();
	const features = resolveFeatures(options.features || []);

	function buildItems(nodes: TreeNode[], parentKey?: string, depth = 0) {
		nodes.forEach((node) => {
			const item: TreeItemInstance = {
				key: node.key,
				tree: tree as TreeInstance,
				parentKey,
				node,
				depth,
				isLeaf:
					options.isLeafCondition?.(node) ||
					!node.children ||
					node.children.length === 0,
			} as TreeItemInstance;
			items.set(node.key, item);
			if (node.children) buildItems(node.children, node.key, depth + 1);
		});
	}
	function installFeatures(tree: TreeInstance) {
		for (const f of features) f.install(tree);
	}
	let listeners: (() => void)[] = [];
	const _count = 0;

	const tree: TreeInstance = {
		nodes,
		items,
		_count,
		buildItems,
		updateTree(newNodes: TreeNode[]) {
			this.nodes = newNodes;
			this.rebuildTree();
		},
		rebuildTree() {
			items.clear();
			buildItems(this.nodes);
			this._count = this._count++;
			installFeatures(tree);
			if (typeof this.onRebuild === "function") this.onRebuild();
			this.notify();
		},
		getItem(key: string) {
			return items.get(key);
		},
		getVisibleItems: () => {
			const result: TreeItemInstance[] = [];
			function walk(nodes: TreeNode[]) {
				for (const node of nodes) {
					const item = tree.getItem(node.key) as TreeItemInstance;
					result.push(item);
					if (node.children && node.children.length > 0 && item.expanded)
						walk(node.children);
				}
			}
			walk(tree.nodes);
			console.log(result);
			return result;
		},
		subscribe(cb: () => void) {
			listeners.push(cb);
			return () => {
				listeners = listeners.filter((f) => f !== cb);
			};
		},
		notify() {
			this._count++;
			listeners.forEach((f) => f());
		},
	};

	buildItems(nodes);
	installFeatures(tree);
	return tree;
}
