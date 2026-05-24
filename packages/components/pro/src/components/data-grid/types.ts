import type {
	Cell,
	Column,
	ColumnDef,
	ColumnFiltersState,
	ColumnPinningPosition,
	ColumnPinningState,
	ColumnSizingState,
	Header,
	HeaderGroup,
	OnChangeFn,
	PaginationState,
	Row,
	RowData,
	RowPinningState,
	RowSelectionState,
	SortingState,
	Table,
	TableOptions,
	TableState,
	VisibilityState,
} from "@tanstack/react-table";
import type { Checkbox } from "@rap/components-ui/checkbox";
import type { EmptyProps } from "./components/empty";
import type { PaginationProps } from "../pagination";
import type * as React from "react";
import type { ComponentType, CSSProperties, HTMLAttributes, ReactNode } from "react";

export type DataGridMode = "remote" | "local";
export type DataGridRowKey<TData> = string | ((record: TData, index: number, parent?: Row<TData>) => string);
export type DataGridScroll = { x?: number | string; y?: number | string };
export type DataGridScrollInfo = { scrollLeft: number; scrollTop: number };

export type CustomizeComponent<P = HTMLAttributes<HTMLElement>> = ComponentType<P> | string;

export type CustomizeScrollBody<RecordType> = (props: {
	table: Table<RecordType>;
	rows: Row<RecordType>[];
	scrollElement: HTMLElement | null;
	children: ReactNode;
}) => ReactNode;

export interface GridComponents<RecordType> {
	table?: CustomizeComponent<HTMLAttributes<HTMLElement>>;
	header?: {
		wrapper?: CustomizeComponent<HTMLAttributes<HTMLElement>>;
		row?: CustomizeComponent<HTMLAttributes<HTMLElement>>;
		cell?: CustomizeComponent<HTMLAttributes<HTMLElement>>;
	};
	body?:
		| CustomizeScrollBody<RecordType>
		| {
				wrapper?: CustomizeComponent<HTMLAttributes<HTMLElement>>;
				row?: CustomizeComponent<HTMLAttributes<HTMLElement>>;
				cell?: CustomizeComponent<HTMLAttributes<HTMLElement>>;
		  };
}

export interface DataGridFilterOption {
	label: ReactNode;
	value: string | number | boolean;
}

export interface DataGridFilterMeta<TData, TValue> {
	/** Remote field name. Defaults to the column id. */
	key?: string;
	/** Built-in dropdown style. Custom rendering can still be supplied with render. */
	type?: "input" | "checkbox" | "radio" | "custom" | "text" | "number" | "date" | "select" | "multiSelect";
	options?: DataGridFilterOption[];
	render?: (ctx: { column: Column<TData, TValue>; table: Table<TData> }) => ReactNode;
}

export interface DataGridSortMeta<TData, TValue> {
	/** Remote field name. Defaults to the column id. */
	key?: string;
	render?: (ctx: { column: Column<TData, TValue>; table: Table<TData> }) => ReactNode;
}

export interface DataGridColumnMeta<TData, TValue> {
	/** Initial visibility. Controlled visibility should use columnVisibility. */
	visible?: boolean;
	/** Initial pinned position. Runtime pinning state should use columnPinning. */
	pinned?: ColumnPinningPosition;
	/** Ant Design compatible text truncation behavior. */
	ellipsis?: boolean | { showTitle?: boolean };
	filter?: DataGridFilterMeta<TData, TValue>;
	sort?: DataGridSortMeta<TData, TValue>;
	[key: string]: unknown;
}

declare module "@tanstack/react-table" {
	export interface ColumnMeta<TData extends RowData, TValue> extends DataGridColumnMeta<TData, TValue> {}
}

export interface DataGridSortingConfig {
	/** Defaults to remote. Local mode requires column sortingFn or TanStack defaults. */
	mode?: DataGridMode;
	value?: SortingState;
	defaultValue?: SortingState;
	enableMultiSort?: boolean;
	maxMultiSortColCount?: number;
	enableSortingRemoval?: boolean;
	onChange?: (sorting: SortingState, info: { column?: Column<unknown> }) => void;
}

export interface DataGridFilteringConfig {
	/** Defaults to remote. Local mode requires column filterFn or TanStack defaults. */
	mode?: DataGridMode;
	columnFilters?: ColumnFiltersState;
	defaultColumnFilters?: ColumnFiltersState;
	globalFilter?: unknown;
	defaultGlobalFilter?: unknown;
	onColumnFiltersChange?: (filters: ColumnFiltersState, info: { column?: Column<unknown> }) => void;
	onGlobalFilterChange?: (value: unknown) => void;
}

export interface DataGridPaginationConfig extends Omit<PaginationProps, "page" | "pageSize" | "onChange"> {
	/** Defaults to remote. Local mode slices the current data with TanStack pagination. */
	mode?: DataGridMode;
	page?: number;
	defaultPage?: number;
	pageSize?: number;
	defaultPageSize?: number;
	total?: number;
	onChange?: (page: number, pageSize: number) => void;
}

export interface DataGridRowSelectionConfig<TData> {
	type?: "checkbox" | "radio";
	selectedRowKeys?: string[];
	defaultSelectedRowKeys?: string[];
	/** Defaults to true. false links parent and child row selection. */
	checkStrictly?: boolean;
	hideSelectAll?: boolean;
	columnTitle?: ReactNode;
	columnWidth?: number;
	fixed?: ColumnPinningPosition;
	enableRowSelection?: (row: Row<TData>) => boolean;
	getCheckboxProps?: (record: TData) => Partial<React.ComponentProps<typeof Checkbox>>;
	onChange?: (selectedRowKeys: string[], selectedRows: TData[]) => void;
	onSelect?: (record: TData, selected: boolean, selectedRows: TData[]) => void;
	onSelectAll?: (selected: boolean, selectedRows: TData[], changeRows: TData[]) => void;
}

export interface DataGridExpandableConfig<TData> {
	expandedRowKeys?: string[];
	defaultExpandedRowKeys?: string[];
	getSubRows?: (record: TData, index: number) => TData[] | undefined;
	expandedRowRender?: (record: TData, index: number, row: Row<TData>) => ReactNode;
	rowExpandable?: (record: TData) => boolean;
	expandIcon?: (ctx: { expanded: boolean; row: Row<TData>; onExpand: () => void }) => ReactNode;
	expandColumnTitle?: ReactNode;
	expandColumnWidth?: number;
	indentSize?: number;
	fixed?: ColumnPinningPosition;
	onExpand?: (expanded: boolean, record: TData) => void;
	onExpandedRowsChange?: (expandedRowKeys: string[]) => void;
}

export interface DataGridContextMenuConfig<TData> {
	enable?: boolean;
	render?: (ctx: {
		type: "header" | "cell" | "row";
		table: Table<TData>;
		row?: Row<TData>;
		column?: Column<TData>;
		cell?: Cell<TData, unknown>;
		close: () => void;
	}) => ReactNode;
}

export interface DataGridFeatureColumnsConfig<TData> {
	/**
	 * Controls the order of built-in and custom feature columns before business columns.
	 * Built-in ids are "__rap_data_grid_expand__" and "__rap_data_grid_selection__".
	 */
	order?: string[];
	/** Custom feature columns, for example a row-dnd handle column. */
	columns?: ColumnDef<TData>[];
	/** Feature columns are pinned left by default so they stay before business pinned columns. */
	fixed?: ColumnPinningPosition | false;
}

export type DataGridElementProps = HTMLAttributes<HTMLElement> & {
	style?: CSSProperties;
	[key: `data-${string}`]: string | number | boolean | undefined;
};

export interface DataGridProps<TData> {
	columns: ColumnDef<TData>[];
	data: TData[];
	rowKey: DataGridRowKey<TData>;
	loading?: boolean;
	empty?: EmptyProps;
	border?: boolean;
	scroll?: DataGridScroll;
	onScroll?: (event: Event, info: DataGridScrollInfo) => void;
	components?: GridComponents<TData>;
	pagination?: DataGridPaginationConfig | false;
	sorting?: DataGridSortingConfig | false;
	filtering?: DataGridFilteringConfig | false;
	rowSelection?: DataGridRowSelectionConfig<TData> | false;
	expandable?: DataGridExpandableConfig<TData> | false;
	columnPinning?: {
		value?: ColumnPinningState;
		defaultValue?: ColumnPinningState;
		onChange?: (value: ColumnPinningState) => void;
	};
	rowPinning?: {
		value?: RowPinningState;
		defaultValue?: RowPinningState;
		onChange?: (value: RowPinningState) => void;
	};
	columnVisibility?: {
		value?: VisibilityState;
		defaultValue?: VisibilityState;
		onChange?: (value: VisibilityState) => void;
	};
	columnSizing?: {
		value?: ColumnSizingState;
		defaultValue?: ColumnSizingState;
		columnResizeMode?: "onChange" | "onEnd";
		onChange?: (value: ColumnSizingState) => void;
	};
	featureColumns?: DataGridFeatureColumnsConfig<TData>;
	contextMenu?: DataGridContextMenuConfig<TData> | false;
	onRow?: (record: TData, index: number, ctx: { row: Row<TData>; table: Table<TData> }) => DataGridElementProps;
	onCell?: (
		record: TData,
		index: number,
		ctx: { cell: Cell<TData, unknown>; row: Row<TData>; column: Column<TData>; table: Table<TData> },
	) => DataGridElementProps;
	onHeaderRow?: (
		columns: Header<TData, unknown>[],
		index: number,
		ctx: { headerGroup: HeaderGroup<TData>; table: Table<TData> },
	) => DataGridElementProps;
	onHeaderCell?: (
		column: Column<TData>,
		ctx: { header: Header<TData, unknown>; table: Table<TData> },
	) => DataGridElementProps;
}

export interface DataGridFeature<TData> {
	state?: Partial<TableState>;
	callbacks?: Partial<TableOptions<TData>>;
	tableOptions?: Partial<TableOptions<TData>>;
	api?: Record<string, unknown>;
	columnsBefore?: ColumnDef<TData>[];
	columnsAfter?: ColumnDef<TData>[];
}

export interface DataGridFeatureContext<TData> {
	data: TData[];
	rowKey: DataGridRowKey<TData>;
	getRowId: (record: TData, index: number, parent?: Row<TData>) => string;
}

export type DataGridTableCallbacks = {
	onSortingChange?: OnChangeFn<SortingState>;
	onColumnFiltersChange?: OnChangeFn<ColumnFiltersState>;
	onGlobalFilterChange?: OnChangeFn<unknown>;
	onPaginationChange?: OnChangeFn<PaginationState>;
	onRowSelectionChange?: OnChangeFn<RowSelectionState>;
	onColumnPinningChange?: OnChangeFn<ColumnPinningState>;
	onRowPinningChange?: OnChangeFn<RowPinningState>;
	onColumnVisibilityChange?: OnChangeFn<VisibilityState>;
	onColumnSizingChange?: OnChangeFn<ColumnSizingState>;
};
