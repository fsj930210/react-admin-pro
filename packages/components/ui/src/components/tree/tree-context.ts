import { createContext, useContext } from "react";
import type { TreeInstance } from "./types";

interface TreeContextValue {
	indent: number;
	rowHeight: number;
	tree: TreeInstance | null;
}

export const TreeContext = createContext<TreeContextValue>({
	indent: 24,
	rowHeight: 28,
	tree: null,
});

export function useTreeContext() {
	const context = useContext(TreeContext);
	if (!context.tree) {
		throw new Error("Tree primitives must be used inside TreeRoot.");
	}
	return context as TreeContextValue & { tree: TreeInstance };
}
