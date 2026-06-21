import type { ComponentProps, ReactNode } from "react";
import type { AnyFormApi, AnyFormOptions, FormProps } from "../form";

export type SearchActionsLayout = "auto" | "inline" | "newline";

export type SearchActionsRenderContext<TFormData> = {
  canCollapse: boolean;
  collapsed: boolean;
  form: AnyFormApi<TFormData>;
  reset: () => void;
  submit: () => void;
  toggleCollapsed: () => void;
};

export type SearchProps<TFormData = Record<string, unknown>> = {
  actionsLayout?: SearchActionsLayout;
  actionsClassName?: string;
  children?: ReactNode | ((form: AnyFormApi<TFormData>) => ReactNode);
  collapsed?: boolean;
  collapsedRows?: number;
  collapsible?: boolean | "auto";
  contentClassName?: string;
  defaultCollapsed?: boolean;
  fieldsClassName?: string;
  form?: AnyFormApi<TFormData>;
  formOptions?: AnyFormOptions<TFormData>;
  initialValues?: TFormData;
  itemMinWidth?: number | string;
  labelAlign?: FormProps<TFormData>["labelAlign"];
  labelWidth?: number | string;
  onCollapsedChange?: (collapsed: boolean) => void;
  onReset?: (values: TFormData, form: AnyFormApi<TFormData>) => void | Promise<void>;
  onSubmit?: (values: TFormData, form: AnyFormApi<TFormData>) => void | Promise<void>;
  renderActions?: (context: SearchActionsRenderContext<TFormData>) => ReactNode;
  resetText?: ReactNode;
  searchText?: ReactNode;
} & Omit<ComponentProps<"form">, "children" | "onReset" | "onSubmit">;

export type SearchItemProps = ComponentProps<"div">;
