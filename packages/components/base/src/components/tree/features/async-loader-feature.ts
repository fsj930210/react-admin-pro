import type {
	TreeFeature,
	TreeInstance,
	TreeItemInstance,
	TreeNode,
} from "../types";

declare module "../types.ts" {
	interface TreeInstance {
		loadChildren?: (key: string) => Promise<void>;
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
			tree.loadChildren = async (key: string) => {
				const item = tree.getItem(key);
				if (!item) return;
				if (!item.node.children || item.node.children.length === 0) {
					item.loading = true;
					tree.notify();
					const children = await loadChildren(item.node);
					item.loading = false;
					tree.notify();
					item.node.children = children;
					tree.rebuildTree();
				}
			};
			const loadChildrenIfNeeded = async (item: TreeItemInstance) => {
				if (!item.isLeaf) {
					await tree.loadChildren?.(item.node.key);
				}
			};
			tree.items.forEach((item) => {
				const originalExpand = item.expand;
				item.expand = (key: string) => {
					const item = tree.getItem(key);
					if (item) {
						loadChildrenIfNeeded(item);
					}
					originalExpand?.(key);
				};
				loadChildrenIfNeeded(item);
			});
		},
		depends: ["expandable-feature"],
	};
}
