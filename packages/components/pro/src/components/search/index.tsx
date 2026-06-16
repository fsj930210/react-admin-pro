import * as React from "react";
import {
  createContext,
  use,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { cn } from "@rap/utils";

export type ProSearchErrors<TValues> = Partial<Record<keyof TValues | string, React.ReactNode>>;

export interface UseProSearchOptions<TValues extends Record<string, any>> {
  values?: TValues;
  defaultValues?: TValues;
  validate?: (
    values: TValues
  ) => ProSearchErrors<TValues> | undefined | Promise<ProSearchErrors<TValues> | undefined>;
  transform?: (values: TValues) => unknown;
  onSubmit?: (ctx: { values: TValues; errors?: ProSearchErrors<TValues>; params: unknown }) => void;
  onReset?: (values: TValues) => void;
  defaultExpanded?: boolean;
}

export interface ProSearchController<TValues extends Record<string, any> = Record<string, any>> {
  values: TValues;
  errors: ProSearchErrors<TValues>;
  dirty: boolean;
  submitting: boolean;
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
  setValue: <K extends keyof TValues>(key: K, value: TValues[K]) => void;
  setValues: (values: Partial<TValues>) => void;
  setErrors: (errors: ProSearchErrors<TValues>) => void;
  validate: () => Promise<ProSearchErrors<TValues>>;
  submit: () => Promise<{ values: TValues; errors?: ProSearchErrors<TValues>; params: unknown }>;
  reset: () => void;
}

export function useProSearch<TValues extends Record<string, any> = Record<string, any>>({
  values,
  defaultValues,
  validate,
  transform,
  onSubmit,
  onReset,
  defaultExpanded = false,
}: UseProSearchOptions<TValues> = {}) {
  const initial = React.useMemo(() => defaultValues ?? ({} as TValues), [defaultValues]);
  const isControlled = values !== undefined;
  const [innerValues, setInnerValues] = React.useState<TValues>(initial);
  const [errors, setErrors] = React.useState<ProSearchErrors<TValues>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [expanded, setExpanded] = React.useState(defaultExpanded);
  const currentValues = isControlled ? values : innerValues;
  const dirty = JSON.stringify(currentValues) !== JSON.stringify(initial);

  const setValues = React.useCallback(
    (next: Partial<TValues>) => {
      if (!isControlled) {
        setInnerValues((current) => ({ ...current, ...next }));
      }
    },
    [isControlled]
  );

  const setValue = React.useCallback(
    <K extends keyof TValues>(key: K, value: TValues[K]) =>
      setValues({ [key]: value } as unknown as Partial<TValues>),
    [setValues]
  );

  const runValidate = React.useCallback(async () => {
    const nextErrors = (await validate?.(currentValues)) ?? {};
    setErrors(nextErrors);
    return nextErrors;
  }, [currentValues, validate]);

  const submit = React.useCallback(async () => {
    setSubmitting(true);
    try {
      const nextErrors = await runValidate();
      const hasError = Object.values(nextErrors).some(Boolean);
      const params = transform ? transform(currentValues) : currentValues;
      const result = { values: currentValues, errors: hasError ? nextErrors : undefined, params };
      onSubmit?.(result);
      return result;
    } finally {
      setSubmitting(false);
    }
  }, [currentValues, onSubmit, runValidate, transform]);

  const reset = React.useCallback(() => {
    if (!isControlled) setInnerValues(initial);
    setErrors({});
    onReset?.(initial);
  }, [initial, isControlled, onReset]);

  return React.useMemo<ProSearchController<TValues>>(
    () => ({
      values: currentValues,
      errors,
      dirty,
      submitting,
      expanded,
      setExpanded,
      toggleExpanded: () => setExpanded((value) => !value),
      setValue,
      setValues,
      setErrors,
      validate: runValidate,
      submit,
      reset,
    }),
    [
      currentValues,
      dirty,
      errors,
      expanded,
      reset,
      runValidate,
      setValue,
      setValues,
      submit,
      submitting,
    ]
  );
}

interface SearchBarContextValue {
  expanded: boolean;
  collapsedRows: number;
  columns: number;
  itemIndexRef: React.MutableRefObject<number>;
}

const SearchBarContext = createContext<SearchBarContextValue | null>(null);

export interface ProSearchBarProps extends React.ComponentProps<"div"> {
  search: ProSearchController<any>;
  position?: "top" | "left";
  collapsible?: boolean;
  collapsedRows?: number;
  columns?: number | { base?: number; sm?: number; md?: number; lg?: number; xl?: number };
  actions?: React.ReactNode;
}

function resolveColumns(columns: ProSearchBarProps["columns"]) {
  if (typeof columns === "number") return columns;
  return columns?.xl ?? columns?.lg ?? columns?.md ?? columns?.sm ?? columns?.base ?? 4;
}

export function ProSearchBar({
  search,
  position = "top",
  collapsible = true,
  collapsedRows = 1,
  columns = { base: 1, md: 2, xl: 4 },
  className,
  children,
  ...props
}: ProSearchBarProps) {
  const itemIndexRef = React.useRef(0);
  itemIndexRef.current = 0;
  const columnCount = resolveColumns(columns);
  const context = React.useMemo<SearchBarContextValue>(
    () => ({
      expanded: !collapsible || search.expanded,
      collapsedRows,
      columns: columnCount,
      itemIndexRef,
    }),
    [collapsedRows, collapsible, columnCount, search.expanded]
  );

  return (
    <SearchBarContext value={context}>
      <div
        className={cn(
          "rounded-md border bg-background p-3",
          position === "left" ? "flex min-h-0 flex-col gap-3" : "grid gap-3",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "grid gap-3",
            position === "left" ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
          )}
        >
          {children}
        </div>
      </div>
    </SearchBarContext>
  );
}

export interface ProSearchBarItemProps extends React.ComponentProps<"div"> {
  name?: string;
  span?: number;
}

function ProSearchBarItem({ span = 1, className, children, ...props }: ProSearchBarItemProps) {
  const context = use(SearchBarContext);
  const index = context ? context.itemIndexRef.current++ : 0;
  const visibleCount = context ? context.collapsedRows * context.columns : Number.POSITIVE_INFINITY;
  const visible = context?.expanded || index < visibleCount;
  if (!visible) return null;
  return (
    <div
      className={cn(span > 1 && "md:col-span-2", span > 2 && "xl:col-span-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ProSearchBarActionsProps extends React.ComponentProps<"div"> {
  search?: ProSearchController<any>;
}

function ProSearchBarActions({ className, children, ...props }: ProSearchBarActionsProps) {
  return (
    <div className={cn("flex items-center justify-end gap-2", className)} {...props}>
      {children}
    </div>
  );
}

ProSearchBar.Item = ProSearchBarItem;
ProSearchBar.Actions = ProSearchBarActions;
