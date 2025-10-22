import type { TreeFeature, TreeInstance, TreeItemInstance } from "../types";
import { defineProperty, getItemsByKeys } from "../utils";

declare module "../types.ts" {
	interface TreeInstance {
		getCheckedKeys?: () => string[];
		updateCheckedKeys?: (keys: string[]) => void;
	}
	interface TreeItemInstance {
		checked?: boolean;
		indeterminate?: boolean;
		check?: () => void;
		uncheck?: () => void;
	}
}

export interface CheckableOptions {
	defaultCheckedKeys?: string[];
	checkStrictly?: boolean;
	onCheck?: (
		checkedKeys: string[],
		checkedItems: TreeItemInstance[],
		checkInfo: {
			checked: boolean;
			node: TreeItemInstance;
		},
	) => void;
}

function getAllDescendantKeys(
	tree: TreeInstance,
	item: TreeItemInstance,
): string[] {
	let keys: string[] = [];
	const nodeData = item.node;
	if (!nodeData || !nodeData.children || !nodeData.children.length) return [];
	for (const child of nodeData.children) {
		const childKey = String(child.key);
		keys.push(childKey);
		const childItem = tree.getItem(childKey);
		if (childItem) keys = keys.concat(getAllDescendantKeys(tree, childItem));
	}
	return keys;
}

function getAllAncestorItems(
	tree: TreeInstance,
	item: TreeItemInstance,
): TreeItemInstance[] {
	const result: TreeItemInstance[] = [];
	let parentKey = item.parentKey;
	while (parentKey) {
		const parent = tree.getItem(parentKey);
		if (!parent) break;
		result.push(parent);
		parentKey = parent.parentKey;
	}
	return result;
}

function calcIndeterminate(
	tree: TreeInstance,
	checkedSet: Set<string>,
	item: TreeItemInstance,
): boolean {
	const nodeData = item.node;
	if (!nodeData || !nodeData.children || nodeData.children.length === 0)
		return false;
	let checkedCount = 0;
	let indeterminate = false;
	for (const child of nodeData.children) {
		const childKey = String(child.key);
		const childItem = tree.getItem(childKey);
		if (!childItem) continue;
		if (checkedSet.has(childKey)) checkedCount++;
		if (calcIndeterminate(tree, checkedSet, childItem)) indeterminate = true;
	}
	if (checkedCount === 0 && !indeterminate) return false;
	if (checkedCount === nodeData.children.length) return false;
	return true;
}

export function checkableFeature({
	defaultCheckedKeys,
	checkStrictly,
	onCheck,
}: CheckableOptions): TreeFeature {
	return {
		name: "checkable-feature",
		install(tree: TreeInstance) {
			const checkedKeys = new Set(defaultCheckedKeys || []);

			const updateItemState = (item: TreeItemInstance) => {
				defineProperty(item, "checked", {
					configurable: true,
					enumerable: true,
					get() {
						return checkedKeys.has(item.key);
					},
				});
				defineProperty(item, "indeterminate", {
					configurable: true,
					enumerable: true,
					get() {
						if (checkStrictly) return false;
						return calcIndeterminate(tree, checkedKeys, item);
					},
				});
			};

			function updateChecked(item: TreeItemInstance, checked: boolean) {
				if (checkStrictly) {
					if (checked) {
						checkedKeys.add(item.key);
					} else {
						checkedKeys.delete(item.key);
					}
				} else {
					// 递归选中/取消自己和所有子节点
					const keys = [item.key, ...getAllDescendantKeys(tree, item)];
					if (checked) {
						keys.forEach((key) => checkedKeys.add(key));
					} else {
						keys.forEach((key) => checkedKeys.delete(key));
					}

					// 向上联动父节点（全选+父选，部分选+父indeterminate）
					for (const ancestor of getAllAncestorItems(tree, item)) {
						if (!ancestor.node.children) continue;
						const allChecked = ancestor.node.children.every((child) =>
							checkedKeys.has(String(child.key)),
						);
						if (allChecked) {
							checkedKeys.add(ancestor.key);
						} else {
							checkedKeys.delete(ancestor.key);
						}
					}
				}
				onCheck?.(
					Array.from(checkedKeys),
					getItemsByKeys(tree.items, Array.from(checkedKeys)),
					{
						checked,
						node: item,
					},
				);
				tree.notify();
			}

			tree.getCheckedKeys = () => Array.from(checkedKeys);
			tree.updateCheckedKeys = (Keys: string[]) => {
				checkedKeys.clear();
				Keys.forEach((key) => checkedKeys.add(key));
				tree.notify();
			};
			const init = () => {
				tree.items.forEach((item) => {
					updateItemState(item);
					item.check = () => updateChecked(item, true);
					item.uncheck = () => updateChecked(item, false);
				});
			};
			init();
			tree.onRebuild = () => {
				init();
			};
		},
	};
}
