import type { AutoCompleteOption } from "./types";
import type { SelectValue } from "@rap/components-pro/select";

export function getOptionText(value: unknown) {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return String(value ?? "");
}

export function buildOptionKey(value: SelectValue) {
  return `${typeof value}:${String(value)}`;
}

export function defaultFilterOption<V extends SelectValue>(
  input: string,
  option: AutoCompleteOption<V>
) {
  const keyword = input.trim().toLowerCase();
  if (!keyword) return true;
  return getOptionText(option.label ?? option.value)
    .toLowerCase()
    .includes(keyword);
}

export function filterOptions<V extends SelectValue>(
  options: AutoCompleteOption<V>[],
  keyword: string,
  filterOption: boolean | ((input: string, option: AutoCompleteOption<V>) => boolean)
) {
  if (filterOption === false) return options;
  const matcher = typeof filterOption === "function" ? filterOption : defaultFilterOption;
  return options.filter((option) => matcher(keyword, option));
}
