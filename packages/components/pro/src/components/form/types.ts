import type { ComponentProps, ReactElement, ReactNode } from "react";
import type {
  AnyFieldApi,
  DeepKeys,
  FormAsyncValidateOrFn,
  FormOptions,
  FormValidateOrFn,
  ReactFormExtendedApi,
} from "@tanstack/react-form";

export type AnyFormApi<TFormData = unknown> = ReactFormExtendedApi<
  TFormData,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
>;

export type FormLayout = "vertical" | "horizontal" | "inline";
export type FormLabelAlign = "left" | "right";
export type ErrorDisplayMode = "touched" | "dirty" | "submitted" | "always";
export type NamePath<TFormData = unknown> =
  | DeepKeys<TFormData>
  | readonly (string | number)[]
  | string
  | number;

export type AnyFormOptions<TFormData> = FormOptions<
  TFormData,
  FormValidateOrFn<TFormData> | undefined,
  FormValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  FormValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  FormValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  FormValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  FormAsyncValidateOrFn<TFormData> | undefined,
  never
>;

export type FormErrorField = {
  name: string;
  errors: unknown[];
};

export type FormValuesChangeHandler<TFormData> = (
  changedValues: Partial<TFormData>,
  allValues: TFormData
) => void;

export type FormFinishFailedInfo<TFormData> = {
  values: TFormData;
  errorFields: FormErrorField[];
};

export type ScrollToFirstErrorOptions = {
  focus?: boolean;
};

export type FormProps<TFormData = Record<string, unknown>> = {
  children?: ReactNode;
  disabled?: boolean;
  form?: AnyFormApi<TFormData>;
  initialValues?: TFormData;
  labelAlign?: FormLabelAlign;
  labelWrap?: boolean;
  layout?: FormLayout;
  onFinish?: (values: TFormData) => void | Promise<void>;
  onFinishFailed?: (info: FormFinishFailedInfo<TFormData>) => void;
  onValuesChange?: FormValuesChangeHandler<TFormData>;
  requiredMark?: boolean;
  scrollToFirstError?: boolean | ScrollToFirstErrorOptions;
  validators?: AnyFormOptions<TFormData>["validators"];
} & Omit<ComponentProps<"form">, "onSubmit">;

export type FormItemRenderContext<TFormData = unknown> = {
  bind: Record<string, unknown>;
  field: AnyFieldApi;
  form: AnyFormApi<TFormData>;
  getFieldValue: (name: NamePath<TFormData>) => unknown;
  getFieldsValue: () => TFormData;
  isInvalid: boolean;
};

export type FormItemProps<TFormData = unknown> = {
  blurTrigger?: string;
  children?: ReactElement | ((ctx: FormItemRenderContext<TFormData>) => ReactNode);
  dependencies?: NamePath<TFormData>[];
  description?: ReactNode;
  getValueFromEvent?: (...args: any[]) => unknown;
  getValueProps?: (value: unknown) => Record<string, unknown>;
  hidden?: boolean;
  label?: ReactNode;
  name?: NamePath<TFormData>;
  noStyle?: boolean;
  normalize?: (value: unknown, prevValue: unknown, prevValues: TFormData) => unknown;
  required?: boolean;
  trigger?: string;
  validateMode?: ErrorDisplayMode;
  valuePropName?: string;
} & Omit<ComponentProps<AnyFormApi<TFormData>["Field"]>, "children" | "name">;
