import type { DataGridProps as UiDataGridProps } from "@rap/components-ui/data-grid";
import type { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table";

function getColumnId<TData>(column: ColumnDef<TData>): string | undefined {
  if ("id" in column && column.id) return column.id;
  if ("accessorKey" in column && typeof column.accessorKey === "string") return column.accessorKey;
  return undefined;
}

function findColumn<TData>(columns: ColumnDef<TData>[], id: string): ColumnDef<TData> | undefined {
  for (const column of columns) {
    if (getColumnId(column) === id) return column;
    if ("columns" in column && column.columns) {
      const child = findColumn(column.columns, id);
      if (child) return child;
    }
  }
}

export function getFilterParams<TData>(
  columns: UiDataGridProps<TData>["columns"],
  filters: ColumnFiltersState
) {
  return filters.reduce<Record<string, unknown>>((params, filter) => {
    const column = findColumn(columns, filter.id);
    if (!column) return params;
    const searchKey = column.meta?.filter?.searchKey;
    if (typeof searchKey === "function") {
      return { ...params, ...searchKey(filter.value, { column }) };
    }
    params[searchKey ?? getColumnId(column) ?? filter.id] = filter.value;
    return params;
  }, {});
}

export function getSortParams<TData>(
  columns: UiDataGridProps<TData>["columns"],
  sorting: SortingState
) {
  return sorting.reduce<Record<string, unknown>>((params, sort) => {
    const column = findColumn(columns, sort.id);
    if (!column) return params;
    const order = sort.desc ? "desc" : "asc";
    const sortKey = column.meta?.sort?.sortKey;
    if (typeof sortKey === "function") {
      return { ...params, ...sortKey(order, { column }) };
    }
    params[sortKey ?? getColumnId(column) ?? sort.id] = order;
    return params;
  }, {});
}
