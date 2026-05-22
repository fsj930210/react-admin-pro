import type { 
	ColumnOrderConfig, 
	ColumnPinningConfig, 
	ColumnResizingConfig,
	RowOrderConfig, 
	RowPinningConfig, 
	RowSelectionConfig 
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
		columnPinningState: {
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
		rowPinningState: {
			top: [],
			bottom: [],
		},
	};
}