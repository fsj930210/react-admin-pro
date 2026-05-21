import type { TableState } from "@tanstack/react-table";

export interface ColumnResizingConfig {
	enable?: boolean;
	columnResizeMode?: 'onChange' | 'onEnd';
	minSize?: number;
	maxSize?: number;
	defaultSize?: number;
}

export interface ColumnOrderConfig {
	enable?: boolean;
	defaultColumnOrder?: string[];
	columnOrder?: string[];
}
export interface DataGridConfig {
	columnResizing?: ColumnResizingConfig;
	columnOrder?: ColumnOrderConfig;
}

export interface DndCallbacks {
	onDragStart?: (e: DragEvent) => void;
	onDragEnd?: (e: DragEvent) => void;
	onDragOver?: (e: DragEvent) => void;
	onDrop?: (e: DragEvent) => void;
}
export interface Callbacks {

}
export interface DataGridFeature{
	state?: TableState;
	callbacks?: Callbacks;
	api?: Record<string, unknown>;
	dndCallbacks?: DndCallbacks;
	enableDrag?: boolean;
	dragType?: 'column' | 'row';
}
