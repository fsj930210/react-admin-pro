import type { ColumnOrderConfig, ColumnResizingConfig, RowOrderConfig } from "../types";



export const defaultColumnResizingConfig: ColumnResizingConfig = {
	enable: false,
	columnResizeMode: 'onChange',
	minSize: 0,
	maxSize: Number.MAX_SAFE_INTEGER,
	defaultSize: 120,
}
export const defaultColumnOrderConfig: ColumnOrderConfig = {
	enable: false,
}
export const defaultRowOrderConfig: RowOrderConfig = {
	enable: false,
}
