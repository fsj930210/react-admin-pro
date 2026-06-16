import { type ComponentProps, type ReactNode, type Ref } from "react";
import * as React from "react";

export type SelectValue = string | number;
export type SelectMode = "single" | "multiple" | "tags";
export type SelectPlacement = "bottomLeft" | "bottomRight" | "topLeft" | "topRight";

export interface SelectOption<V extends SelectValue = string> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
  raw?: unknown;
}

export interface SelectOptionGroup<V extends SelectValue = string> {
  label: React.ReactNode;
  options: SelectOption<V>[];
  raw?: unknown;
}

export type SelectData<V extends SelectValue = string> = SelectOption<V> | SelectOptionGroup<V>;

export interface SelectFieldNames {
  label?: string;
  value?: string;
  options?: string;
  disabled?: string;
}

export interface SelectOptionRenderInfo<V extends SelectValue = string> {
  selected: boolean;
  active: boolean;
  option: SelectOption<V>;
}

export interface SelectTagRenderInfo<V extends SelectValue = string> {
  option: SelectOption<V>;
  onClose: () => void;
}

export interface SelectSingleChangeContext<V extends SelectValue = string> {
  selected?: boolean;
  selectedItem?: SelectOption<V>;
}

export interface SelectMultipleChangeContext<V extends SelectValue = string> {
  selected?: boolean;
  selectedItem?: SelectOption<V>;
  selectedItems?: SelectOption<V>[];
}

export type SelectChangeContext<V extends SelectValue = string> =
  | SelectSingleChangeContext<V>
  | SelectMultipleChangeContext<V>;

export interface SelectRef {
  focus: () => void;
  blur: () => void;
}

export type SelectInputProps = Omit<
  React.ComponentProps<"input">,
  "value" | "defaultValue" | "onChange" | "prefix" | "suffix" | "onSelect" | "ref"
>;

export interface SelectProps<V extends SelectValue = string> extends SelectInputProps {
  ref?: React.Ref<SelectRef>;
  value?: V | V[] | null;
  defaultValue?: V | V[] | null;
  onChange?: (value: V | V[] | null, context: SelectChangeContext<V>) => void;
  onSelect?: (value: V, context: SelectMultipleChangeContext<V>) => void;
  onDeselect?: (value: V, context: SelectMultipleChangeContext<V>) => void;
  onClear?: (context: SelectMultipleChangeContext<V>) => void;
  onOpenChange?: (open: boolean) => void;
  options?: SelectData<V>[];
  mode?: SelectMode;
  showSearch?: boolean;
  allowClear?: boolean;
  loading?: boolean;
  notFoundContent?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  maxTagCount?: number | "responsive";
  maxTagPlaceholder?: React.ReactNode | ((omitted: SelectOption<V>[]) => React.ReactNode);
  dropdownRender?: (menu: React.ReactNode) => React.ReactNode;
  optionRender?: (option: SelectOption<V>, info: SelectOptionRenderInfo<V>) => React.ReactNode;
  labelRender?: (selected: SelectOption<V> | SelectOption<V>[]) => React.ReactNode;
  tagRender?: (info: SelectTagRenderInfo<V>) => React.ReactNode;
  filterOption?: boolean | ((input: string, option: SelectOption<V>) => boolean);
  onSearch?: (keyword: string) => void;
  fieldNames?: SelectFieldNames;
  popupClassName?: string;
  rootClassName?: string;
  placement?: SelectPlacement;
  virtual?: boolean;
  listHeight?: number;
  itemHeight?: number;
  overscan?: number;
}

export type SelectRow<V extends SelectValue = string> =
  | {
      type: "group";
      key: string;
      label: React.ReactNode;
    }
  | {
      type: "option";
      key: string;
      optionKey: string;
      option: SelectOption<V>;
    };
