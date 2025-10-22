import {
	TreeCheckIcon,
	TreeExpandIcon,
	TreeItem,
	TreeLabel,
	TreeRoot,
} from "@rap/components-base/tree";
import {
	checkableFeature,
	expandableFeature,
	selectableFeature,
} from "@rap/components-base/tree/features";
import type { TreeNode } from "@rap/components-base/tree/types";
import { createFileRoute } from "@tanstack/react-router";

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
	return (
		<div>
			<TreeRoot
				nodes={treeNodes}
				features={[
					expandableFeature({
						defaultExpandedKeys: ["root"],
					}),
					selectableFeature({}),
					checkableFeature({}),
				]}
			>
				{({ tree }) => (
					<>
						{tree.getVisibleItems().map((item) => (
							<TreeItem key={item.key} item={item}>
								<TreeExpandIcon item={item} />
								<TreeCheckIcon item={item} />
								<TreeLabel item={item} />
							</TreeItem>
						))}
					</>
				)}
			</TreeRoot>
		</div>
	);
}
