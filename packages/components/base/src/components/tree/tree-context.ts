import { createContext, useContext } from "react";
import type { TreeInstance, TreeItemInstance } from "./types";

interface TreeContextValue {
	indent: number;
	currentItem?: TreeItemInstance;
	tree?: TreeInstance;
}
export const TreeContext = createContext<TreeContextValue>({
	indent: 20,
	currentItem: undefined,
	tree: undefined,
});

export function useTreeContext() {
	return useContext(TreeContext) as TreeContextValue;
}
