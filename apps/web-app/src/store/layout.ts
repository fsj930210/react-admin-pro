
import type { LayoutTabItem } from "@/layouts/components/tabs/types";
import { createSetter, createStore, type SetterFunction } from "@rap/hooks/use-zustand";
export interface LayoutState {
	tabs: LayoutTabItem[];
	breadcrumb: any[];
}

export interface LayoutActions {
	setTabs: SetterFunction<LayoutState, "tabs">;
	setBreadcrumb: SetterFunction<LayoutState, "breadcrumb">;
}
export type Layout = LayoutState & LayoutActions;

const { selector: useLayoutSelector } = createStore<Layout>(
	(set) => ({
		tabs: [],
		breadcrumb: [],
		setTabs: createSetter<LayoutState, "tabs">(set, "tabs"),
		setBreadcrumb: createSetter<LayoutState, "breadcrumb">(set, "breadcrumb"),
	}),
	{
		name: "LayoutStore",
	},
);
export { useLayoutSelector };
