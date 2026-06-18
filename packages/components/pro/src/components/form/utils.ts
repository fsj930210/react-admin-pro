import { cloneElement, isValidElement, type ReactElement } from "react";
import type { AnyFieldApi } from "@tanstack/react-form";

import type { AnyFormApi, ErrorDisplayMode, FormErrorField, NamePath } from "./types";

export function getIsInvalid<TFormData>(
  field: AnyFieldApi,
  form: AnyFormApi<TFormData>,
  mode: ErrorDisplayMode
) {
  const { meta } = field.state;
  const submissionAttempts = form.state.submissionAttempts ?? 0;

  if (meta.isValid) {
    return false;
  }

  if (mode === "always") {
    return true;
  }

  if (mode === "dirty") {
    return meta.isDirty;
  }

  if (mode === "submitted") {
    return submissionAttempts > 0;
  }

  return meta.isTouched || submissionAttempts > 0;
}

export function getEventValue(
  args: unknown[],
  valuePropName: string,
  getValueFromEvent?: (...args: any[]) => unknown
) {
  if (getValueFromEvent) {
    return getValueFromEvent(...args);
  }

  const [firstArg] = args;

  if (
    firstArg &&
    typeof firstArg === "object" &&
    "target" in firstArg &&
    firstArg.target &&
    typeof firstArg.target === "object"
  ) {
    const target = firstArg.target as Record<string, unknown>;

    return target[valuePropName];
  }

  return firstArg;
}

export function injectControlProps(child: ReactElement, props: Record<string, unknown>) {
  if (!isValidElement(child)) {
    return child;
  }

  return cloneElement(child, props);
}

export function getErrorFields<TFormData>(form: AnyFormApi<TFormData>): FormErrorField[] {
  return Object.entries(form.state.fieldMeta).flatMap(([name, meta]) => {
    const errors = (meta as { errors?: unknown[] } | undefined)?.errors ?? [];

    return errors.length ? [{ name, errors }] : [];
  });
}

export function toFieldName(name: NamePath) {
  return Array.isArray(name) ? name.join(".") : String(name);
}

export function getValueByNamePath<TFormData>(values: TFormData, name: NamePath<TFormData>) {
  const path = Array.isArray(name) ? name : String(name).split(".");

  return path.reduce<unknown>((current, key) => {
    if (current == null) {
      return undefined;
    }

    return (current as Record<string | number, unknown>)[key];
  }, values);
}

export function setValueByNamePath<TFormData>(
  values: TFormData,
  name: NamePath<TFormData>,
  value: unknown
) {
  const path = Array.isArray(name) ? name : String(name).split(".");

  if (!path.length) {
    return values;
  }

  const next = { ...(values as Record<string | number, unknown>) };
  let current = next;

  path.forEach((key, index) => {
    if (index === path.length - 1) {
      current[key] = value;
      return;
    }

    const child = current[key];
    const nextChild = Array.isArray(child)
      ? [...child]
      : { ...((child ?? {}) as Record<string | number, unknown>) };

    current[key] = nextChild;
    current = nextChild as Record<string | number, unknown>;
  });

  return next as TFormData;
}
