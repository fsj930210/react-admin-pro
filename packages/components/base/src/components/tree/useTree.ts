import { useEffect, useRef, useSyncExternalStore } from "react";
import { createTree } from "./features/core";
import type { CreateTreeOptions, TreeInstance, TreeNode } from "./types";

export function useTree(
	defaultNodes: TreeNode[] = [],
	options: CreateTreeOptions,
) {
	// console.log(defaultNodes)
	const treeRef = useRef<TreeInstance | null>(null);
	if (!treeRef.current) {
		treeRef.current = createTree(defaultNodes, options);
	}
	const tree = treeRef.current;
	useSyncExternalStore(tree.subscribe, () => tree._count);
	useEffect(() => {
		tree.updateTree(defaultNodes);
	}, [defaultNodes]);
	return tree;
}
