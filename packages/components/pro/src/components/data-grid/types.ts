import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/abstract";
import type {
	ColumnDef,
	ColumnOrderState,
	ColumnPinningPosition,
	ColumnPinningState,
	ColumnSizingState,
	OnChangeFn,
	Row,
	RowData,
	RowPinningState,
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
	pinColumn?: (columnId: string, position: "left" | "right" | false) => void
	unpinColumn?: (columnId: string) => void
	resetColumnPinning?: () => void
	pinRow?: (rowId: string, position: "top" | "bottom" | false) => void
	unpinRow?: (rowId: string) => void
	resetRowPinning?: () => void
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
	handleColumn?: {
		enable?: boolean;
		size?: number;
		title?: string;
	};
	onChange?: (rowOrder: string[]) => void;
}

export interface RowSelectionConfig<TData> {
	enable?: boolean;
	type?: 'checkbox' | 'radio';
	title?: string;
	size?: number;
	pinning?: ColumnPinningPosition;
	enableSelectAll?: boolean;
	defaultSelectedRowKeys?: string[];
	selectedRowKeys?: string[];
	enableRowSelection?: (row: Row<TData>) => boolean;
	enableSubRowSelection?: (row: Row<TData>) => boolean | boolean;
	onChange?: (selectedRowKeys: string[], selectedRows: RowData[]) => void;
	onSelectAll?: (selected: boolean, selectedRows: RowData[], changeRows: RowData[]) => void;
	onSelect?: (row: RowData, selected: boolean, selectedRows: RowData[]) => void;
}

export interface ColumnPinningConfig {
	enable?: boolean;
	defaultPinningState?: ColumnPinningState;
	columnPinningState?: ColumnPinningState;
	onChange?: (pinningState: ColumnPinningState) => void;
}

export interface RowPinningConfig {
	enable?: boolean;
	defaultPinningState?: RowPinningState;
	rowPinningState?: RowPinningState;
	onChange?: (pinningState: RowPinningState) => void;
}

export interface DataGridConfig<TData> {
	columnResizing?: ColumnResizingConfig;
	columnOrder?: ColumnOrderConfig;
	columnPinning?: ColumnPinningConfig;
	rowOrder?: RowOrderConfig;
	rowSelection?: RowSelectionConfig<TData>;
	rowPinning?: RowPinningConfig;
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
export interface DndConfig {
	enable?: boolean;
	callbacks?: DndCallbacks;
}
export interface FearureReturn<TData> {
	columnOrderDrag?: ColumnOrderDragState;
	rowOrderDrag?: RowOrderDragState;
	rowSelectionColumn?: ColumnDef<TData>;
	[key: string]: any;
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
export interface DataGridFeature<TData>{
	state?: Partial<TableState>;
	callbacks?: Partial<Callbacks>;
	api?: Record<string, unknown>;
	dndConfig?: DndConfig;
	fearureReturn?: FearureReturn<TData>;
}
export type DataTableFeatureHook<TData, TConfig = DataGridConfig<TData>> = (
	columns: ColumnDef<TData>[],
	config?: TConfig,
	context?: DataGridFeatureContext<TData>
) => DataGridFeature<TData>

export interface CreateColumnFactory<TData> {
	shouldCreate: (config: DataGridConfig<TData>) => boolean;
	create: (config: DataGridConfig<TData>) => ColumnDef<TData>;
	position: "prepend" | "append";
}
