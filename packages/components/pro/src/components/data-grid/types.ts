import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/abstract";
import type {
	ColumnDef,
	ColumnOrderState,
	ColumnSizingState,
	OnChangeFn,
	RowData,
	TableState
} from "@tanstack/react-table";


declare module "@tanstack/react-table" {
	export interface ColumnMeta<TData extends RowData, TValue = unknown> {
		parentId: string | undefined;
	}
}
export interface DataGridRef {
	moveColumns?: (columnIds: string[], toIndex: number) => void
	moveColumnByIndex?: (fromIndex: number, toIndex: number) => void
	resetColumnOrder?: () => void
}

export interface ColumnResizingConfig {
	enable?: boolean;
	columnResizeMode?: 'onChange' | 'onEnd';
	minSize?: number;
	maxSize?: number;
	defaultSize?: number;
	onChange?: (sizingState: ColumnSizingState) => void;
}

export interface ColumnOrderConfig {
	enable?: boolean;
	defaultColumnOrder?: string[];
	columnOrder?: string[];
	enableDrag?: boolean;
	onChange?: (columnOrder: string[]) => void;
}
export interface DataGridConfig {
	columnResizing?: ColumnResizingConfig;
	columnOrder?: ColumnOrderConfig;
}

export interface DndCallbacks {
	onDragStart?: (e: DragStartEvent) => void;
	onDragEnd?: (e: DragEndEvent) => void;
	onDragOver?: (e: DragOverEvent) => void;
}
export interface Callbacks {
	onColumnOrderChange?: OnChangeFn<ColumnOrderState>
	onPaginationChange?: OnChangeFn<TableState["pagination"]>
	onSortingChange?: OnChangeFn<TableState["sorting"]>
	onColumnFiltersChange?: OnChangeFn<TableState["columnFilters"]>
	onGlobalFilterChange?: OnChangeFn<TableState["globalFilter"]>
	onExpandedChange?: OnChangeFn<TableState["expanded"]>
	onGroupingChange?: OnChangeFn<TableState["grouping"]>
	onColumnPinningChange?: OnChangeFn<TableState["columnPinning"]>
	onRowPinningChange?: OnChangeFn<TableState["rowPinning"]>
	onColumnVisibilityChange?: OnChangeFn<TableState["columnVisibility"]>
	onRowSelectionChange?: OnChangeFn<TableState["rowSelection"]>
}
export interface DataGridFeature{
	state?: Partial<TableState>;
	callbacks?: Partial<Callbacks>;
	api?: Record<string, unknown>;
	dndCallbacks?: DndCallbacks;
	enableDrag?: boolean;
	dragType?: 'column' | 'row';
}
export type DataTableFeatureHook<TData, TConfig = DataGridConfig> = (
	columns: ColumnDef<TData>[],
	config?: TConfig
) => DataGridFeature
