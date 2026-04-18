import type {
	TreeFeature,
	TreeInstance,
	TreeItemInstance,
	TreeNode,
} from "../types";

declare module "../types.ts" {
	interface TreeInstance {
		loadChildren?: (item: TreeItemInstance) => Promise<void>;
	}
	interface TreeItemInstance {
		loading?: boolean;
	}
}

type AsyncLoaderFeatureOptions = {
	loadChildren: (node: TreeNode) => Promise<TreeNode[]>;
};

export function asyncLoaderFeature({
	loadChildren,
}: AsyncLoaderFeatureOptions): TreeFeature {
	return {
		name: "async-loader-feature",
		install(tree: TreeInstance) {
			tree.loadChildren = async (item: TreeItemInstance) => {
				if (!item) return;
				if (!item.node.children || item.node.children.length === 0) {
					item.loading = true;
					tree.notify();
					console.log(item, 'loadChildren');
					const children = await loadChildren(item.node);
					item.loading = false;
					tree.notify();
					item.node.children = children;
					tree.rebuildTree();
				}
			};
			const loadChildrenIfNeeded = async (item: TreeItemInstance) => {
				if (!item.isLeaf) {
					await tree.loadChildren?.(item);
				}
			};
			const init = () => {
				tree.items.forEach((item) => {
					const originalExpand = item.expand;
					item.expand = (key: string) => {
						console.log(key, 'key');
						const item = tree.getItem(key);
						console.log(item, 'item');
						if (item) {
							loadChildrenIfNeeded(item);
						}
						originalExpand?.(key);
					};
					// loadChildrenIfNeeded(item);
				});
			};
			init();
			if (!tree.onRebuild) tree.onRebuild = [];
			tree.onRebuild.push(() => {
				init();
			});
		},
		depends: ["expandable-feature"],
	};
}
