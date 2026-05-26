import {
	type ColumnDef,
	type ColumnOrderState,
	type ColumnPinningState,
	getExpandedRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type RowSelectionState,
} from "@tanstack/react-table";
import { useMemo, useRef } from "react";
import type {
	DataGridExpandableConfig,
	DataGridFeature,
	DataGridFeatureContext,
	DataGridFilteringConfig,
	DataGridPaginationConfig,
	DataGridProps,
	DataGridSortingConfig,
	DataGridTableCallbacks,
} from "../types";
import { composeTableCallbacks } from "../utils/compose-table-callbacks";
import { useControllableState } from "@rap/hooks/use-controllable-state";
import { createExpandColumn, DATA_GRID_EXPAND_COLUMN_ID } from "./expand-column";
import { createSelectionColumn, DATA_GRID_SELECTION_COLUMN_ID } from "./selection-column";

const EMPTY_COLUMNS: ColumnDef<never>[] = [];

function keysToSelection(keys: string[] = []) {
	return keys.reduce<RowSelectionState>((state, key) => {
		state[key] = true;
		return state;
	}, {});
}

function selectionToKeys(selection: RowSelectionState) {
	return Object.keys(selection).filter((key) => selection[key]);
}

/**
 * Composes every optional DataGrid feature into one TanStack table contract.
 *
 * Each feature returns the same small shape: table state, TanStack callbacks,
 * table options, public api, and optional columns to insert before/after user
 * columns. The composer runs features in a fixed order so selection/expand
 * columns are always stable, and disabled features return an empty object rather
 * than default state. That matters for performance and correctness: TanStack only
 * receives state for features that are actually enabled, so turning on sorting
 * later cannot accidentally activate pagination, selection, or filtering work.
 *
 * Callback names can overlap. Instead of letting later features overwrite earlier
 * ones, `composeTableCallbacks` fans out the original TanStack updater to every
 * interested feature. This keeps feature hooks independent while still allowing
 * shared table events.
 */
export function useDataGridFeatures<TData>(
	props: DataGridProps<TData>,
	context: DataGridFeatureContext<TData>,
) {
	const expandFeature = useExpandableFeature(props.expandable, context);
	const selectionFeature = useRowSelectionFeature(props.rowSelection, context);
	const sortingFeature = useSortingFeature<TData>(props.sorting);
	const filteringFeature = useFilteringFeature<TData>(props.filtering);
	const paginationFeature = usePaginationFeature<TData>(props.pagination);
	const columnsBefore = useMemo(
		() =>
			orderFeatureColumns(
				[
					...(expandFeature.columnsBefore ?? []),
					...(selectionFeature.columnsBefore ?? []),
					...(props.featureColumns?.columns ?? []),
				],
				props.featureColumns?.order,
			),
		[
			expandFeature.columnsBefore,
			props.featureColumns?.columns,
			props.featureColumns?.order,
			selectionFeature.columnsBefore,
		],
	);
	const featureColumnIds = useMemo(
		() => columnsBefore.map((column) => getColumnId(column)).filter(Boolean),
		[columnsBefore],
	);
	const columnPinningFeature = useColumnPinningFeature(props, featureColumnIds);
	const rowPinningFeature = useRowPinningFeature(props);
	const columnVisibilityFeature = useColumnVisibilityFeature(props);
	const columnOrderingFeature = useColumnOrderingFeature(props);
	const columnSizingFeature = useColumnSizingFeature(props);
	const features = [
		{ ...expandFeature, columnsBefore: [] },
		{ ...selectionFeature, columnsBefore: [] },
		sortingFeature,
		filteringFeature,
		paginationFeature,
		columnPinningFeature,
		rowPinningFeature,
		columnVisibilityFeature,
		columnOrderingFeature,
		columnSizingFeature,
	] satisfies DataGridFeature<TData>[];

	const hasColumnsAfter = features.some((feature) => feature.columnsAfter?.length);
	const columnsAfter = hasColumnsAfter
		? features.flatMap((feature) => feature.columnsAfter ?? [])
		: (EMPTY_COLUMNS as ColumnDef<TData>[]);
	const state = Object.assign({}, ...features.map((feature) => feature.state));
	const tableOptions = Object.assign({}, ...features.map((feature) => feature.tableOptions));
	const api = Object.assign({}, ...features.map((feature) => feature.api));
	const callbacks = composeTableCallbacks(
		features.map((feature) => feature.callbacks as DataGridTableCallbacks | undefined),
	);

	return { columnsBefore, columnsAfter, state, tableOptions, callbacks, api };
}

function getColumnId(column: { id?: string } | { accessorKey?: string | number | symbol }) {
	return String(
		"id" in column && column.id
			? column.id
			: "accessorKey" in column && column.accessorKey
				? column.accessorKey
				: "",
	);
}

function applyPartialOrder(ids: string[], order?: string[]) {
	if (!order?.length) {
		return ids;
	}

	const idsSet = new Set(ids);
	const orderedIds = order.filter((id) => idsSet.has(id));
	const orderedIdsSet = new Set(orderedIds);
	const restIds = ids.filter((id) => !orderedIdsSet.has(id));

	return [...orderedIds, ...restIds];
}

function orderFeatureColumns<TData>(
	columns: DataGridFeature<TData>["columnsBefore"],
	order?: string[],
) {
	const items = columns ?? [];
	const defaultOrder = [DATA_GRID_EXPAND_COLUMN_ID, DATA_GRID_SELECTION_COLUMN_ID];
	const orderList = order?.length ? order : defaultOrder;
	const rank = new Map(orderList.map((id, index) => [id, index]));

	return [...items].sort((a, b) => {
		const aRank = rank.get(getColumnId(a));
		const bRank = rank.get(getColumnId(b));
		if (aRank == null && bRank == null) return 0;
		if (aRank == null) return 1;
		if (bRank == null) return -1;
		return aRank - bRank;
	});
}

function useSortingFeature<TData>(
	config: DataGridSortingConfig | false | undefined,
): DataGridFeature<TData> {
	const cfg = config === false ? undefined : config;
	const enabled = !!cfg;
	const currentColumnRef = useRef<string | undefined>(undefined);
	const [sorting, setSorting] = useControllableState({
		value: cfg?.value,
		defaultValue: cfg?.defaultValue ?? [],
	});

	if (!enabled) return {};

	return {
		state: { sorting },
		callbacks: {
			onSortingChange: (updater) => {
				const next = setSorting(
					typeof updater === "function" ? (previous) => updater(previous) : updater,
				);
				cfg?.onChange?.(next, { column: undefined });
				currentColumnRef.current = undefined;
			},
		},
		tableOptions: {
			manualSorting: (cfg?.mode ?? "remote") === "remote",
			enableMultiSort: cfg?.enableMultiSort ?? true,
			maxMultiSortColCount: cfg?.maxMultiSortColCount,
			enableSortingRemoval: cfg?.enableSortingRemoval ?? true,
			...((cfg?.mode ?? "remote") === "local" ? { getSortedRowModel: getSortedRowModel() } : {}),
		},
	};
}

function useFilteringFeature<TData>(
	config: DataGridFilteringConfig | false | undefined,
): DataGridFeature<TData> {
	const cfg = config === false ? undefined : config;
	const enabled = !!cfg;
	const [columnFilters, setColumnFilters] = useControllableState({
		value: cfg?.columnFilters,
		defaultValue: cfg?.defaultColumnFilters ?? [],
	});
	const [globalFilter, setGlobalFilter] = useControllableState<unknown>({
		value: cfg?.globalFilter,
		defaultValue: cfg?.defaultGlobalFilter,
	});

	if (!enabled) return {};

	return {
		state: { columnFilters, globalFilter },
		callbacks: {
			onColumnFiltersChange: (updater) => {
				const next = setColumnFilters(
					typeof updater === "function" ? (previous) => updater(previous) : updater,
				);
				cfg?.onColumnFiltersChange?.(next, { column: undefined });
			},
			onGlobalFilterChange: (updater) => {
				const next = setGlobalFilter(
					typeof updater === "function" ? (previous: unknown) => updater(previous) : updater,
				);
				cfg?.onGlobalFilterChange?.(next);
			},
		},
		tableOptions: {
			manualFiltering: (cfg?.mode ?? "remote") === "remote",
			...((cfg?.mode ?? "remote") === "local"
				? { getFilteredRowModel: getFilteredRowModel() }
				: {}),
		},
	};
}

function usePaginationFeature<TData>(
	config: DataGridPaginationConfig | false | undefined,
): DataGridFeature<TData> {
	const cfg = config === false ? undefined : config;
	const [pagination, setPagination] = useControllableState({
		value:
			cfg?.page != null || cfg?.pageSize != null
				? { pageIndex: (cfg.page ?? 1) - 1, pageSize: cfg.pageSize ?? cfg.defaultPageSize ?? 10 }
				: undefined,
		defaultValue: {
			pageIndex: (cfg?.defaultPage ?? 1) - 1,
			pageSize: cfg?.defaultPageSize ?? 10,
		},
		onChange: (value) => cfg?.onChange?.(value.pageIndex + 1, value.pageSize),
		isEqual: (a, b) => a.pageIndex === b.pageIndex && a.pageSize === b.pageSize,
	});

	if (!cfg) return {};

	return {
		state: { pagination },
		callbacks: {
			onPaginationChange: (updater) => {
				setPagination(typeof updater === "function" ? (previous) => updater(previous) : updater);
			},
		},
		tableOptions: {
			manualPagination: (cfg.mode ?? "remote") === "remote",
			...((cfg.mode ?? "remote") === "local"
				? { getPaginationRowModel: getPaginationRowModel() }
				: {}),
		},
	};
}

function useRowSelectionFeature<TData>(
	config: DataGridProps<TData>["rowSelection"],
	context: DataGridFeatureContext<TData>,
): DataGridFeature<TData> {
	const cfg = config || undefined;
	const selectionColumn = useMemo(() => (cfg ? createSelectionColumn(cfg) : undefined), [cfg]);
	const [rowSelection, setRowSelection] = useControllableState({
		value: cfg?.selectedRowKeys ? keysToSelection(cfg.selectedRowKeys) : undefined,
		defaultValue: keysToSelection(cfg?.defaultSelectedRowKeys),
		onChange: (value) => {
			const selectedKeys = selectionToKeys(value);
			const selectedRows = context.data.filter(
				(record: TData, index: number) => value[context.getRowId(record, index)],
			);
			cfg?.onChange?.(selectedKeys, selectedRows);
		},
	});

	if (!cfg) return {};

	/**
	 * TanStack already understands hierarchical row selection. We only expose
	 * Ant Design's `checkStrictly` naming: strict mode disables sub-row selection,
	 * while linked mode enables parent/child propagation and indeterminate states.
	 */
	return {
		columnsBefore: selectionColumn ? [selectionColumn] : [],
		state: { rowSelection },
		callbacks: {
			onRowSelectionChange: (updater) => {
				setRowSelection(typeof updater === "function" ? (previous) => updater(previous) : updater);
			},
		},
		tableOptions: {
			enableRowSelection: cfg.enableRowSelection ?? true,
			enableMultiRowSelection: (cfg.type ?? "checkbox") !== "radio",
			enableSubRowSelection: cfg.checkStrictly === false,
		},
	};
}

function useExpandableFeature<TData>(
	config: DataGridExpandableConfig<TData> | false | undefined,
	_context: DataGridFeatureContext<TData>,
): DataGridFeature<TData> {
	const cfg = config || undefined;
	const expandColumn = useMemo(() => (cfg ? createExpandColumn(cfg) : undefined), [cfg]);
	const [expanded, setExpanded] = useControllableState({
		value: cfg?.expandedRowKeys
			? cfg.expandedRowKeys.reduce<Record<string, boolean>>((state, key) => {
				state[key] = true;
				return state;
			}, {})
			: undefined,
		defaultValue: (cfg?.defaultExpandedRowKeys ?? []).reduce<Record<string, boolean>>(
			(state, key) => {
				state[key] = true;
				return state;
			},
			{},
		),
		onChange: (value) => {
			if (typeof value === "boolean") return;
			cfg?.onExpandedRowsChange?.(Object.keys(value).filter((key) => value[key]));
		},
	});

	if (!cfg) return {};

	return {
		columnsBefore: expandColumn ? [expandColumn] : [],
		state: { expanded },
		callbacks: {
			onExpandedChange: (updater) => {
				setExpanded(
					typeof updater === "function"
						? (previous) => updater(previous) as Record<string, boolean>
						: (updater as Record<string, boolean>),
				);
			},
		},
		tableOptions: {
			getSubRows: cfg.getSubRows,
			getExpandedRowModel: getExpandedRowModel(),
			getRowCanExpand: (row) =>
				!!cfg.expandedRowRender ||
				!!cfg.getSubRows?.(row.original, row.index)?.length ||
				(cfg.rowExpandable?.(row.original) ?? false),
		},
	};
}

function useColumnPinningFeature<TData>(
	props: DataGridProps<TData>,
	featureColumnIds: string[],
): DataGridFeature<TData> {
	const initialPinning = useMemo(() => {
		const left: string[] = [];
		const right: string[] = [];
		for (const column of props.columns) {
			const id = String(column.id ?? ("accessorKey" in column ? column.accessorKey : ""));
			if (!id) continue;
			if (column.meta?.pinned === "left") left.push(id);
			if (column.meta?.pinned === "right") right.push(id);
		}
		const leftFeatureColumns =
			props.featureColumns?.fixed === false || props.featureColumns?.fixed === "right"
				? []
				: featureColumnIds;
		const rightFeatureColumns = props.featureColumns?.fixed === "right" ? featureColumnIds : [];
		return {
			left: applyPartialOrder(
				[...leftFeatureColumns, ...left.filter((id) => !leftFeatureColumns.includes(id))],
				props.columnPinning?.leftOrder,
			),
			right: applyPartialOrder(
				[...right.filter((id) => !rightFeatureColumns.includes(id)), ...rightFeatureColumns],
				props.columnPinning?.rightOrder,
			),
		};
	}, [
		featureColumnIds,
		props.columnPinning?.leftOrder,
		props.columnPinning?.rightOrder,
		props.columns,
		props.featureColumns?.fixed,
	]);
	const [columnPinning, setColumnPinning] = useControllableState({
		value: props.columnPinning?.value,
		defaultValue: props.columnPinning?.defaultValue ?? initialPinning,
		onChange: props.columnPinning?.onChange,
	});
	const normalizedColumnPinning = useMemo(
		() => normalizeGroupedColumnPinning(columnPinning, props.columns),
		[columnPinning, props.columns],
	);

	return {
		state: { columnPinning: normalizedColumnPinning },
		callbacks: {
			onColumnPinningChange: (updater) =>
				setColumnPinning((previous) =>
					normalizeGroupedColumnPinning(
						typeof updater === "function" ? updater(previous) : updater,
						props.columns,
					),
				),
		},
		tableOptions: { enableColumnPinning: true },
	};
}

function normalizeGroupedColumnPinning<TData>(
	columnPinning: ColumnPinningState,
	columns: ColumnDef<TData>[],
): ColumnPinningState {
	const leafOrder = getLeafColumnIds(columns);
	const left = new Set(columnPinning.left ?? []);
	const right = new Set(columnPinning.right ?? []);

	forEachColumnGroup(columns, (leafIds) => {
		const leftCount = leafIds.filter((id) => left.has(id)).length;
		const rightCount = leafIds.filter((id) => right.has(id)).length;

		if (leftCount === 0 && rightCount === 0) {
			return;
		}

		const side = rightCount > leftCount ? "right" : "left";

		for (const id of leafIds) {
			left.delete(id);
			right.delete(id);
		}
		for (const id of leafIds) {
			if (side === "right") {
				right.add(id);
			} else {
				left.add(id);
			}
		}
	});

	return {
		left: orderPinnedIds(left, leafOrder),
		right: orderPinnedIds(right, leafOrder),
	};
}

function forEachColumnGroup<TData>(
	columns: ColumnDef<TData>[],
	callback: (leafIds: string[]) => void,
) {
	for (const column of columns) {
		const children = (column as { columns?: ColumnDef<TData>[] }).columns;

		if (!children?.length) {
			continue;
		}

		const leafIds = getLeafColumnIds(children);
		if (leafIds.length > 1) {
			callback(leafIds);
		}
		forEachColumnGroup(children, callback);
	}
}

function getLeafColumnIds<TData>(columns: ColumnDef<TData>[]): string[] {
	const leafIds: string[] = [];

	for (const column of columns) {
		const children = (column as { columns?: ColumnDef<TData>[] }).columns;
		if (children?.length) {
			leafIds.push(...getLeafColumnIds(children));
			continue;
		}

		const id = getColumnId(column);
		if (id) {
			leafIds.push(id);
		}
	}

	return leafIds;
}

function orderPinnedIds(ids: Set<string>, leafOrder: string[]) {
	const knownIds = leafOrder.filter((id) => ids.has(id));
	const unknownIds = [...ids].filter((id) => !leafOrder.includes(id));
	return [...knownIds, ...unknownIds];
}

function useRowPinningFeature<TData>(props: DataGridProps<TData>): DataGridFeature<TData> {
	const [rowPinning, setRowPinning] = useControllableState({
		value: props.rowPinning?.value,
		defaultValue: props.rowPinning?.defaultValue ?? { top: [], bottom: [] },
		onChange: props.rowPinning?.onChange,
	});

	return {
		state: { rowPinning },
		callbacks: {
			onRowPinningChange: (updater) =>
				setRowPinning(typeof updater === "function" ? (previous) => updater(previous) : updater),
		},
		tableOptions: { enableRowPinning: !!props.rowPinning },
	};
}

function useColumnVisibilityFeature<TData>(props: DataGridProps<TData>): DataGridFeature<TData> {
	const initialVisibility = useMemo(() => {
		const state: Record<string, boolean> = {};
		for (const column of props.columns) {
			const id = String(column.id ?? ("accessorKey" in column ? column.accessorKey : ""));
			if (id && column.meta?.visible === false) state[id] = false;
		}
		return state;
	}, [props.columns]);
	const [columnVisibility, setColumnVisibility] = useControllableState({
		value: props.columnVisibility?.value,
		defaultValue: props.columnVisibility?.defaultValue ?? initialVisibility,
		onChange: props.columnVisibility?.onChange,
	});

	return {
		state: { columnVisibility },
		callbacks: {
			onColumnVisibilityChange: (updater) =>
				setColumnVisibility(
					typeof updater === "function" ? (previous) => updater(previous) : updater,
				),
		},
		tableOptions: { enableHiding: true },
	};
}

function useColumnOrderingFeature<TData>(props: DataGridProps<TData>): DataGridFeature<TData> {
	const cfg = props.columnOrdering === false ? undefined : props.columnOrdering;
	const enabled = props.columnOrdering !== false && cfg?.enabled !== false;
	const [columnOrder, setColumnOrder] = useControllableState<ColumnOrderState>({
		value: cfg?.value,
		defaultValue: cfg?.defaultValue ?? [],
		onChange: cfg?.onChange,
		isEqual: isSameOrder,
	});

	if (!enabled) return {};

	return {
		state: { columnOrder },
		callbacks: {
			onColumnOrderChange: (updater) =>
				setColumnOrder(typeof updater === "function" ? (previous) => updater(previous) : updater),
		},
	};
}

function useColumnSizingFeature<TData>(props: DataGridProps<TData>): DataGridFeature<TData> {
	const [columnSizing, setColumnSizing] = useControllableState({
		value: props.columnSizing?.value,
		defaultValue: props.columnSizing?.defaultValue ?? {},
		onChange: props.columnSizing?.onChange,
	});

	return {
		state: { columnSizing },
		callbacks: {
			onColumnSizingChange: (updater) =>
				setColumnSizing(typeof updater === "function" ? (previous) => updater(previous) : updater),
		},
		tableOptions: {
			enableColumnResizing: !!props.columnSizing,
			columnResizeMode: props.columnSizing?.columnResizeMode ?? "onChange",
		},
	};
}

function isSameOrder(left: ColumnOrderState, right: ColumnOrderState) {
	return left.length === right.length && left.every((id, index) => id === right[index]);
}
