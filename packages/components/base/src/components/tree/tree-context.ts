import { createContext, useContext } from "react";
import type { TreeInstance } from "./types";

interface TreeContextValue {
	indent: number;
	tree?: TreeInstance;
	rowHeight?: number;
}
export const TreeContext = createContext<TreeContextValue>({
	indent: 24,
	tree: undefined,
	rowHeight: 24,
});

export function useTreeContext() {
	return useContext(TreeContext) as TreeContextValue;
}
