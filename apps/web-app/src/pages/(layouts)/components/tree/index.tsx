import {
	DropIndicator,
	TreeCheckbox,
	TreeExpandIcon,
	TreeItem,
	TreeLabel,
	VirtualizedTree,
} from "@rap/components-base/tree";
import {
	checkableFeature,
	dndFeature,
	expandableFeature,
	selectableFeature,
} from "@rap/components-base/tree/features";

import type {
	DropInfo,
	DropPosition,
	TreeInstance,
	TreeItemInstance,
	TreeNode,
} from "@rap/components-base/tree/types";
import { moveNode } from "@rap/components-base/tree/utils.js";
import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";

export const Route = createFileRoute("/(layouts)/components/tree/")({
	component: TreeComponentPage,
});

// const treeNodes: TreeNode[] = [
//   {
//     key: "root",
//     label: "root",
//     children: [
//       {
//         key: "1",
//         label: "Node 1",
//         children: [
//           { key: "1-1", label: "Child Node 1-1" },
//           { key: "1-2", label: "Child Node 1-2" },
//         ],
//       },
//       { key: "2", label: "Node 2" },
//       {
//         key: "3",
//         label: "Node 3",
//         children: [
//           { key: "3-1", label: "Child Node 3-1" },
//           {
//             key: "3-2",
//             label: "Child Node 3-2",
//             children: [{ key: "3-2-1", label: "Child Node 3-2-1" }],
//           },
//           { key: "3-3", label: "Child Node 3-3" },
//         ],
//       },
//       { key: "4", label: "Node 4" },
//     ],
//   },
// ];
const dig = (path = "0", level = 3) => {
	const list = [];
	for (let i = 0; i < 10; i += 1) {
		const key = `${path}-${i}`;
		const treeNode: TreeNode = {
			label: key,
			key,
		};

		if (level > 0) {
			treeNode.children = dig(key, level - 1);
		}

		list.push(treeNode);
	}
	return list;
};
function TreeComponentPage() {
	const [treeData, setTreeData] = useState<TreeNode[]>(dig());
	const [dropInfo, setDropInfo] = useState<DropInfo | null>(null);
	const containerRef = useRef<HTMLDivElement | null>(null);
	const handleDragStart = (e: React.DragEvent<HTMLElement>, item: TreeItemInstance) => {
		e.stopPropagation();
		const ghost = (e.currentTarget as HTMLElement).cloneNode(true) as HTMLElement;
		ghost.style.position = "fixed";
		ghost.style.left = "-9999px";
		ghost.style.top = "-9999px";
		document.body.appendChild(ghost);
		try {
			e.dataTransfer?.setDragImage(ghost, 0, 0);
		} catch {}
		setTimeout(() => {
			if (ghost.parentNode) ghost.parentNode.removeChild(ghost);
		}, 0);
		item.dragStart?.(e, item);
		setDropInfo(null);
	};

	const handleDragOver = (
		e: React.DragEvent<HTMLElement>,
		item: TreeItemInstance,
		indent: number,
	) => {
		e.preventDefault();
		e.stopPropagation();
		if (!containerRef.current) return;
		const res = item.dragOver?.(e, containerRef.current, null, indent);
		setDropInfo(res as DropInfo | null);
	};
	const handleDrop = (
		e: React.DragEvent<HTMLElement>,
		item: TreeItemInstance,
		tree: TreeInstance,
	) => {
		e.preventDefault();
		e.stopPropagation();
		const draggingKey = tree.getDraggingKey?.();
		const newTree = moveNode(
			draggingKey as string,
			(dropInfo as DropInfo).dropTargetKey,
			(dropInfo as DropInfo).dropPosition as DropPosition,
			treeData,
		);
		setTreeData(newTree);

		item.dragEnd?.(e, item);
		setDropInfo(null);
	};

	const handleDragEnd = (e: React.DragEvent<HTMLElement>, item: TreeItemInstance) => {
		e.stopPropagation();
		item.dragEnd?.(e, item);
		setDropInfo(null);
	};
	return (
		<div ref={containerRef} className="relative">
			<VirtualizedTree
				treeData={treeData}
				features={[
					expandableFeature({
						defaultExpandedKeys: ["root"],
					}),
					selectableFeature({}),
					checkableFeature({}),
					dndFeature({}),
				]}
				height={400}
			>
				{({ item, indent, tree }) => (
					<TreeItem key={item.key} item={item}>
						<div
							className="inline-flex items-center"
							onDragStart={(e) => handleDragStart(e, item)}
							onDragOver={(e) => handleDragOver(e, item, indent)}
							onDrop={(e) => handleDrop(e, item, tree)}
							onDragEnd={(e) => handleDragEnd(e, item)}
							draggable
						>
							<TreeExpandIcon item={item} />
							<TreeCheckbox item={item} />
							<TreeLabel item={item} />
						</div>
					</TreeItem>
				)}
			</VirtualizedTree>
			<DropIndicator info={dropInfo as DropInfo} />
		</div>
	);
}
