import type { ReactNode, Ref } from "react";
import type { InputProps } from "@rap/components-pro/input";
import type { SelectPlacement, SelectValue } from "@rap/components-pro/select";

export interface AutoCompleteOption<V extends SelectValue = string> {
  label: ReactNode;
  value: V;
  disabled?: boolean;
  raw?: unknown;
}

export interface AutoCompleteOptionRenderInfo<V extends SelectValue = string> {
  active: boolean;
  option: AutoCompleteOption<V>;
}

export interface AutoCompleteRef {
  focus: () => void;
  blur: () => void;
}

export interface AutoCompleteProps<V extends SelectValue = string>
  extends Omit<
    InputProps,
    "value" | "defaultValue" | "onChange" | "onSelect" | "ref" | "children"
  > {
  ref?: Ref<AutoCompleteRef>;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  options?: AutoCompleteOption<V>[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSearch?: (keyword: string) => void;
  onSelect?: (value: V, option: AutoCompleteOption<V>) => void;
  onClear?: () => void;
  filterOption?: boolean | ((input: string, option: AutoCompleteOption<V>) => boolean);
  loading?: boolean;
  loadingContent?: ReactNode;
  notFoundContent?: ReactNode;
  optionRender?: (
    option: AutoCompleteOption<V>,
    info: AutoCompleteOptionRenderInfo<V>
  ) => ReactNode;
  dropdownRender?: (menu: ReactNode) => ReactNode;
  popupClassName?: string;
  placement?: SelectPlacement;
}
