import type React from "react";
import { useImperativeHandle, useRef, useState } from "react";
import { useControllableState } from "@rap/hooks/use-controllable-state";
import type {
  SelectChangeContext,
  SelectMultipleChangeContext,
  SelectOption,
  SelectProps,
  SelectRef,
  SelectValue,
} from "./types";
import {
  buildOptionKey,
  buildRows,
  filterOptions,
  findOptionByValue,
  getDisplayLabel,
  isMultipleMode,
  normalizeOptions,
  resolveArrayValue,
  resolveSelectedOption,
  resolveShowSearch,
} from "./utils";

function buildChangeContext<V extends SelectValue>(
  multiple: boolean,
  selected: boolean,
  selectedItem?: SelectOption<V>,
  nextOptions?: SelectOption<V>[],
): SelectChangeContext<V> {
  if (multiple) {
    return {
      selected,
      selectedItem,
      selectedItems: nextOptions ?? [],
    };
  }

  return {
    selected,
    selectedItem,
  };
}

export function useSelect<V extends SelectValue>(props: SelectProps<V>, ref?: React.Ref<SelectRef>) {
  const {
    value,
    defaultValue,
    onChange,
    onSelect,
    onDeselect,
    onClear,
    onOpenChange,
    options = [],
    mode = "single",
    showSearch,
    filterOption = true,
    onSearch,
    fieldNames,
    disabled,
    onKeyDown,
  } = props;

  const normalizedOptions = normalizeOptions(options, fieldNames);
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const [activeOptionKey, setActiveOptionKey] = useState<string>();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const ignoreCloseRef = useRef(false);
  const [innerValue, setInnerValue] = useControllableState<V | V[] | null>({
    value,
    defaultValue,
  });

  const multiple = isMultipleMode(mode);
  const searchable = resolveShowSearch(mode, showSearch);
  const values = resolveArrayValue(innerValue);
  const selectedOptions = values
    .map((item) => resolveSelectedOption(normalizedOptions, item, mode))
    .filter(Boolean) as SelectOption<V>[];
  const selectedKeys = values.map((item) => buildOptionKey(item));
  const selectedLabel =
    !multiple && selectedOptions[0] ? getDisplayLabel(selectedOptions[0].label) : "";
  const shouldFilter = searchable && (multiple || hasUserTyped);
  const visibleOptions = filterOptions(
    normalizedOptions,
    inputValue,
    shouldFilter,
    filterOption,
    mode,
  );
  const { rows, optionMap, optionKeys } = buildRows(visibleOptions);

  const getFirstEnabledKey = () => optionKeys.find((key) => !optionMap.get(key)?.disabled);

  const syncDisplayInput = () => {
    if (multiple) {
      setInputValue("");
      setHasUserTyped(false);
      return;
    }

    setInputValue(selectedLabel);
    setHasUserTyped(false);
  };

  const syncActiveOption = () => {
    setActiveOptionKey(getFirstEnabledKey());
  };

  const focus = () => {
    window.requestAnimationFrame(() => {
      if (searchable) {
        inputRef.current?.focus();
        return;
      }
      triggerRef.current?.focus();
    });
  };

  const blur = () => {
    if (searchable) {
      inputRef.current?.blur();
      return;
    }
    triggerRef.current?.blur();
  };

  useImperativeHandle(ref, () => ({ focus, blur }));

  const emitOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  const openDropdown = () => {
    if (disabled) return;
    ignoreCloseRef.current = true;
    if (!open) {
      syncDisplayInput();
      syncActiveOption();
    }
    emitOpenChange(true);
    window.setTimeout(() => {
      ignoreCloseRef.current = false;
    }, 0);
  };

  const closeDropdown = () => {
    emitOpenChange(false);
    syncDisplayInput();
  };

  const emitChange = (nextValue: V | V[] | null, context: SelectChangeContext<V>) => {
    setInnerValue(nextValue);
    onChange?.(nextValue, context);
  };

  const handleClear = () => {
    const context: SelectMultipleChangeContext<V> = {
      selected: false,
      selectedItems: [],
    };

    emitChange(multiple ? ([] as V[]) : null, context);
    setInputValue("");
    setHasUserTyped(false);
    onClear?.(context);

    if (searchable) {
      openDropdown();
      focus();
    }
  };

  const handleSingleSelect = (option: SelectOption<V>) => {
    emitChange(option.value, buildChangeContext(multiple, true, option));
    setInputValue(getDisplayLabel(option.label));
    setHasUserTyped(false);
    emitOpenChange(false);
  };

  const handleMultipleSelect = (option: SelectOption<V>) => {
    const nextValues = [...values];
    const currentIndex = nextValues.findIndex((item) => Object.is(item, option.value));
    const willSelect = currentIndex < 0;

    if (willSelect) {
      nextValues.push(option.value);
    } else {
      nextValues.splice(currentIndex, 1);
    }

    const nextSelectedOptions = nextValues
      .map((item) => resolveSelectedOption(normalizedOptions, item, mode))
      .filter(Boolean) as SelectOption<V>[];
    const context = buildChangeContext(multiple, willSelect, option, nextSelectedOptions);

    emitChange(nextValues as V[], context);

    if (willSelect) {
      onSelect?.(option.value, context as SelectMultipleChangeContext<V>);
    } else {
      onDeselect?.(option.value, context as SelectMultipleChangeContext<V>);
    }

    setInputValue("");
    setHasUserTyped(false);
    openDropdown();
    focus();
  };

  const handleSelectOption = (option: SelectOption<V>) => {
    if (option.disabled) return;
    if (multiple) {
      handleMultipleSelect(option);
      return;
    }
    handleSingleSelect(option);
  };

  const handleSelectByKey = (optionKey: string) => {
    const option = optionMap.get(optionKey);
    if (!option) return;
    handleSelectOption(option);
  };

  const handleTagRemove = (option: SelectOption<V>) => {
    const nextValues = values.filter((item) => !Object.is(item, option.value));
    const nextSelectedOptions = nextValues
      .map((item) => resolveSelectedOption(normalizedOptions, item, mode))
      .filter(Boolean) as SelectOption<V>[];
    const context = buildChangeContext(multiple, false, option, nextSelectedOptions);

    emitChange(nextValues as V[], context);
    onDeselect?.(option.value, context as SelectMultipleChangeContext<V>);
    focus();
  };

  const handleCreateTag = () => {
    const keyword = inputValue.trim();
    if (!keyword) return;

    const existedOption = findOptionByValue(normalizedOptions, keyword as V);
    if (existedOption) {
      handleSelectOption(existedOption);
      return;
    }

    if (values.some((item) => String(item) === keyword)) {
      setInputValue("");
      setHasUserTyped(false);
      return;
    }

    const nextOption = {
      label: keyword,
      value: keyword as V,
      raw: { custom: true },
    } satisfies SelectOption<V>;
    const nextValues = [...values, nextOption.value] as V[];
    const nextSelectedOptions = [...selectedOptions, nextOption];
    const context = buildChangeContext(multiple, true, nextOption, nextSelectedOptions);

    emitChange(nextValues, context);
    onSelect?.(nextOption.value, context as SelectMultipleChangeContext<V>);
    setInputValue("");
    setHasUserTyped(false);
    openDropdown();
    focus();
  };

  const moveActiveOption = (direction: 1 | -1) => {
    if (!optionKeys.length) return;

    const currentIndex = Math.max(0, optionKeys.indexOf(activeOptionKey ?? optionKeys[0] ?? ""));
    let nextIndex = currentIndex;

    do {
      nextIndex += direction;
    } while (
      nextIndex >= 0 &&
      nextIndex < optionKeys.length &&
      optionMap.get(optionKeys[nextIndex])?.disabled
    );

    if (nextIndex >= 0 && nextIndex < optionKeys.length) {
      setActiveOptionKey(optionKeys[nextIndex]);
    }
  };

  const handleInputChange = (nextValue: string) => {
    setInputValue(nextValue);
    setHasUserTyped(true);
    onSearch?.(nextValue);
    openDropdown();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      closeDropdown();
      onKeyDown?.(event);
      return;
    }

    if (event.key === "Enter") {
      if (mode === "tags" && inputValue.trim()) {
        event.preventDefault();
        handleCreateTag();
        onKeyDown?.(event);
        return;
      }

      if (activeOptionKey) {
        event.preventDefault();
        handleSelectByKey(activeOptionKey);
      }

      onKeyDown?.(event);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      openDropdown();
      moveActiveOption(1);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      openDropdown();
      moveActiveOption(-1);
      return;
    }

    onKeyDown?.(event);
  };

  const handleTriggerKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled || searchable) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (open) {
        closeDropdown();
        return;
      }
      openDropdown();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      openDropdown();
    }
  };

  return {
    activeOptionKey,
    blur,
    closeDropdown,
    disabled,
    focus,
    handleClear,
    handleCreateTag,
    handleInputChange,
    handleInputKeyDown,
    handleSelectByKey,
    handleTagRemove,
    handleTriggerKeyDown,
    hovered,
    ignoreCloseRef,
    inputRef,
    inputValue,
    multiple,
    open,
    openDropdown,
    rows,
    searchable,
    selectedKeys,
    selectedLabel,
    selectedOptions,
    setActiveOptionKey,
    setHovered,
    triggerRef,
    values,
    emitOpenChange,
  };
}
