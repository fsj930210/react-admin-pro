import type {
	TreeFeature,
	TreeInstance,
	TreeItemInstance,
	TreeNode,
} from "../types";
import { defineProperty, getItemsByKeys } from "../utils";

declare module "../types.ts" {
	interface TreeInstance {
		getExpandedKeys?: () => string[];
		updateExpandedKeys?: (keys: string[]) => void;
	}
	interface TreeItemInstance {
		expanded?: boolean;
		expand?: (key: string) => void;
		collapse?: (key: string) => void;
	}
}
type ExpandableFeatureOptions = {
	defaultExpandedKeys?: string[];
	onExpand?: (
		expandedKeys: string[],
		expandedItems: TreeItemInstance[],
		expandInfo: {
			expanded: boolean;
			node: TreeItemInstance;
		},
	) => void;
};

export function expandableFeature({
	defaultExpandedKeys,
	onExpand,
}: ExpandableFeatureOptions): TreeFeature {
	return {
		name: "expandable-feature",
		install(tree: TreeInstance) {
			const expandedKeys = new Set<string>(defaultExpandedKeys || []);
			tree.getExpandedKeys = () => Array.from(expandedKeys);
			tree.updateExpandedKeys = (keys: string[]) => {
				expandedKeys.clear();
				keys.forEach((key) => expandedKeys.add(key));
				tree.notify();
			};
			tree.getVisibleItems = () => {
				const result: TreeItemInstance[] = [];
				function walk(nodes: TreeNode[]) {
					for (const node of nodes) {
						const item = tree.getItem(node.key) as TreeItemInstance;
						result.push(item);
						if (node.children && expandedKeys.has(node.key)) {
							walk(node.children);
						}
					}
				}
				walk(tree.nodes);
				return result;
			};
			const updateItemExpandedState = (key: string, expanded: boolean) => {
				if (expanded) {
					expandedKeys.add(key);
				} else {
					expandedKeys.delete(key);
				}
				onExpand?.(
					Array.from(expandedKeys),
					getItemsByKeys(tree.items, Array.from(expandedKeys)),
					{
						expanded: expanded,
						node: tree.getItem(key) as TreeItemInstance,
					},
				);
				tree.notify();
			};

			const init = () => {
				tree.items.forEach((item) => {
					defineProperty(item, "expanded", {
						get: () => expandedKeys.has(item.key),
					});
					item.expand = () => updateItemExpandedState(item.key, true);
					item.collapse = () => updateItemExpandedState(item.key, false);
				});
			};
			init();
			tree.onRebuild = () => {
				init();
			};
		},
	};
}
