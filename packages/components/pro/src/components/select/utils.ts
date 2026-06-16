import { type ReactNode } from "react";
import type {
  SelectData,
  SelectFieldNames,
  SelectMode,
  SelectOption,
  SelectOptionGroup,
  SelectRow,
  SelectValue,
} from "./types";
import * as React from "react";

function isObjectRecord(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

function readField<T>(source: T, key: string, fallback: unknown) {
  if (!isObjectRecord(source)) return fallback;
  if (!(key in source)) return fallback;
  return Reflect.get(source, key) ?? fallback;
}

export function isOptionGroup<V extends SelectValue>(
  item: SelectData<V>
): item is SelectOptionGroup<V> {
  return Array.isArray((item as SelectOptionGroup<V>).options);
}

export function isMultipleMode(mode: SelectMode) {
  return mode === "multiple" || mode === "tags";
}

export function resolveShowSearch(mode: SelectMode, showSearch?: boolean) {
  if (showSearch !== undefined) return showSearch;
  return isMultipleMode(mode);
}

export function resolveArrayValue<V extends SelectValue>(value: V | V[] | null | undefined) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  return [value];
}

export function getDisplayLabel(value: React.ReactNode) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return String(value ?? "");
}

export function defaultFilterOption<V extends SelectValue>(input: string, option: SelectOption<V>) {
  const keyword = input.trim().toLowerCase();
  if (!keyword) return true;
  return getDisplayLabel(option.label ?? option.value)
    .toLowerCase()
    .includes(keyword);
}

export function createTagOption(keyword: string): SelectOption<string> {
  return {
    label: keyword,
    value: keyword,
    raw: { custom: true },
  };
}

export function normalizeOptions<V extends SelectValue>(
  options: SelectData<V>[],
  fieldNames?: SelectFieldNames
): SelectData<V>[] {
  if (!fieldNames) {
    return options.map((item) => {
      if (isOptionGroup(item)) {
        return {
          ...item,
          raw: item.raw ?? item,
          options: item.options.map((option) => ({ ...option, raw: option.raw ?? option })),
        };
      }
      return { ...item, raw: item.raw ?? item };
    });
  }

  const labelKey = fieldNames.label ?? "label";
  const valueKey = fieldNames.value ?? "value";
  const disabledKey = fieldNames.disabled ?? "disabled";
  const optionsKey = fieldNames.options ?? "options";

  return options.map((item) => {
    const children = readField(item, optionsKey, undefined);

    if (Array.isArray(children)) {
      return {
        label: readField(item, labelKey, (item as SelectOptionGroup<V>).label) as React.ReactNode,
        raw: (item as SelectOptionGroup<V>).raw ?? item,
        options: normalizeOptions(children as SelectData<V>[], fieldNames)
          .filter((child): child is SelectOption<V> => !isOptionGroup(child))
          .map((option) => ({ ...option, raw: option.raw ?? option })),
      } satisfies SelectOptionGroup<V>;
    }

    return {
      label: readField(item, labelKey, (item as SelectOption<V>).label) as React.ReactNode,
      value: readField(item, valueKey, (item as SelectOption<V>).value) as V,
      disabled: readField(item, disabledKey, (item as SelectOption<V>).disabled) as
        | boolean
        | undefined,
      raw: (item as SelectOption<V>).raw ?? item,
    } satisfies SelectOption<V>;
  });
}

export function flattenOptions<V extends SelectValue>(options: SelectData<V>[]) {
  const result: SelectOption<V>[] = [];
  for (const item of options) {
    if (isOptionGroup(item)) {
      result.push(...item.options);
      continue;
    }
    result.push(item);
  }
  return result;
}

export function buildOptionKey(value: SelectValue) {
  return `${typeof value}:${String(value)}`;
}

export function findOptionByValue<V extends SelectValue>(options: SelectData<V>[], value: V) {
  return flattenOptions(options).find((item) => Object.is(item.value, value));
}

export function resolveSelectedOption<V extends SelectValue>(
  options: SelectData<V>[],
  value: V,
  mode: SelectMode
) {
  const matched = findOptionByValue(options, value);
  if (matched) return matched;

  if (mode === "tags") {
    return {
      label: String(value),
      value,
      raw: { custom: true },
    } as SelectOption<V>;
  }

  return undefined;
}

export function filterOptions<V extends SelectValue>(
  options: SelectData<V>[],
  keyword: string,
  shouldFilter: boolean,
  filterOption: boolean | ((input: string, option: SelectOption<V>) => boolean),
  mode: SelectMode
) {
  const matcher =
    typeof filterOption === "function"
      ? filterOption
      : filterOption === false
        ? () => true
        : defaultFilterOption;

  const nextOptions = options
    .map((item) => {
      if (!isOptionGroup(item)) {
        return !shouldFilter || matcher(keyword, item) ? item : null;
      }

      const children = !shouldFilter
        ? item.options
        : item.options.filter((option) => matcher(keyword, option));

      if (!children.length) return null;
      return { ...item, options: children };
    })
    .filter(Boolean) as SelectData<V>[];

  if (mode === "tags" && keyword.trim()) {
    const exists = flattenOptions(nextOptions).some(
      (option) => String(option.value) === keyword.trim()
    );
    if (!exists) {
      return [createTagOption(keyword.trim()) as SelectOption<V>, ...nextOptions];
    }
  }

  return nextOptions;
}

export function buildRows<V extends SelectValue>(options: SelectData<V>[]) {
  const rows: SelectRow<V>[] = [];
  const optionMap = new Map<string, SelectOption<V>>();
  const optionKeys: string[] = [];

  options.forEach((item, groupIndex) => {
    if (isOptionGroup(item)) {
      rows.push({
        type: "group",
        key: `group:${groupIndex}`,
        label: item.label,
      });

      item.options.forEach((option, optionIndex) => {
        const optionKey = buildOptionKey(option.value);
        rows.push({
          type: "option",
          key: `group:${groupIndex}:option:${optionIndex}:${optionKey}`,
          optionKey,
          option,
        });
        optionMap.set(optionKey, option);
        optionKeys.push(optionKey);
      });
      return;
    }

    const optionKey = buildOptionKey(item.value);
    rows.push({
      type: "option",
      key: `option:${groupIndex}:${optionKey}`,
      optionKey,
      option: item,
    });
    optionMap.set(optionKey, item);
    optionKeys.push(optionKey);
  });

  return { rows, optionMap, optionKeys };
}

export function resolvePlacement(placement: "bottomLeft" | "bottomRight" | "topLeft" | "topRight") {
  if (placement === "bottomRight") return { side: "bottom" as const, align: "end" as const };
  if (placement === "topLeft") return { side: "top" as const, align: "start" as const };
  if (placement === "topRight") return { side: "top" as const, align: "end" as const };
  return { side: "bottom" as const, align: "start" as const };
}
