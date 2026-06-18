"use client";

import { createContext, use } from "react";

import type { AnyFormApi, FormLabelAlign, FormLayout, FormValuesChangeHandler } from "./types";

export type FormContextValue<TFormData = unknown> = {
  disabled?: boolean;
  form: AnyFormApi<TFormData>;
  labelAlign: FormLabelAlign;
  labelWrap: boolean;
  layout: FormLayout;
  onValuesChange?: FormValuesChangeHandler<TFormData>;
  requiredMark: boolean;
};

export const FormContext = createContext<FormContextValue<any> | null>(null);

export function useFormContext<TFormData = unknown>() {
  const context = use(FormContext);

  if (!context) {
    throw new Error("Form components must be used within a Form");
  }

  return context as FormContextValue<TFormData>;
}
