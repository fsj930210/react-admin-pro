import type { TreeFeature, TreeInstance, TreeItemInstance } from "../types";
import { defineProperty, getItemsByKeys } from "../utils";

declare module "../types.ts" {
	interface TreeInstance {
		getSelectedKeys?: () => string[];
		updateSelectedKeys?: (keys: string[]) => void;
	}
	interface TreeItemInstance {
		selected?: boolean;
		select?: (append?: boolean) => void;
		unselect?: () => void;
	}
}
type SelectableFeatureOptions = {
	defaultSelectedKeys?: string[];
	multiple?: boolean;
	onSelect?: (
		selectedKeys: string[],
		selectedItems: TreeItemInstance[],
		selectInfo: {
			selected: boolean;
			node: TreeItemInstance;
		},
	) => void;
};
export function selectableFeature({
	defaultSelectedKeys,
	multiple = false,
	onSelect,
}: SelectableFeatureOptions): TreeFeature {
	return {
		name: "selectable-feature",
		install(tree: TreeInstance) {
			const selectedKeys = new Set<string>(defaultSelectedKeys || []);

			tree.getSelectedKeys = () => Array.from(selectedKeys);
			tree.updateSelectedKeys = (keys: string[]) => {
				selectedKeys.clear();
				keys.forEach((key) => selectedKeys.add(key));
				tree.notify();
			};
			const updateSelectedState = (key: string, selected: boolean) => {
				if (!multiple) selectedKeys.clear();
				if (selected) {
					selectedKeys.add(key);
				} else {
					selectedKeys.delete(key);
				}
				onSelect?.(
					Array.from(selectedKeys),
					getItemsByKeys(tree.items, Array.from(selectedKeys)),
					{
						selected,
						node: tree.getItem(key) as TreeItemInstance,
					},
				);
				tree.notify();
			};
			const init = () => {
				tree.items.forEach((item) => {
					defineProperty(item, "selected", {
						get: () => selectedKeys.has(item.key),
					});
					item.select = () => updateSelectedState(item.key, true);
					item.unselect = () => updateSelectedState(item.key, false);
				});
			};
			init();
			tree.onRebuild = () => {
				init();
			};
		},
	};
}
