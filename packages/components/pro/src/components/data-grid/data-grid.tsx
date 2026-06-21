import { DataGrid as UiDataGrid } from "@rap/components-ui/data-grid";
import { useControllableState } from "@rap/hooks/use-controllable-state";
import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { DataGridToolbar } from "./data-grid-toolbar";
import { getFilterParams, getSortParams } from "./request-params";
import type {
  DataGridProps,
  DataGridRequestContext,
  DataGridRequestReason,
  DataGridRequestResult,
} from "./types";

interface RequestState {
  page: number;
  pageSize: number;
  sorting: SortingState;
  filters: ColumnFiltersState;
  globalFilter?: unknown;
  search: Record<string, unknown>;
}

export function DataGrid<
  TData,
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TRequestParams = TParams,
  TResponse = DataGridRequestResult<TData>,
>(props: DataGridProps<TData, TParams, TRequestParams, TResponse>) {
  const {
    ref,
    request,
    transformParams,
    transformData,
    params,
    data: providedData,
    loading: controlledLoading,
    defaultLoading,
    onLoadingChange,
    onParamsChange,
    onRequestSuccess,
    onRequestError,
    toolbar,
    manualRequest,
    pagination: paginationProp,
    sorting: sortingProp,
    filtering: filteringProp,
    ...gridProps
  } = props;
  const pagination = paginationProp === false ? undefined : paginationProp;
  const sorting = sortingProp === false ? undefined : sortingProp;
  const filtering = filteringProp === false ? undefined : filteringProp;
  const [page, setPage] = useControllableState({
    value: pagination?.page,
    defaultValue: pagination?.defaultPage ?? 1,
  });
  const [pageSize, setPageSize] = useControllableState({
    value: pagination?.pageSize,
    defaultValue: pagination?.defaultPageSize ?? 10,
  });
  const [sortingValue, setSortingValue] = useControllableState<SortingState>({
    value: sorting?.value,
    defaultValue: sorting?.defaultValue ?? [],
  });
  const [filters, setFilters] = useControllableState<ColumnFiltersState>({
    value: filtering?.columnFilters,
    defaultValue: filtering?.defaultColumnFilters ?? [],
  });
  const [globalFilter, setGlobalFilter] = useControllableState({
    value: filtering?.globalFilter,
    defaultValue: filtering?.defaultGlobalFilter,
  });
  const [loading, setLoading] = useControllableState({
    value: controlledLoading,
    defaultValue: defaultLoading ?? false,
    onChange: onLoadingChange,
  });
  const [data, setData] = useState<TData[]>(providedData ?? []);
  const [total, setTotal] = useState(pagination?.total ?? providedData?.length ?? 0);
  const searchRef = useRef<Record<string, unknown>>({});
  const requestIdRef = useRef(0);
  const abortRef = useRef<AbortController>(undefined);

  const runRequest = useMemoizedFn(
    async (reason: DataGridRequestReason, next?: Partial<RequestState>) => {
      if (!request) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const requestId = ++requestIdRef.current;
      const state: RequestState = {
        page,
        pageSize,
        sorting: sortingValue,
        filters,
        globalFilter,
        search: searchRef.current,
        ...next,
      };
      const context: DataGridRequestContext = {
        reason,
        pagination:
          paginationProp === false ? undefined : { page: state.page, pageSize: state.pageSize },
        sorting: state.sorting,
        columnFilters: state.filters,
        globalFilter: state.globalFilter,
        signal: controller.signal,
      };
      const mergedParams = {
        ...(params ?? ({} as TParams)),
        ...state.search,
        ...getFilterParams(props.columns, state.filters),
        ...getSortParams(props.columns, state.sorting),
      } as TParams;
      const finalParams = transformParams
        ? transformParams(mergedParams, context)
        : (mergedParams as unknown as TRequestParams);
      onParamsChange?.(finalParams, context);
      setLoading(true);
      try {
        const response = await request(finalParams, context);
        if (requestId !== requestIdRef.current || controller.signal.aborted) return;
        const result = transformData
          ? transformData(response)
          : (response as unknown as DataGridRequestResult<TData>);
        setData(result.data);
        setTotal(result.total);
        onRequestSuccess?.(result, response);
      } catch (error) {
        if (!controller.signal.aborted) onRequestError?.(error);
      } finally {
        if (requestId === requestIdRef.current) setLoading(false);
      }
    }
  );

  const reset = useMemoizedFn(async () => {
    const nextPage = pagination?.defaultPage ?? 1;
    const nextPageSize = pagination?.defaultPageSize ?? 10;
    const nextSorting = sorting?.defaultValue ?? [];
    const nextFilters = filtering?.defaultColumnFilters ?? [];
    const nextGlobalFilter = filtering?.defaultGlobalFilter;
    searchRef.current = {};
    setPage(nextPage);
    setPageSize(nextPageSize);
    setSortingValue(nextSorting);
    setFilters(nextFilters);
    setGlobalFilter(nextGlobalFilter);
    await runRequest("reset", {
      page: nextPage,
      pageSize: nextPageSize,
      sorting: nextSorting,
      filters: nextFilters,
      globalFilter: nextGlobalFilter,
      search: {},
    });
  });

  useImperativeHandle(ref, () => ({ reload: () => runRequest("reload"), reset }), [
    runRequest,
    reset,
  ]);

  useEffect(() => {
    // request/manualRequest are lifecycle inputs: only the initial remote load belongs here;
    // pagination, sorting, filtering and search requests are event-driven below.
    if (request && !manualRequest) void runRequest("initial");
    return () => abortRef.current?.abort();
  }, [request, manualRequest, runRequest]);

  return (
    <div className="space-y-3">
      {toolbar ? (
        <DataGridToolbar
          config={toolbar}
          onSearch={(search) => {
            searchRef.current = search;
            const nextPage = 1;
            setPage(nextPage);
            void runRequest("search", { page: nextPage, search });
          }}
          onReset={() => void reset()}
        />
      ) : null}
      <UiDataGrid
        {...gridProps}
        data={request ? data : (providedData ?? [])}
        loading={loading}
        sorting={
          sortingProp === false
            ? false
            : {
                ...sorting,
                value: sortingValue,
                onChange: (next, info) => {
                  const nextPage = 1;
                  setSortingValue(next);
                  setPage(nextPage);
                  sorting?.onChange?.(next, info);
                  void runRequest("sorting", { page: nextPage, sorting: next });
                },
              }
        }
        filtering={
          filteringProp === false
            ? false
            : {
                ...filtering,
                columnFilters: filters,
                globalFilter,
                onColumnFiltersChange: (next, info) => {
                  const nextPage = 1;
                  setFilters(next);
                  setPage(nextPage);
                  filtering?.onColumnFiltersChange?.(next, info);
                  void runRequest("filtering", { page: nextPage, filters: next });
                },
                onGlobalFilterChange: (next) => {
                  const nextPage = 1;
                  setGlobalFilter(next);
                  setPage(nextPage);
                  filtering?.onGlobalFilterChange?.(next);
                  void runRequest("filtering", { page: nextPage, globalFilter: next });
                },
              }
        }
        pagination={
          paginationProp === false
            ? false
            : {
                ...pagination,
                page,
                pageSize,
                total: request ? total : pagination?.total,
                onChange: (nextPage, nextPageSize) => {
                  const resolvedPage = nextPageSize !== pageSize ? 1 : nextPage;
                  setPage(resolvedPage);
                  setPageSize(nextPageSize);
                  pagination?.onChange?.(resolvedPage, nextPageSize);
                  void runRequest("pagination", { page: resolvedPage, pageSize: nextPageSize });
                },
              }
        }
      />
    </div>
  );
}
