"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDown, ChevronUp, RotateCcw, SearchIcon } from "lucide-react";
import { Button } from "@rap/components-ui/button";
import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";
import { cn } from "@rap/utils";

import { Form, useForm } from "../form";
import { SearchItem } from "./search-item";
import { useSearchCollapse } from "./use-search-collapse";
import type { AnyFormApi } from "../form";
import type { SearchActionsRenderContext, SearchItemProps, SearchProps } from "./types";

function getActionLayout(actionsLayout: SearchProps["actionsLayout"]) {
  if (actionsLayout === "inline" || actionsLayout === "newline") {
    return actionsLayout;
  }

  return "newline";
}

function SearchRoot<TFormData = Record<string, unknown>>({
  actionsLayout = "auto",
  actionsClassName,
  children,
  className,
  collapsed: collapsedProp,
  collapsedRows = 1,
  collapsible = "auto",
  contentClassName,
  defaultCollapsed = true,
  form: formProp,
  formOptions,
  fieldsClassName,
  initialValues,
  itemMinWidth = 240,
  labelAlign = "right",
  labelWidth = 88,
  onCollapsedChange,
  onReset,
  onSubmit,
  renderActions,
  resetText = "Reset",
  searchText = "Search",
  ...props
}: SearchProps<TFormData>) {
  const { onSubmit: formOptionsSubmit, ...restFormOptions } = formOptions ?? {};
  const innerForm = useForm<TFormData>({
    ...restFormOptions,
    defaultValues: initialValues,
    onSubmit: async (submitProps) => {
      const { formApi, value } = submitProps;

      await formOptionsSubmit?.(submitProps);
      await onSubmit?.(value, formApi as unknown as AnyFormApi<TFormData>);
    },
  });
  const form = formProp ?? innerForm;
  const [innerCollapsed, setInnerCollapsed] = useState(defaultCollapsed);
  const collapsed = collapsedProp ?? innerCollapsed;
  const collapseEnabled = collapsible !== false;
  const { canCollapse, collapsedHeight, expandedHeight, fieldsRef } = useSearchCollapse({
    collapsedRows,
    enabled: collapseEnabled,
  });
  const actualCollapsed = collapseEnabled && canCollapse && collapsed;
  const fieldsMaxHeight =
    collapseEnabled && canCollapse && expandedHeight > 0
      ? `${actualCollapsed ? collapsedHeight : expandedHeight}px`
      : undefined;
  const actionLayout = getActionLayout(actionsLayout);
  const submit = useMemoizedFn(() => {
    void form.handleSubmit();
  });
  const reset = useMemoizedFn(() => {
    form.reset();
    void onReset?.((initialValues ?? form.state.values) as TFormData, form);
  });
  const toggleCollapsed = () => {
    const nextCollapsed = !collapsed;

    if (collapsedProp === undefined) {
      setInnerCollapsed(nextCollapsed);
    }

    onCollapsedChange?.(nextCollapsed);
  };
  const actionContext: SearchActionsRenderContext<TFormData> = {
    canCollapse,
    collapsed: actualCollapsed,
    form,
    reset,
    submit,
    toggleCollapsed,
  };

  return (
    <Form
      {...props}
      form={form}
      initialValues={initialValues}
      labelAlign={labelAlign}
      layout="inline"
      className={cn("gap-0", className)}
    >
      <div
        className={cn(
          "flex w-full items-start gap-x-3 gap-y-3",
          actionLayout === "inline" ? "flex-wrap" : "flex-col",
          contentClassName
        )}
      >
        <div
          ref={fieldsRef}
          data-search-fields
          className={cn(
            "grid min-w-0 grid-cols-[repeat(auto-fill,minmax(min(100%,var(--search-item-min-width)),1fr))] items-start gap-x-5 gap-y-3 overflow-hidden transition-[max-height] duration-200 ease-in-out",
            actionLayout === "newline" && "w-full",
            fieldsClassName
          )}
          style={
            {
              "--search-item-min-width":
                typeof itemMinWidth === "number" ? `${itemMinWidth}px` : itemMinWidth,
              "--search-label-width":
                typeof labelWidth === "number" ? `${labelWidth}px` : labelWidth,
              maxHeight: fieldsMaxHeight,
            } as CSSProperties
          }
        >
          {typeof children === "function" ? children(form) : children}
        </div>

        <div
          className={cn(
            "ml-auto flex shrink-0 items-start gap-2",
            actionLayout === "inline" && "pt-0.5",
            actionLayout === "newline" && "w-full justify-end pt-0.5",
            actionsClassName
          )}
        >
          {renderActions ? (
            renderActions(actionContext)
          ) : (
            <>
              <Button type="submit" className="h-8 px-3">
                <SearchIcon className="size-4" />
                {searchText}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-8 border-input bg-background px-3 shadow-xs"
                onClick={reset}
              >
                <RotateCcw className="size-4" />
                {resetText}
              </Button>
              {canCollapse ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 border-input bg-background px-3 shadow-xs"
                  aria-expanded={!actualCollapsed}
                  onClickCapture={toggleCollapsed}
                >
                  {actualCollapsed ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronUp className="size-4" />
                  )}
                  {actualCollapsed ? "Expand" : "Collapse"}
                </Button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </Form>
  );
}

export const Search = Object.assign(SearchRoot, {
  Item: SearchItem,
});

export type SearchComponent = typeof SearchRoot & {
  Item: (props: SearchItemProps) => ReactNode;
};
