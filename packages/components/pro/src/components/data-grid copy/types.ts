import type { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/abstract";
import type {
	Cell,
	CellContext,
	Column,
	ColumnDef,
	ColumnFiltersState,
	ColumnOrderState,
	ColumnPinningPosition,
	ColumnPinningState,
	ColumnSizingState,
	ExpandedState,
	FilterFn,
	OnChangeFn,
	PaginationState,
	Row,
	RowData,
	RowPinningState,
	SortingState,
	TableState,
	VisibilityState
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { PaginationProps } from "../pagination";

export type DataUpdater<TData> = TData[] | ((prev: TData[]) => TData[]);

export type DataGridMode = "local" | "remote";
export type DataGridFieldPath = string | string[];
export type FilterJoinOperator = "and" | "or";
export type FilterOperator =
	| "contains"
	| "notContains"
	| "equals"
	| "notEqual"
	| "beginsWith"
	| "endsWith"
	| "lessThan"
	| "lessThanOrEqual"
	| "greaterThan"
	| "greaterThanOrEqual"
	| "before"
	| "after"
	| "inRange"
	| "blank"
	| "notBlank";

export interface DataGridFilterCondition {
	operator?: FilterOperator;
	value?: unknown;
	valueTo?: unknown;
}

export interface DataGridFilterValue {
	type?: DataGridColumnFilterConfig<unknown, unknown>["type"];
	join?: FilterJoinOperator;
	conditions?: [DataGridFilterCondition?, DataGridFilterCondition?];
	value?: unknown;
}

export interface DataGridLoadSort {
	id: string;
	key: string;
	desc: boolean;
	order: "asc" | "desc";
}

export interface DataGridLoadFilter {
	id: string;
	key: string;
	value: unknown;
	operator?: string;
	join?: FilterJoinOperator;
}

export interface DataGridLoadParams {
	page: number;
	pageSize: number;
	sorting: DataGridLoadSort[];
	filters: DataGridLoadFilter[];
	globalFilter?: unknown;
	pagination: PaginationState;
	columnFilters: ColumnFiltersState;
	sortingState: SortingState;
	columnVisibility: VisibilityState;
}

export interface DataGridDataResult<TData> {
	data: TData[];
	pagination?: {
		total?: number;
	};
}

export interface FilterRenderContext<TData, TValue> {
	column: Column<TData, TValue>;
	table: Column<TData, TValue>["columnDef"] extends never ? never : unknown;
	value: unknown;
	setValue: (value: unknown) => void;
	clear: () => void;
	apply: () => void;
}

export interface EditableCellContext<TData, TValue> extends CellContext<TData, TValue> {
	cell: Cell<TData, TValue>;
	value: TValue;
	rowData: TData;
	rowIndex: number;
	columnId: string;
	isEditing: boolean;
	draftValue: TValue;
	setDraftValue: (value: TValue) => void;
	cancelEdit: () => void;
	commitEdit: (value?: TValue) => void;
}

export interface ColumnMenuContext<TData, TValue> {
	column: Column<TData, TValue>;
	table: unknown;
}

export interface DataGridColumnVisibilityMeta {
	visible?: boolean;
	hideable?: boolean;
}

export interface DataGridColumnSortMeta {
	key?: string;
	enable?: boolean;
	local?: boolean;
	render?: (ctx: ColumnMenuContext<any, any>) => ReactNode;
}

export interface DataGridColumnFilterConfig<TData, TValue> {
	key?: string;
	enable?: boolean;
	local?: boolean;
	type?: "input" | "checkbox" | "radio" | "text" | "number" | "date" | "select" | "multiSelect" | "custom";
	options?: Array<{ label: ReactNode; value: string | number | boolean }>;
	operators?: FilterOperator[];
	render?: (ctx: Partial<FilterRenderContext<TData, TValue>> & { column: Column<TData, TValue>; table: unknown }) => ReactNode;
}

export interface DataGridColumnEditMeta<TData, TValue> {
	enable?: boolean | ((ctx: CellContext<TData, TValue>) => boolean);
	render?: (ctx: EditableCellContext<TData, TValue>) => ReactNode;
}

export interface DataGridColumnMenuMeta<TData, TValue> {
	enable?: boolean;
	pin?: boolean;
	sort?: boolean;
	filter?: boolean;
	visibility?: boolean;
	renderItems?: (ctx: ColumnMenuContext<TData, TValue>) => ReactNode;
}

export interface DataGridColumnMeta<TData, TValue> {
	title?: ReactNode;
	visibility?: DataGridColumnVisibilityMeta;
	sort?: DataGridColumnSortMeta;
	filter?: DataGridColumnFilterConfig<TData, TValue>;
	edit?: DataGridColumnEditMeta<TData, TValue>;
	menu?: DataGridColumnMenuMeta<TData, TValue>;
	parentId?: string | undefined;
	[key: string]: unknown;
}

declare module "@tanstack/react-table" {
	export interface ColumnMeta<TData extends RowData, TValue = unknown> {
		title?: ReactNode;
		visibility?: DataGridColumnVisibilityMeta;
		sort?: DataGridColumnSortMeta;
		filter?: DataGridColumnFilterConfig<TData, TValue>;
		edit?: DataGridColumnEditMeta<TData, TValue>;
		menu?: DataGridColumnMenuMeta<TData, TValue>;
		parentId?: string | undefined;
		pinning?: ColumnPinningPosition;
		visible?: boolean;
		filterType?: "input" | "checkbox" | "radio" | "custom";
		filterOptions?: Array<{ label: string; value: string | number }>;
		enableFilterNoLimitOption?: boolean;
	}
	export interface TableMeta<TData extends RowData> {
		updateData?: (updater: DataUpdater<TData>) => void;
		updateCellData?: (rowIndex: number, columnId: string, value: unknown) => void;
		reload?: () => void;
	}
	export interface FilterFns {
		dataGridFilter: FilterFn<unknown>;
		dataGridGlobalFuzzy: FilterFn<unknown>;
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
	reload?: () => void
	resetSorting?: () => void
	resetFilters?: () => void
	resetPagination?: () => void
	resetColumnVisibility?: () => void
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
	copyPinnedRows?: boolean;
	keepPinnedRows?: boolean;
	onChange?: (pinningState: RowPinningState) => void;
}

export interface ColumnVisibilityConfig {
	enable?: boolean;
	defaultVisibility?: VisibilityState;
	visibility?: VisibilityState;
	onChange?: (visibility: VisibilityState) => void
}
export interface SortingConfig<TData> {
	enable?: boolean;
	mode?: DataGridMode;
	defaultSorting?: SortingState;
	sorting?: SortingState;
	maxMultiSortColCount?: number
	enableMultiSort?: boolean;
	enableSortingRemoval?: boolean;
	onChange?: (sorting: SortingState, currentSortColumn?: Column<TData>) => void
}
export interface FilteringConfig<TData> {
	enable?: boolean;
	mode?: DataGridMode;
	defaultColumnFilters?: ColumnFiltersState;
	columnFilters?: ColumnFiltersState;
	defaultGlobalFilter?: unknown;
	globalFilter?: unknown;
	fuzzy?: boolean;
	onChange?: (filtering: ColumnFiltersState, currentFilterColumn?: Column<TData>) => void
	onGlobalFilterChange?: (globalFilter: unknown) => void
}

export interface PaginationConfig extends PaginationProps {
	enable?: boolean;
	mode?: DataGridMode;
	defaultPage?: number;
	defaultPageSize?: number;
	page?: number;
	pageSize?: number;
	total?: number;
}

export interface ColumnMenuConfig {
	enable?: boolean;
	contextMenu?: boolean;
	pin?: boolean;
	sort?: boolean;
	filter?: boolean;
	visibility?: boolean;
}

export interface VirtualConfig {
	rows?: boolean | {
		enable?: boolean;
		estimateSize?: number;
		overscan?: number;
	};
	columns?: boolean | {
		enable?: boolean;
		estimateSize?: number;
		overscan?: number;
	};
}

export interface InfiniteConfig {
	enable?: boolean;
	threshold?: number;
	onLoadMore?: () => void;
}

export interface ExpandingConfig<TData> {
	enable?: boolean;
	defaultExpanded?: ExpandedState;
	expanded?: ExpandedState;
	getSubRows?: (row: TData, index: number) => TData[] | undefined;
	onChange?: (expanded: ExpandedState) => void;
}

export interface EditableCellConfig<TData> {
	enable?: boolean;
	onChange?: (nextData: TData[]) => void;
}

export interface SubComponentsConfig<TData> {
	render?: (row: Row<TData>) => ReactNode;
}

export interface DataGridConfig<TData = unknown> {
	columnResizing?: ColumnResizingConfig;
	columnOrder?: ColumnOrderConfig;
	columnPinning?: ColumnPinningConfig;
	columnVisibility?: ColumnVisibilityConfig;
	rowOrder?: RowOrderConfig;
	rowSelection?: RowSelectionConfig<TData>;
	rowPinning?: RowPinningConfig;
	sorting?: SortingConfig<TData>;
	filtering?: FilteringConfig<TData>;
	pagination?: PaginationConfig | false;
	columnMenu?: ColumnMenuConfig;
	virtual?: VirtualConfig;
	infinite?: InfiniteConfig;
	expanding?: ExpandingConfig<TData>;
	editable?: EditableCellConfig<TData>;
	subComponents?: SubComponentsConfig<TData>;
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
	rowOrder?: string[];
	previewRowOrder?: string[];
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
	tableOptions?: Record<string, unknown>;
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
