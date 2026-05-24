import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ColumnDef, ColumnFiltersState, PaginationState, SortingState, VisibilityState } from "@tanstack/react-table";
import type {
	DataGridDataResult,
	DataGridFieldPath,
	DataGridLoadFilter,
	DataGridLoadParams,
	DataGridLoadSort,
	DataGridMode,
} from "../types";
import { normalizeFilterValue } from "../utils/filtering";

interface UseDataGridLoaderOptions<TData, TRaw> {
	columns: ColumnDef<TData>[];
	dataLoad?: (params: DataGridLoadParams) => Promise<TRaw>;
	transformData?: (raw: TRaw) => DataGridDataResult<TData>;
	dataField?: DataGridFieldPath;
	totalField?: DataGridFieldPath;
	updateData: (data: TData[]) => void;
	sortingState?: SortingState;
	columnFilters?: ColumnFiltersState;
	globalFilter?: unknown;
	columnVisibility?: VisibilityState;
	pagination?: PaginationState;
	sortingMode?: DataGridMode;
	filteringMode?: DataGridMode;
	paginationMode?: DataGridMode;
}

export function useDataGridLoader<TData, TRaw = unknown>({
	columns,
	dataLoad,
	transformData,
	dataField = "data",
	totalField = ["pagination", "total"],
	updateData,
	sortingState = [],
	columnFilters = [],
	globalFilter,
	columnVisibility = {},
	pagination = { pageIndex: 0, pageSize: 10 },
	sortingMode = "remote",
	filteringMode = "remote",
	paginationMode = "remote",
}: UseDataGridLoaderOptions<TData, TRaw>) {
	const [loading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);
	const requestIdRef = useRef(0);
	const dataLoadRef = useRef(dataLoad);
	const transformDataRef = useRef(transformData);
	const dataFieldRef = useRef(dataField);
	const totalFieldRef = useRef(totalField);
	const updateDataRef = useRef(updateData);

	useEffect(() => {
		dataLoadRef.current = dataLoad;
		transformDataRef.current = transformData;
		dataFieldRef.current = dataField;
		totalFieldRef.current = totalField;
		updateDataRef.current = updateData;
	}, [dataField, dataLoad, totalField, transformData, updateData]);

	const leafColumnMeta = useMemo(() => getLeafColumnMeta(columns), [columns]);

	const params = useMemo<DataGridLoadParams>(() => ({
		page: pagination.pageIndex + 1,
		pageSize: pagination.pageSize,
		sorting: sortingMode === "remote"
			? sortingState.map<DataGridLoadSort>((sort) => ({
					id: sort.id,
					key: leafColumnMeta.get(sort.id)?.sort?.key ?? sort.id,
					desc: sort.desc,
					order: sort.desc ? "desc" : "asc",
				}))
			: [],
		filters: filteringMode === "remote"
			? columnFilters.flatMap<DataGridLoadFilter>((filter) => {
					const meta = leafColumnMeta.get(filter.id);
					const normalized = normalizeFilterValue(filter.value);
					const conditions = normalized.conditions?.filter(Boolean) ?? [];

					if (conditions.length) {
						return conditions.map((condition) => ({
							id: filter.id,
							key: meta?.filter?.key ?? filter.id,
							value: condition?.value,
							operator: condition?.operator,
							join: normalized.join,
						}));
					}

					return [{
						id: filter.id,
						key: meta?.filter?.key ?? filter.id,
						value: normalized.value ?? filter.value,
						join: normalized.join,
					}];
				})
			: [],
		globalFilter,
		pagination,
		columnFilters,
		sortingState,
		columnVisibility,
	}), [
		columnFilters,
		columnVisibility,
		filteringMode,
		globalFilter,
		leafColumnMeta,
		pagination,
		sortingMode,
		sortingState,
	]);

	const reload = useCallback(async () => {
		const load = dataLoadRef.current;
		if (!load) return;

		const requestId = requestIdRef.current + 1;
		requestIdRef.current = requestId;
		setLoading(true);

		try {
			const raw = await load(params);
			if (requestId !== requestIdRef.current) return;

			const result = transformDataRef.current
				? transformDataRef.current(raw)
				: mapRawData<TData>(raw, dataFieldRef.current, totalFieldRef.current);

			updateDataRef.current(result.data);
			setTotal(result.pagination?.total ?? result.data.length);
		} finally {
			if (requestId === requestIdRef.current) {
				setLoading(false);
			}
		}
	}, [params]);

	useEffect(() => {
		if (dataLoadRef.current) {
			void reload();
		}
	}, [filteringMode, paginationMode, reload, sortingMode]);

	return {
		loading,
		total,
		params,
		reload,
	};
}

function mapRawData<TData>(
	raw: unknown,
	dataField: DataGridFieldPath,
	totalField: DataGridFieldPath,
): DataGridDataResult<TData> {
	const data = getPath(raw, dataField);
	const total = getPath(raw, totalField);

	return {
		data: Array.isArray(data) ? data as TData[] : [],
		pagination: {
			total: typeof total === "number" ? total : Array.isArray(data) ? data.length : 0,
		},
	};
}

function getPath(source: unknown, path: DataGridFieldPath) {
	const parts = Array.isArray(path) ? path : path.split(".");
	return parts.reduce<unknown>((value, key) => {
		if (value == null || typeof value !== "object") return undefined;
		return (value as Record<string, unknown>)[key];
	}, source);
}

function getLeafColumnMeta<TData>(columns: ColumnDef<TData>[]) {
	const meta = new Map<string, ColumnDef<TData>["meta"]>();
	const walk = (items: ColumnDef<TData>[]) => {
		for (const column of items) {
			const children = (column as { columns?: ColumnDef<TData>[] }).columns;
			if (children?.length) {
				walk(children);
			} else if (column.id) {
				meta.set(column.id, column.meta);
			}
		}
	};

	walk(columns);
	return meta;
}
