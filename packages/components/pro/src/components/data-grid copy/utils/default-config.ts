import type { 
	ColumnMenuConfig,
	ColumnOrderConfig, 
	ColumnPinningConfig, 
	ColumnResizingConfig,
	ColumnVisibilityConfig,
	EditableCellConfig,
	ExpandingConfig,
	FilteringConfig,
	InfiniteConfig,
	PaginationConfig,
	RowOrderConfig, 
	RowPinningConfig, 
	RowSelectionConfig,
	SortingConfig,
	VirtualConfig
} from "../types";



export function getDefaultColumnResizingConfig(): ColumnResizingConfig {
	return {
		enable: false,
		columnResizeMode: 'onChange',
		minSize: 0,
		maxSize: Number.MAX_SAFE_INTEGER,
		defaultSize: 120,
	};
}

export function getDefaultColumnOrderConfig(): ColumnOrderConfig {
	return {
		enable: false,
	};
}

export function getDefaultRowOrderConfig(): RowOrderConfig {
	return {
		enable: false,
	};
}

export function getDefaultRowSelectionConfig<TData>(): RowSelectionConfig<TData> {
	return {
		enable: false,
		type: 'checkbox',
		title: '',
		enableSelectAll: true,
		size: 60,
	};
}

export function getDefaultColumnPinningConfig(): ColumnPinningConfig {
	return {
		enable: false,
		defaultPinningState: {
			left: [],
			right: [],
		},
	};
}
export function getDefaultRowPinningConfig(): RowPinningConfig {	
	return {
		enable: false,
		defaultPinningState: {
			top: [],
			bottom: [],
		},
		copyPinnedRows: false,
	};
}

export function getDefaultColumnVisibilityConfig(): ColumnVisibilityConfig {
	return {
		enable: false,
	};
}

export function getDefaultSortingConfig<TData>(): SortingConfig<TData> {
	return {
		enable: false,
		mode: "remote",
		enableMultiSort: true,
		enableSortingRemoval: true,
	};
}

export function getDefaultFilteringConfig<TData>(): FilteringConfig<TData> {
	return {
		enable: false,
		mode: "remote",
		fuzzy: false,
	};
}

export function getDefaultPaginationConfig(): PaginationConfig {
	return {
		enable: false,
		mode: "remote",
		defaultPage: 1,
		defaultPageSize: 10,
		pageSizeOptions: [10, 20, 50, 100],
	};
}

export function getDefaultColumnMenuConfig(): ColumnMenuConfig {
	return {
		enable: true,
		contextMenu: true,
		pin: true,
		sort: true,
		filter: true,
		visibility: true,
	};
}

export function getDefaultVirtualConfig(): VirtualConfig {
	return {
		rows: false,
		columns: false,
	};
}

export function getDefaultInfiniteConfig(): InfiniteConfig {
	return {
		enable: false,
		threshold: 120,
	};
}

export function getDefaultExpandingConfig<TData>(): ExpandingConfig<TData> {
	return {
		enable: false,
	};
}

export function getDefaultEditableCellConfig<TData>(): EditableCellConfig<TData> {
	return {
		enable: false,
	};
}
