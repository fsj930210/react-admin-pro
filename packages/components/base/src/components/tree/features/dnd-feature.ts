import type {
	TreeFeature,
	TreeInstance,
	TreeItemInstance,
	TreeNode,
} from "../types";
import { defineProperty } from "../utils";

declare module "../types.ts" {
	interface TreeInstance {
		startDrag?: (key: string) => void;
		endDrag?: () => void;
		getDraggingKey?: () => string | null;
		updateDragPosition?: (key: string | null) => void;
		drop?: (info: DropInfo) => void;
	}
	interface TreeItemInstance {
		dragOver?: boolean;
		dragOverDirection?: "before" | "after" | "inside" | null;
		canDrop?: () => boolean;
		startDrag?: () => void;
	}
}
export interface DropInfo {
	dragKey: string;
	dropKey: string;
	dragNode: TreeItemInstance;
	dropNode: TreeItemInstance;
	direction: "before" | "after" | "inside";
}

type DndFeatureOptions = {
	allowDrag?: (node: TreeNode) => boolean;
	allowDrop?: (
		dropNode: TreeNode,
		dragNode: TreeNode,
		direction: "before" | "after" | "inside",
	) => boolean;
	onDragStart?: (dragKey: string) => void;
	onDragEnd?: () => void;
	onDrop?: (info: DropInfo) => void;
	onDragOver?: (
		dragKey: string,
		dropKey: string,
		direction: "before" | "after" | "inside",
	) => void;
};

function isAncestor(
	tree: TreeInstance,
	dragKey: string,
	dropKey: string,
): boolean {
	let currentKey = dropKey;
	while (currentKey) {
		const item = tree.getItem(currentKey);
		if (!item) break;
		if (item.parentKey === dragKey) {
			return true;
		}
		currentKey = item.parentKey || "";
	}
	return false;
}

function getNewTreeData(
	nodes: TreeNode[],
	dragKey: string,
	dropKey: string,
	direction: "before" | "after" | "inside",
): TreeNode[] {
	const findNode = (
		treeNodes: TreeNode[],
		key: string,
		parentNodes: TreeNode[] = [],
	): { node: TreeNode; parent: TreeNode[] } | null => {
		for (let i = 0; i < treeNodes.length; i++) {
			if (treeNodes[i].key === key) {
				return { node: treeNodes[i], parent: parentNodes };
			}
			if ((treeNodes?.[i].children?.length || 0) > 0) {
				const result = findNode(
					treeNodes?.[i].children || [],
					key,
					parentNodes.concat(treeNodes[i]),
				);
				if (result) return result;
			}
		}
		return null;
	};

	const clone = (data: TreeNode[]): TreeNode[] => {
		return JSON.parse(JSON.stringify(data));
	};

	const data = clone(nodes);
	const dragResult = findNode(data, dragKey);
	const dropResult = findNode(data, dropKey);

	if (!dragResult || !dropResult) {
		return data;
	}

	const { node: dragNode } = dragResult;
	const { node: dropNode, parent: dropParent } = dropResult;

	// 删除拖拽节点
	if (dragResult.parent.length) {
		const dragParent = dragResult.parent[dragResult.parent.length - 1];
		if (dragParent.children) {
			dragParent.children = dragParent.children.filter(
				(item) => item.key !== dragKey,
			);
		}
	} else {
		// 根节点
		const rootIndex = data.findIndex((item) => item.key === dragKey);
		if (rootIndex > -1) {
			data.splice(rootIndex, 1);
		}
	}

	// 插入到目标位置
	if (direction === "inside") {
		if (!dropNode.children) {
			dropNode.children = [];
		}
		dropNode.children.push(dragNode);
	} else {
		if (dropParent.length) {
			const parent = dropParent[dropParent.length - 1];
			if (parent.children) {
				const dropIndex = parent.children.findIndex(
					(item) => item.key === dropKey,
				);
				if (direction === "before") {
					parent.children.splice(dropIndex, 0, dragNode);
				} else {
					parent.children.splice(dropIndex + 1, 0, dragNode);
				}
			}
		} else {
			// 根节点
			const dropIndex = data.findIndex((item) => item.key === dropKey);
			if (direction === "before") {
				data.splice(dropIndex, 0, dragNode);
			} else {
				data.splice(dropIndex + 1, 0, dragNode);
			}
		}
	}

	return data;
}

export function dndFeature({
	allowDrag = () => true,
	allowDrop = () => true,
	onDragStart,
	onDragEnd,
	onDrop,
	onDragOver,
}: DndFeatureOptions = {}): TreeFeature {
	return {
		name: "dnd-feature",
		install(tree: TreeInstance) {
			let draggingKey: string | null = null;
			let dragOverKey: string | null = null;
			let dragOverDirection: "before" | "after" | "inside" | null = null;

			const resetDragState = () => {
				// 重置所有节点的拖拽状态
				tree.items.forEach((item) => {
					item.dragOver = false;
					item.dragOverDirection = null;
				});
				dragOverKey = null;
				dragOverDirection = null;
			};

			tree.startDrag = (key: string) => {
				const item = tree.getItem(key);
				if (item && allowDrag(item.node)) {
					draggingKey = key;
					resetDragState();
					onDragStart?.(key);
					tree.notify();
				}
			};

			tree.endDrag = () => {
				draggingKey = null;
				resetDragState();
				onDragEnd?.();
				tree.notify();
			};

			tree.getDraggingKey = () => draggingKey;

			tree.updateDragPosition = (
				key: string | null,
				direction: "before" | "after" | "inside" | null = null,
			) => {
				if (!draggingKey) return;

				resetDragState();

				if (key && key !== draggingKey) {
					const dropItem = tree.getItem(key);
					const dragItem = tree.getItem(draggingKey);

					if (dropItem && dragItem) {
						// 检查是否是自身或祖先节点
						if (draggingKey === key || isAncestor(tree, draggingKey, key)) {
							return;
						}

						const validDirection = direction || "inside";

						if (allowDrop(dropItem.node, dragItem.node, validDirection)) {
							dragOverKey = key;
							dragOverDirection = validDirection;
							dropItem.dragOver = true;
							dropItem.dragOverDirection = validDirection;
							onDragOver?.(draggingKey, key, validDirection);
						}
					}
				}

				tree.notify();
			};

			// 添加放置方法
			const handleDrop = () => {
				if (draggingKey && dragOverKey && dragOverDirection) {
					const dragItem = tree.getItem(draggingKey);
					const dropItem = tree.getItem(dragOverKey);

					if (dragItem && dropItem) {
						const newNodes = getNewTreeData(
							tree.nodes,
							draggingKey,
							dragOverKey,
							dragOverDirection,
						);

						// 触发放置回调
						onDrop?.({
							dragKey: draggingKey,
							dropKey: dragOverKey,
							dragNode: dragItem,
							dropNode: dropItem,
							direction: dragOverDirection,
						});

						// 更新树数据
						tree.updateTree(newNodes);
						tree.rebuildTree();
					}
				}

				tree.endDrag?.();
			};

			// 给树实例添加放置方法
			tree.drop = handleDrop;

			const init = () => {
				tree.items.forEach((item) => {
					defineProperty(item, "dragOver", {
						configurable: true,
						enumerable: true,
						value: false,
						writable: true,
					});

					defineProperty(item, "dragOverDirection", {
						configurable: true,
						enumerable: true,
						value: null,
						writable: true,
					});

					item.canDrop = () => {
						if (!draggingKey) return false;

						const dragItem = tree.getItem(draggingKey);
						if (
							!dragItem ||
							draggingKey === item.key ||
							isAncestor(tree, draggingKey, item.key)
						) {
							return false;
						}

						// 这里可以根据实际情况检查不同方向的放置权限
						return (
							allowDrop(item.node, dragItem.node, "inside") ||
							allowDrop(item.node, dragItem.node, "before") ||
							allowDrop(item.node, dragItem.node, "after")
						);
					};

					item.startDrag = () => {
						tree.startDrag?.(item.key);
					};
				});
			};

			init();
			tree.onRebuild = () => {
				init();
				// 重建树后重置拖拽状态
				if (draggingKey) {
					resetDragState();
				}
			};
		},
	};
}
