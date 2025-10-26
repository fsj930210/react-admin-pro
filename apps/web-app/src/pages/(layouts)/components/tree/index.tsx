import {
	TreeCheckbox,
	TreeExpandIcon,
	TreeItem,
	TreeLabel,
	TreeRoot,
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

const treeNodes: TreeNode[] = [
	{
		key: "root",
		label: "root",
		children: [
			{
				key: "1",
				label: "Node 1",
				children: [
					{ key: "1-1", label: "Child Node 1-1" },
					{ key: "1-2", label: "Child Node 1-2" },
				],
			},
			{ key: "2", label: "Node 2" },
			{
				key: "3",
				label: "Node 3",
				children: [
					{ key: "3-1", label: "Child Node 3-1" },
					{
						key: "3-2",
						label: "Child Node 3-2",
						children: [{ key: "3-2-1", label: "Child Node 3-2-1" }],
					},
					{ key: "3-3", label: "Child Node 3-3" },
				],
			},
			{ key: "4", label: "Node 4" },
		],
	},
];
function TreeComponentPage() {
	const [treeData, setTreeData] = useState<TreeNode[]>(treeNodes);
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

	const handleDragOver = (e: React.DragEvent<HTMLElement>, item: TreeItemInstance) => {
		e.preventDefault();
		e.stopPropagation();
		if (!containerRef.current) return;
		const res = item.dragOver?.(e, containerRef.current);
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
		<div ref={containerRef}>
			<TreeRoot
				nodes={treeNodes}
				features={[
					expandableFeature({
						defaultExpandedKeys: ["root"],
					}),
					selectableFeature({}),
					checkableFeature({}),
					dndFeature({}),
				]}
			>
				{({ tree }) => (
					<>
						{tree.getVisibleItems().map((item) => (
							<TreeItem
								key={item.key}
								item={item}
								onDragStart={(e) => handleDragStart(e, item)}
								onDragOver={(e) => handleDragOver(e, item)}
								onDrop={(e) => handleDrop(e, item, tree)}
								onDragEnd={(e) => handleDragEnd(e, item)}
							>
								<TreeExpandIcon item={item} />
								<TreeCheckbox item={item} />
								<TreeLabel item={item} />
							</TreeItem>
						))}
					</>
				)}
			</TreeRoot>
		</div>
	);
}
