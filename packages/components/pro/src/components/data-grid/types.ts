import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/abstract";
import type {
	ColumnDef,
	ColumnOrderState,
	ColumnSizingState,
	OnChangeFn,
	Row,
	RowData,
	TableState
} from "@tanstack/react-table";

export type DataUpdater<TData> = TData[] | ((prev: TData[]) => TData[]);


declare module "@tanstack/react-table" {
	export interface ColumnMeta<TData extends RowData, TValue = unknown> {
		parentId: string | undefined;
	}
	export interface TableMeta<TData extends RowData> {
		updateData?: (updater: DataUpdater<TData>) => void;
		updateCellData?: (rowIndex: number, columnId: string, value: unknown) => void;
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

export interface RowOrderConfig {
	enable?: boolean;
	enableDrag?: boolean;
	onChange?: (rowOrder: string[]) => void;
}
export interface DataGridConfig {
	columnResizing?: ColumnResizingConfig;
	columnOrder?: ColumnOrderConfig;
	rowOrder?: RowOrderConfig;
}

export interface DndCallbacks {
	onDragStart?: (e: DragStartEvent) => void;
	onDragEnd?: (e: DragEndEvent) => void;
	onDragOver?: (e: DragOverEvent) => void;
}
export interface ColumnOrderDragState {
	activeColumnId?: string;
	columnOrder: string[];
	previewColumnOrder: string[];
	isDragging: boolean;
}
export interface RowOrderDragState {
	activeRowId?: string;
	isDragging: boolean;
}
export interface DataGridFeatureContext<TData> {
	data: TData[];
	getRowId: (row: TData, index: number, parentRow?: Row<TData>) => string;
	updateData?: (updater: DataUpdater<TData>) => void;
}
export interface Callbacks {
	onColumnOrderChange?: OnChangeFn<ColumnOrderState>
	onColumnSizingChange?: OnChangeFn<ColumnSizingState>
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
	columnOrderDrag?: ColumnOrderDragState;
	rowOrderDrag?: RowOrderDragState;
	enableDrag?: boolean;
	dragType?: 'column' | 'row';
}
export type DataTableFeatureHook<TData, TConfig = DataGridConfig> = (
	columns: ColumnDef<TData>[],
	config?: TConfig,
	context?: DataGridFeatureContext<TData>
) => DataGridFeature
