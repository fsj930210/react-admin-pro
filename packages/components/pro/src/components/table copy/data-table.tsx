"use client"

import { type Table, useReactTable, type Column } from "@tanstack/react-table"
import { createContext, use, useEffect, useMemo, useState, useRef, type ReactNode, type RefObject } from "react"

import type {
	ColumnDef,
	ColumnFiltersState,
	ColumnPinningState,
	SortingState,
	VisibilityState,
	PaginationState,
	ColumnSizingState,
	Row,
	ColumnPinningPosition,
	RowPinningState,
	AccessorKeyColumnDef,
} from "@tanstack/react-table"

import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel
} from "@tanstack/react-table"
import { Table as TableComponent } from "@rap/components-ui/table"
import { DataTableHeader } from "./table-header"
import { DataTableBody } from "./table-body"
import { DataTableFooter } from "./table-footer"
import { DataTablePagination } from "./pagination"
import { createRowSelectionColumn } from "./column/row-selection-column"
import { createRowSortColumn } from "./column/row-sort-column"
import type { PaginationProps } from "../pagination"
import { ROW_SELECTION_COLUMN, ROW_SORT_COLUMN } from "./utils/constants"


import { DragDropProvider } from "@dnd-kit/react"
import { arrayMove, move } from '@dnd-kit/helpers'
export type ColumnMeta = any;




interface TableContextValue<TData = any> {
	table: Table<TData>
	expanded?: Record<string, boolean>
	enableMultiSort?: boolean;
	currentSortColumnRef?: RefObject<Column<TData> | undefined>;
	currentFilterColumnRef?: RefObject<Column<TData> | undefined>;
	toggleExpanded?: (rowId: string) => void
	getSubRowData?: (row: TData) => unknown[]
	renderSubRow?: (row: TData, subRowData: unknown[]) => ReactNode;
	enableRowOrder?: boolean;
	enableColumnOrder?: boolean;
}

export const TableContext = createContext<TableContextValue | null>(null)

export interface SortingType<TData> {
	// enableLocalSort?: boolean;
	maxMultiSortColCount?: number
	enableMultiSort?: boolean;
	enableSortingRemoval?: boolean;
	onChange?: (sorting: SortingState, currentSortColumn: Column<TData>) => void
}
export interface FilterType<TData> {
	// enableLocalColumnFilter?: boolean;
	onChange?: (filtering: ColumnFiltersState, currentFilterColumn: Column<TData>) => void
}
export interface RowSelectionType<TData> {
	type: 'checkbox' | 'radio';
	title?: string;
	size?: number;
	pinning?: ColumnPinningPosition;
	enableSelectAll?: boolean;
	enable?: boolean;
	enableRowSelection?: (row: Row<TData>) => boolean;
	enableSubRowSelection?: (row: Row<TData>) => boolean | boolean;
	onChange?: (selectedRowKeys: string[], selectedRows: TData[]) => void;
	onSelectAll?: (selected: boolean, selectedRows: TData[], changeRows: TData[]) => void;
	onSelect?: (row: TData, selected: boolean, selectedRows: TData[]) => void;
}
export interface ColumnOrderType<TData> {
	enable?: boolean;
	onChange?: (columns: ColumnDef<TData>[]) => void
}

export interface ColumnPinningType {
	enable?: boolean;
	onChange?: (pinning: ColumnPinningState) => void
}
export interface ColumnVisibilityType {
	enable?: boolean;
	onChange?: (visibility: VisibilityState) => void
}
export interface ColumnSizingType {
	enable?: boolean;
	columnResizeMode?: 'onChange' | 'onEnd';
	onChange?: (sizing: ColumnSizingState) => void
}
export interface ColumnConfig<TData> {
	pinning?: ColumnPinningType;
	visibility?: ColumnVisibilityType;
	order?: ColumnOrderType<TData>;
	filter?: FilterType<TData>;
	sorting?: SortingType<TData>;
	sizing?: ColumnSizingType;
	rowSelection?: RowSelectionType<TData>;
}
export interface RowOrderType<TData> {
	enable?: boolean;
	pinning?: ColumnPinningPosition;
	onChange?: (newData: TData[]) => void
}
export interface RowPinningType {
	enable?: boolean;
	keepPinnedRows?: boolean;

	onChange?: (pinning: RowPinningState) => void
}
export interface RowConfig<TData> {
	order?: RowOrderType<TData>;
	pinning?: RowPinningType;
}
export interface DataTableProps<TData> {
	columns: ColumnDef<TData>[]
	data: TData[]
	children?: ReactNode;
	pagination?: PaginationProps & { enableLocalPagination?: boolean } | false;
	columnConfig?: ColumnConfig<TData>;
	rowConfig?: RowConfig<TData>;
	loading?: boolean;
	rowKey: string | ((row: TData, index: number, parentRow?: Row<TData>) => string);
	getSubRowData?: (row: TData) => unknown[];
	renderSubRow?: (row: TData, subRowData: unknown[]) => ReactNode;
	direction?: 'ltr' | 'rtl';
}

export function DataTable<TData>({
	columns: userColumns,
	data,
	children,
	pagination: paginationProps,
	columnConfig,
	rowConfig,
	rowKey,
	getSubRowData,
	renderSubRow,
	direction = 'ltr',
}: DataTableProps<TData>) {
	const defaultColumnConfig: ColumnConfig<TData> = {
		pinning: {
			enable: true,
		},
		visibility: {
			enable: true,
		},
		order: {
			enable: false,
		},
		sorting: {
			enableMultiSort: true,
			enableSortingRemoval: true,
		},
		sizing: {
			enable: false,
		},
		rowSelection: {
			enable: false,
			title: '',
			type: 'checkbox',
			enableSelectAll: true,
		},
	}
	const defaultRowConfig: RowConfig<TData> = {
		order: {
			enable: false,
		},
		pinning: {
			enable: false,
		},
	}
	const defaultPaginationProps: DataTableProps<TData>['pagination'] = {
		enableLocalPagination: false,
		pageSizeOptions: [10, 20, 40, 60, 80, 100],
	}

	const mergedPaginationProps = paginationProps === false
		? false
		: { ...defaultPaginationProps, ...paginationProps }

	const mergedColumnConfig = {
		...defaultColumnConfig,
		...columnConfig,
		pinning: { ...defaultColumnConfig.pinning, ...columnConfig?.pinning },
		visibility: { ...defaultColumnConfig.visibility, ...columnConfig?.visibility },
		order: { ...defaultColumnConfig.order, ...columnConfig?.order },
		sorting: { ...defaultColumnConfig.sorting, ...columnConfig?.sorting },
		sizing: { ...defaultColumnConfig.sizing, ...columnConfig?.sizing },
		rowSelection: { ...defaultColumnConfig.rowSelection, ...columnConfig?.rowSelection },
		filter: { ...defaultColumnConfig.filter, ...columnConfig?.filter },
	}

	const mergedRowConfig = {
		...defaultRowConfig,
		...rowConfig,
		order: { ...defaultRowConfig.order, ...rowConfig?.order },
		pinning: { ...defaultRowConfig.pinning, ...rowConfig?.pinning },
	}

	const previousColumnsRef = useRef<ColumnDef<TData>[]>([])
	const columns = useMemo(() => {
		const columns = userColumns.map(col => {
			return { ...col, id: col.id || (col as AccessorKeyColumnDef<TData>).accessorKey }
		}) as ColumnDef<TData>[]
		if (mergedColumnConfig.rowSelection?.enable) {
			columns.unshift(createRowSelectionColumn(mergedColumnConfig.rowSelection as RowSelectionType<TData>))
		}
		if (mergedRowConfig.order?.enable) {
			columns.unshift(createRowSortColumn())
		}
		const prev = previousColumnsRef.current
		const sameLength = columns.length === previousColumnsRef.current.length
		const sameIds = sameLength && columns.every((col, index) => col.id === prev[index].id)
		if (sameIds) {
			return prev
		}
		previousColumnsRef.current = columns as ColumnDef<TData>[]
		return columns
	}, [userColumns, mergedColumnConfig.rowSelection?.enable, mergedRowConfig.order?.enable])

	const rowSelectionProps = mergedColumnConfig.rowSelection
	const sortingProps = mergedColumnConfig.sorting
	const filterProps = mergedColumnConfig.filter
	const onColumnPinningChange = mergedColumnConfig.pinning?.onChange
	const onColumnOrderChange = mergedColumnConfig.order?.onChange
	const onColumnVisibilityChange = mergedColumnConfig.visibility?.onChange

	const pinnedIds = useMemo(() => {
		const isRtl = direction === 'rtl';
		const startPin = isRtl ? 'right' : 'left';
		const endPin = isRtl ? 'left' : 'right';

		const autoStartColumns = [ROW_SORT_COLUMN, ROW_SELECTION_COLUMN].filter(colId =>
			columns.some(col => col.id === colId)
		);

		const userPinnedIds = columns
			.filter(col => col?.meta?.pinning === startPin || col?.meta?.pinning === endPin)
			.map(col => String(col.id));

		return [...new Set([...autoStartColumns, ...userPinnedIds])];
	}, [columns, direction])

	const [columnOrder, setColumnOrder] = useState<string[]>(() => {
		const isRtl = direction === 'rtl';
		const startPin = isRtl ? 'right' : 'left';
		const endPin = isRtl ? 'left' : 'right';

		return columns.filter(col => !col.meta || (col?.meta?.pinning !== startPin && col?.meta?.pinning !== endPin)).map(col => String(col.id))
	})
	// 数据排序
	const [sorting, setSorting] = useState<SortingState>([])
	// 数据过滤
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	// 列可见
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
		const initialVisibility: VisibilityState = {}
		columns.forEach(col => {
			const colId = col.id;
			const visible = col?.meta?.visible
			if (visible === false) {
				initialVisibility[String(colId)] = false
			}
		})
		return initialVisibility
	})
	// 行选择
	const [rowSelection, setRowSelection] = useState({})
	// 列固定
	const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(() => {
		const isRtl = direction === 'rtl';
		const startPin = isRtl ? 'right' : 'left';
		const endPin = isRtl ? 'left' : 'right';

		const userStartPinnedIds = columns
			.filter(col => col?.meta?.pinning === startPin)
			.map(col => String(col.id));

		const userEndPinnedIds = columns
			.filter(col => col?.meta?.pinning === endPin)
			.map(col => String(col.id));

		let startIds = userStartPinnedIds;
		let endIds = userEndPinnedIds;

		const autoStartColumns = [ROW_SORT_COLUMN, ROW_SELECTION_COLUMN].filter(colId =>
			columns.some(col => col.id === colId)
		);

		if (userStartPinnedIds.length > 0 && autoStartColumns.length > 0) {
			startIds = [...new Set([...autoStartColumns, ...userStartPinnedIds])];
		}

		if (userEndPinnedIds.length > 0) {
			const autoEndColumns: string[] = [];
			endIds = [...new Set([...userEndPinnedIds, ...autoEndColumns])];
		}

		return {
			[startPin]: startIds,
			[endPin]: endIds,
		}
	})

	// 展开行
	const [expanded, setExpanded] = useState<Record<string, boolean>>({})
	// 列resize
	const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
	// 分页
	const [pagination, setPagination] = useState<PaginationState>({
		pageIndex: mergedPaginationProps !== false && mergedPaginationProps?.page != null ? mergedPaginationProps.page - 1 : 0,
		pageSize: mergedPaginationProps !== false && mergedPaginationProps?.pageSize != null ? mergedPaginationProps.pageSize : 10,
	})
	// 变化的排序列
	const currentSortColumnRef = useRef<Column<TData> | undefined>(undefined)
	// 变化的过滤列
	const currentFilterColumnRef = useRef<Column<TData> | undefined>(undefined)

	const handleColumnPinningChange = (updater: ((prev: ColumnPinningState) => ColumnPinningState) | ColumnPinningState) => {
		const newPinning = typeof updater === "function" ? updater(columnPinning) : updater
		setColumnPinning(newPinning)
		onColumnPinningChange?.(newPinning)
	}
	const enableLocalPagination = (mergedPaginationProps !== false && mergedPaginationProps?.enableLocalPagination) ?? false;

	const getRowIdFromKey = (row: TData): string => {
		if (typeof rowKey === "function") {
			return rowKey(row, 0);
		}
		return String((row as Record<string, unknown>)[rowKey]);
	};

	const [internalData, setInternalData] = useState<TData[]>(data)

	useEffect(() => {
		setInternalData(data)
	}, [data])

	const initialDragSnapshot = useRef<{ columnOrder: string[]; data: TData[] }>({ columnOrder, data: internalData })

	const table = useReactTable({
		data: internalData,
		columns: columns as ColumnDef<TData>[],
		columnResizeMode: "onChange",
		enableColumnResizing: true,
		autoResetPageIndex: false,
		manualPagination: !enableLocalPagination,
		enableRowSelection: rowSelectionProps?.enableRowSelection,
		enableMultiRowSelection: rowSelectionProps?.type === 'checkbox',
		enableSubRowSelection: rowSelectionProps?.enableSubRowSelection,
		getRowId: typeof rowKey === "function" ? rowKey : (row: TData) => String((row as Record<string, string | number>)[rowKey]),
		getCoreRowModel: getCoreRowModel(),
		filterFns: {
			dataGridFilter: () => true,
			dataGridGlobalFuzzy: () => true,
		},
		...(enableLocalPagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
		getSortedRowModel: getSortedRowModel(),
		enableMultiSort: sortingProps?.enableMultiSort ?? false,
		maxMultiSortColCount: sortingProps?.maxMultiSortColCount,
		enableSortingRemoval: sortingProps?.enableSortingRemoval ?? false,
		onColumnOrderChange: (updater) => {
			const newColumnOrder = typeof updater === "function" ? updater(columnOrder) : updater
			setColumnOrder(newColumnOrder)
			const reorderedColumns = newColumnOrder.map(columnId =>
				userColumns.find(col => col.id === columnId)
			).filter(Boolean) as ColumnDef<TData, unknown>[]
			onColumnOrderChange?.(reorderedColumns)
		},
		onSortingChange: (updater) => {
			const newSorting = typeof updater === "function" ? updater(sorting) : updater
			const currentSortColumn = currentSortColumnRef.current;
			currentSortColumnRef.current = undefined;
			setSorting(newSorting)
			sortingProps?.onChange?.(newSorting, currentSortColumn as Column<TData, unknown>)
		},
		onColumnFiltersChange: (updater) => {
			const newFilters = typeof updater === "function" ? updater(columnFilters) : updater
			const currentFilterColumn = currentFilterColumnRef.current;
			currentFilterColumnRef.current = undefined;
			setColumnFilters(newFilters)
			filterProps?.onChange?.(newFilters, currentFilterColumn as Column<TData, unknown>)
		},
		onPaginationChange: setPagination,
		onColumnSizingChange: setColumnSizing,
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: (updater) => {
			const newVisibility = typeof updater === "function" ? updater(columnVisibility) : updater
			setColumnVisibility(newVisibility)
			onColumnVisibilityChange?.(newVisibility)
		},
		onRowSelectionChange: (updater) => {
			const newRowSelection = typeof updater === "function" ? updater(rowSelection) : updater
			setRowSelection(newRowSelection)
			if (rowSelectionProps?.onChange) {
				const selectedKeys = Object.keys(newRowSelection).filter(key => newRowSelection[key])
				const selectedRows = data.filter((_, index) => selectedKeys.includes(String(index)))
				rowSelectionProps.onChange(selectedKeys, selectedRows)
			}
		},
		onColumnPinningChange: handleColumnPinningChange,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			columnPinning,
			columnSizing,
			pagination,
			columnOrder,
		},
	})



	const toggleExpanded = (rowId: string) => {
		setExpanded((prev) => ({
			...prev,
			[rowId]: !prev[rowId],
		}))
	}

	const value = {
		table: table,
		expanded,
		currentSortColumnRef,
		currentFilterColumnRef,
		enableMultiSort: sortingProps?.enableMultiSort ?? false,
		toggleExpanded,
		getSubRowData: getSubRowData as TableContextValue["getSubRowData"],
		renderSubRow: renderSubRow as TableContextValue["renderSubRow"],
		enableRowOrder: mergedRowConfig.order?.enable ?? false,
		enableColumnOrder: mergedColumnConfig.order?.enable ?? false,
	}


	return (

		<TableContext value={value}>
			<DragDropProvider
				onDragStart={() => {
					initialDragSnapshot.current = {
						columnOrder,
						data: internalData,
					};
				}}
				onDragOver={(event) => {
					const { source } = event.operation;
					if (source?.type === 'column') {
						setColumnOrder((order) => {
							const nonPinnedOrder = order.filter(id => !pinnedIds.includes(id));
							const reorderedNonPinned = move(nonPinnedOrder, event);
							const result: string[] = [];
							const pinnedLeft = columnPinning.left || [];
							const pinnedRight = columnPinning.right || [];
							pinnedLeft.forEach(id => result.push(id));
							reorderedNonPinned.forEach(id => result.push(id));
							pinnedRight.forEach(id => result.push(id));
							return result;
						});
					} else {
						setInternalData((rows) => {
							const { source, target } = event.operation;
							if (!target) return rows;

							const sourceId = source?.id;
							const targetId = target?.id;

							const sourceIndex = rows.findIndex((_, idx) => getRowIdFromKey(rows[idx]) === sourceId);
							const targetIndex = rows.findIndex((_, idx) => getRowIdFromKey(rows[idx]) === targetId);

							if (sourceIndex === -1 || targetIndex === -1 || sourceIndex === targetIndex) {
								return rows;
							}

							return arrayMove(rows, sourceIndex, targetIndex);
						});
					}
				}}
				onDragEnd={(event) => {
					if (event.canceled) {
						setColumnOrder(initialDragSnapshot.current.columnOrder);
						setInternalData(initialDragSnapshot.current.data);
					}
				}}
			>
				<TableComponent
					style={{
						width: table.getCenterTotalSize(),
					}}
				>
					<DataTableHeader table={table} />
					<DataTableBody table={table} rowKey={rowKey} />
					<DataTableFooter table={table} />
				</TableComponent>
			</DragDropProvider>
			{
				mergedPaginationProps === false ? null : (
					<DataTablePagination
						{...mergedPaginationProps}
						page={mergedPaginationProps?.page ?? pagination.pageIndex + 1}
						pageSize={mergedPaginationProps?.pageSize ?? pagination.pageSize}
						total={mergedPaginationProps?.total ?? table.getFilteredRowModel().rows.length}
					/>
				)
			}
			{children}

		</TableContext>
	)
}

export function useDataTable<TData = any>() {
	const context = use(TableContext) as TableContextValue<TData> | null
	if (!context) {
		throw new Error("useDataTable must be used within a DataTable component")
	}
	return context
}
