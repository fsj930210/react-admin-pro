import * as React from "react";
import type { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { DataGrid, type DataGridProps } from "@rap/components-ui/data-grid";
import { Input } from "@rap/components-ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@rap/components-ui/dropdown-menu";
import { MoreHorizontal, Search } from "lucide-react";
import { ProButton, ProButtonGroup, type ProButtonProps } from "../button";
import type { ProSearchController } from "../search";
import { ProSearchBar } from "../search";
import { cn } from "@rap/utils";

export interface ProDataGridRequestParams<TSearch = unknown> {
  page: number;
  pageSize: number;
  search?: TSearch;
  keyword?: string;
  sorter: Array<{ field: string; order: "asc" | "desc"; columnId: string }>;
  filters: Record<string, unknown>;
}

export interface ProDataGridResponse<TData> {
  data: TData[];
  total?: number;
}

export type ProDataGridRequest<TData, TSearch = unknown> = (
  params: ProDataGridRequestParams<TSearch>,
  ctx: { signal: AbortSignal }
) => Promise<ProDataGridResponse<TData> | unknown>;

export interface ProDataGridToolbar<TData> {
  buttons?: Array<ProButtonProps & { key: React.Key }>;
  render?: (ctx: ProDataGridRenderContext<TData>) => React.ReactNode;
  moreText?: React.ReactNode;
}

export interface ProDataGridKeywordSearch {
  parameterKey?: string;
  placeholder?: string;
  debounce?: number;
  defaultValue?: string;
}

export interface ProDataGridActions {
  reload: () => void;
  reset: () => void;
  setPage: (page: number) => void;
  clearSelected: () => void;
}

export interface ProDataGridRenderContext<TData> {
  data: TData[];
  loading: boolean;
  selectedRowKeys: string[];
  actions: ProDataGridActions;
}

export interface UseProDataGridOptions<TData, TSearch = unknown> extends Omit<
  DataGridProps<TData>,
  "data" | "loading" | "pagination" | "sorting" | "filtering"
> {
  request?: ProDataGridRequest<TData, TSearch>;
  data?: TData[];
  total?: number;
  loading?: boolean;
  defaultPage?: number;
  defaultPageSize?: number;
  transformResponse?: (response: unknown) => ProDataGridResponse<TData>;
  transformParams?: (params: ProDataGridRequestParams<TSearch>) => unknown;
  search?: ProSearchController<any>;
  keywordSearch?: ProDataGridKeywordSearch | false;
  toolbar?: ProDataGridToolbar<TData> | false;
}

function normalizeResponse<TData>(
  response: unknown,
  transformResponse?: (response: unknown) => ProDataGridResponse<TData>
) {
  if (transformResponse) return transformResponse(response);
  if (response && typeof response === "object" && "data" in response) {
    return response as ProDataGridResponse<TData>;
  }
  return { data: Array.isArray(response) ? (response as TData[]) : [], total: 0 };
}

function getColumnRemoteKey<TData>(
  columns: ColumnDef<TData>[],
  columnId: string,
  kind: "sort" | "filter"
) {
  const flat: ColumnDef<TData>[] = [];
  const visit = (items: ColumnDef<TData>[]) => {
    for (const item of items) {
      flat.push(item);
      const columns = (item as { columns?: ColumnDef<TData>[] }).columns;
      if (columns) visit(columns);
    }
  };
  visit(columns);
  const column = flat.find((item) => {
    const id =
      (item as { id?: string; accessorKey?: string }).id ??
      (item as { accessorKey?: string }).accessorKey;
    return id === columnId;
  });
  const meta = column?.meta as
    | {
        sort?: { key?: string };
        filter?: { key?: string };
        queryKey?: string;
        sortKey?: string;
        filterKey?: string;
      }
    | undefined;
  if (kind === "sort") return meta?.sort?.key ?? meta?.sortKey ?? meta?.queryKey ?? columnId;
  return meta?.filter?.key ?? meta?.filterKey ?? meta?.queryKey ?? columnId;
}

export function useProDataGrid<TData, TSearch = unknown>({
  request,
  data: controlledData,
  total: controlledTotal,
  loading: controlledLoading,
  defaultPage = 1,
  defaultPageSize = 10,
  transformResponse,
  transformParams,
  search,
  keywordSearch,
  toolbar,
  columns,
  rowKey,
  rowSelection,
  ...dataGridProps
}: UseProDataGridOptions<TData, TSearch>) {
  const [data, setData] = React.useState<TData[]>(controlledData ?? []);
  const [total, setTotal] = React.useState(controlledTotal ?? controlledData?.length ?? 0);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(defaultPage);
  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [selectedRowKeys, setSelectedRowKeys] = React.useState<string[]>([]);
  const [keyword, setKeyword] = React.useState(
    keywordSearch ? (keywordSearch.defaultValue ?? "") : ""
  );
  const [reloadKey, setReloadKey] = React.useState(0);
  const requestIdRef = React.useRef(0);

  const params = React.useMemo<ProDataGridRequestParams<any>>(() => {
    const filters: Record<string, unknown> = {};
    for (const filter of columnFilters) {
      filters[getColumnRemoteKey(columns, filter.id, "filter")] = filter.value;
    }
    return {
      page,
      pageSize,
      search: search?.values,
      keyword,
      sorter: sorting.map((item) => ({
        columnId: item.id,
        field: getColumnRemoteKey(columns, item.id, "sort"),
        order: item.desc ? "desc" : "asc",
      })),
      filters,
    };
  }, [columnFilters, columns, keyword, page, pageSize, search?.values, sorting]);

  const reload = React.useCallback(() => setReloadKey((key) => key + 1), []);
  const reset = React.useCallback(() => {
    setPage(defaultPage);
    setPageSize(defaultPageSize);
    setSorting([]);
    setColumnFilters([]);
    setSelectedRowKeys([]);
    setKeyword(keywordSearch ? (keywordSearch.defaultValue ?? "") : "");
    search?.reset();
    reload();
  }, [defaultPage, defaultPageSize, keywordSearch, reload, search]);

  React.useEffect(() => {
    if (!request) return;
    const controller = new AbortController();
    const id = ++requestIdRef.current;
    setLoading(true);
    const finalParams = transformParams ? transformParams(params) : params;
    void request(finalParams as ProDataGridRequestParams<TSearch>, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted || id !== requestIdRef.current) return;
        const next = normalizeResponse<TData>(response, transformResponse);
        setData(next.data);
        setTotal(next.total ?? next.data.length);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setData([]);
          setTotal(0);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted && id === requestIdRef.current) setLoading(false);
      });
    return () => controller.abort();
  }, [params, reloadKey, request, transformParams, transformResponse]);

  React.useEffect(() => {
    if (controlledData) setData(controlledData);
  }, [controlledData]);
  React.useEffect(() => {
    if (controlledTotal !== undefined) setTotal(controlledTotal);
  }, [controlledTotal]);

  const actions = React.useMemo<ProDataGridActions>(
    () => ({
      reload,
      reset,
      setPage,
      clearSelected: () => setSelectedRowKeys([]),
    }),
    [reload, reset]
  );

  const gridProps: DataGridProps<TData> = {
    ...dataGridProps,
    rowKey,
    columns,
    data,
    loading: controlledLoading ?? loading,
    sorting: {
      value: sorting,
      onChange: (nextSorting) => {
        setSorting(nextSorting);
        setPage(1);
      },
    },
    filtering: {
      columnFilters,
      onColumnFiltersChange: (filters) => {
        setColumnFilters(filters);
        setPage(1);
      },
    },
    pagination: {
      page,
      pageSize,
      total,
      onChange: (nextPage, nextPageSize) => {
        setPage(nextPage);
        setPageSize(nextPageSize);
      },
    },
    rowSelection:
      rowSelection === false
        ? false
        : {
            ...(typeof rowSelection === "object" ? rowSelection : {}),
            selectedRowKeys,
            onChange: (keys, rows) => {
              setSelectedRowKeys(keys);
              if (rowSelection && typeof rowSelection === "object")
                rowSelection.onChange?.(keys, rows);
            },
          },
  };

  return {
    gridProps,
    toolbar,
    keywordSearch,
    keyword,
    setKeyword,
    search,
    actions,
    state: {
      data,
      total,
      loading: controlledLoading ?? loading,
      page,
      pageSize,
      sorting,
      columnFilters,
      selectedRowKeys,
    },
  };
}

export interface ProDataGridProps<TData, TSearch = unknown> extends UseProDataGridOptions<
  TData,
  TSearch
> {
  searchBarPosition?: "top" | "left" | false;
  renderSearchBar?: (search: ProSearchController<any>) => React.ReactNode;
}

function ProDataGridToolbar<TData>({
  toolbar,
  keywordSearch,
  keyword,
  setKeyword,
  ctx,
}: {
  toolbar?: ProDataGridToolbar<TData> | false;
  keywordSearch?: ProDataGridKeywordSearch | false;
  keyword: string;
  setKeyword: (value: string) => void;
  ctx: ProDataGridRenderContext<TData>;
}) {
  const buttons = toolbar ? (toolbar.buttons ?? []) : [];
  const visibleButtons = buttons.slice(0, 3);
  const hiddenButtons = buttons.slice(3);

  if (toolbar === false && !keywordSearch) return null;
  if (toolbar && toolbar.render) return <>{toolbar.render(ctx)}</>;

  return (
    <div className="flex flex-col gap-2 rounded-md border bg-background p-3 md:flex-row md:items-center md:justify-between">
      <ProButtonGroup>
        {visibleButtons.map(({ key, ...button }) => (
          <ProButton key={key} {...button} />
        ))}
        {hiddenButtons.length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <ProButton variant="outline" icon={<MoreHorizontal className="size-4" />}>
                {toolbar ? (toolbar.moreText ?? "更多") : "更多"}
              </ProButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {hiddenButtons.map(({ key, children, onClick, disabled }) => (
                <DropdownMenuItem
                  key={key}
                  disabled={disabled}
                  onSelect={(event) => {
                    event.preventDefault();
                    onClick?.(event as unknown as React.MouseEvent<HTMLButtonElement>);
                  }}
                >
                  {children}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </ProButtonGroup>
      {keywordSearch ? (
        <div className="relative w-full md:w-72">
          <Search className="-translate-y-1/2 absolute top-1/2 left-2 size-4 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={keywordSearch.placeholder ?? "搜索"}
            className="pl-8"
          />
        </div>
      ) : null}
    </div>
  );
}

export function ProDataGrid<TData, TSearch = unknown>({
  searchBarPosition = "top",
  renderSearchBar,
  className,
  ...options
}: ProDataGridProps<TData, TSearch> & { className?: string }) {
  const grid = useProDataGrid(options);
  const ctx = React.useMemo<ProDataGridRenderContext<TData>>(
    () => ({
      data: grid.state.data,
      loading: grid.state.loading,
      selectedRowKeys: grid.state.selectedRowKeys,
      actions: grid.actions,
    }),
    [grid.actions, grid.state.data, grid.state.loading, grid.state.selectedRowKeys]
  );
  const searchNode = grid.search ? (
    renderSearchBar ? (
      renderSearchBar(grid.search)
    ) : (
      <ProSearchBar search={grid.search} position={searchBarPosition === "left" ? "left" : "top"} />
    )
  ) : null;

  if (searchBarPosition === "left" && searchNode) {
    return (
      <div className={cn("flex min-h-0 gap-4", className)}>
        <div className="w-80 shrink-0">{searchNode}</div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <ProDataGridToolbar
            toolbar={grid.toolbar}
            keywordSearch={grid.keywordSearch}
            keyword={grid.keyword}
            setKeyword={grid.setKeyword}
            ctx={ctx}
          />
          <DataGrid {...grid.gridProps} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-col gap-3", className)}>
      {searchNode}
      <ProDataGridToolbar
        toolbar={grid.toolbar}
        keywordSearch={grid.keywordSearch}
        keyword={grid.keyword}
        setKeyword={grid.setKeyword}
        ctx={ctx}
      />
      <DataGrid {...grid.gridProps} />
    </div>
  );
}

export type { ProSearchController };
