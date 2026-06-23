import { useImperativeHandle, useRef, type KeyboardEvent } from "react";
import { useControllableState } from "@rap/hooks/use-controllable-state";
import type { SelectValue } from "@rap/components-pro/select";
import type { AutoCompleteOption, AutoCompleteProps, AutoCompleteRef } from "./types";
import { buildOptionKey, filterOptions, getOptionText } from "./utils";

export function useAutoComplete<V extends SelectValue>(
  props: AutoCompleteProps<V>,
  ref?: AutoCompleteProps<V>["ref"]
) {
  const {
    value,
    defaultValue,
    onChange,
    open,
    defaultOpen,
    onOpenChange,
    options = [],
    filterOption = true,
    onSearch,
    onSelect,
    disabled,
    readOnly,
    onKeyDown,
  } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useControllableState<string>({
    value,
    defaultValue,
    onChange,
  });
  const [dropdownOpen, setDropdownOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen ?? false,
    onChange: onOpenChange,
  });
  const filteredOptions = filterOptions(options, inputValue ?? "", filterOption);
  const optionKeys = filteredOptions.map((option) => buildOptionKey(option.value));
  const optionMap = new Map(
    filteredOptions.map((option) => [buildOptionKey(option.value), option] as const)
  );
  const [activeOptionKey, setActiveOptionKey] = useControllableState<string | undefined>({
    defaultValue: optionKeys.find((key) => !optionMap.get(key)?.disabled),
  });

  const focus = () => inputRef.current?.focus();
  const blur = () => inputRef.current?.blur();

  useImperativeHandle(ref, () => ({ focus, blur }) satisfies AutoCompleteRef);

  const getFirstEnabledKey = () => optionKeys.find((key) => !optionMap.get(key)?.disabled);

  const resolvedActiveOptionKey = activeOptionKey ?? getFirstEnabledKey();

  const openDropdown = () => {
    if (disabled || readOnly) return;
    setDropdownOpen(true);
    setActiveOptionKey((current) => current ?? resolvedActiveOptionKey);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  const updateInputValue = (nextValue: string) => {
    setInputValue(nextValue);
    onSearch?.(nextValue);
  };

  const handleInputChange = (nextValue: string) => {
    updateInputValue(nextValue);
    if (nextValue.trim() || options.length > 0) {
      openDropdown();
      return;
    }
    closeDropdown();
  };

  const handleClear = () => {
    updateInputValue("");
    setActiveOptionKey(undefined);
    closeDropdown();
    props.onClear?.();
  };

  const selectOption = (option: AutoCompleteOption<V>) => {
    if (option.disabled) return;
    const nextValue = getOptionText(option.label);

    onSelect?.(option.value, option);
    setInputValue(nextValue);
    closeDropdown();
  };

  const selectOptionByKey = (optionKey: string | undefined) => {
    if (!optionKey) return;
    const option = optionMap.get(optionKey);
    if (option) selectOption(option);
  };

  const moveActiveOption = (direction: 1 | -1) => {
    if (!optionKeys.length) return;
    const currentIndex = Math.max(
      0,
      optionKeys.indexOf(resolvedActiveOptionKey ?? optionKeys[0] ?? "")
    );
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

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      closeDropdown();
      onKeyDown?.(event);
      return;
    }

    if (event.key === "Enter") {
      if (dropdownOpen && resolvedActiveOptionKey) {
        event.preventDefault();
        selectOptionByKey(resolvedActiveOptionKey);
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

  return {
    activeOptionKey: resolvedActiveOptionKey,
    closeDropdown,
    dropdownOpen,
    filteredOptions,
    handleClear,
    handleInputChange,
    handleInputKeyDown,
    inputRef,
    inputValue,
    openDropdown,
    selectOption,
    setActiveOptionKey,
    setDropdownOpen,
  };
}
