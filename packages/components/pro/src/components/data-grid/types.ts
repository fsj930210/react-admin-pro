import type { Button } from "@rap/components-ui/button";
import type { DataGridProps as UiDataGridProps } from "@rap/components-ui/data-grid";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import type { ComponentProps, ReactNode, Ref } from "react";

export type DataGridRequestReason =
  | "initial"
  | "params"
  | "pagination"
  | "sorting"
  | "filtering"
  | "search"
  | "reload"
  | "reset";

export interface DataGridRequestContext {
  reason: DataGridRequestReason;
  pagination?: { page: number; pageSize: number };
  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  globalFilter?: unknown;
  signal: AbortSignal;
}

export interface DataGridRequestResult<TData> {
  data: TData[];
  total: number;
}

export type DataGridToolbarButton =
  | ({ type?: "button"; key: string } & ComponentProps<typeof Button>)
  | { type: "custom"; key: string; render: () => ReactNode };

export interface DataGridToolbarSearchRenderContext {
  search: (params?: Record<string, unknown>) => void;
  reset: () => void;
}

export type DataGridToolbarSearch =
  | {
      type?: "input";
      searchKey: string;
      placeholder?: string;
      trigger?: "enter" | "change";
      debounceTime?: number;
      allowClear?: boolean;
    }
  | {
      type: "custom";
      render: (context: DataGridToolbarSearchRenderContext) => ReactNode;
    };

export interface DataGridToolbarConfig {
  buttons?: DataGridToolbarButton[];
  search?: DataGridToolbarSearch | false;
}

export interface DataGridRef {
  reload: () => Promise<void>;
  reset: () => Promise<void>;
}

export interface DataGridProps<
  TData,
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TRequestParams = TParams,
  TResponse = DataGridRequestResult<TData>,
> extends Omit<UiDataGridProps<TData>, "data" | "loading"> {
  ref?: Ref<DataGridRef>;
  data?: TData[];
  params?: TParams;
  request?: (params: TRequestParams, context: DataGridRequestContext) => Promise<TResponse>;
  transformParams?: (params: TParams, context: DataGridRequestContext) => TRequestParams;
  transformData?: (response: TResponse) => DataGridRequestResult<TData>;
  loading?: boolean;
  defaultLoading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  toolbar?: DataGridToolbarConfig | false;
  manualRequest?: boolean;
  onParamsChange?: (params: TRequestParams, context: DataGridRequestContext) => void;
  onRequestSuccess?: (result: DataGridRequestResult<TData>, response: TResponse) => void;
  onRequestError?: (error: unknown) => void;
}
