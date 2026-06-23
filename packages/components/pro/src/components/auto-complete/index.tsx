import { Popover, PopoverAnchor } from "@rap/components-ui/popover";
import { Input } from "@rap/components-pro/input";
import type { SelectValue } from "@rap/components-pro/select";
import { AutoCompleteDropdown } from "./dropdown";
import { AutoCompleteOptionList } from "./option-list";
import type { AutoCompleteProps } from "./types";
import { useAutoComplete } from "./use-auto-complete";

export type {
  AutoCompleteOption,
  AutoCompleteOptionRenderInfo,
  AutoCompleteProps,
  AutoCompleteRef,
} from "./types";

export function AutoComplete<V extends SelectValue = string>({
  ref,
  options,
  open,
  defaultOpen,
  onOpenChange,
  onSearch,
  onSelect,
  filterOption,
  loading,
  loadingContent,
  notFoundContent,
  optionRender,
  dropdownRender,
  popupClassName,
  placement,
  onClear,
  onFocus,
  ...props
}: AutoCompleteProps<V>) {
  const autoComplete = useAutoComplete(
    {
      ...props,
      options,
      open,
      defaultOpen,
      onOpenChange,
      onSearch,
      onSelect,
      filterOption,
      onClear,
    },
    ref
  );
  const menu = (
    <AutoCompleteOptionList
      options={autoComplete.filteredOptions}
      activeOptionKey={autoComplete.activeOptionKey}
      loading={loading}
      loadingContent={loadingContent}
      notFoundContent={notFoundContent}
      optionRender={optionRender}
      onOptionSelect={autoComplete.selectOption}
      onActiveOptionChange={autoComplete.setActiveOptionKey}
    />
  );

  return (
    <Popover open={autoComplete.dropdownOpen} onOpenChange={autoComplete.setDropdownOpen}>
      <PopoverAnchor asChild>
        <Input
          {...props}
          ref={autoComplete.inputRef}
          value={autoComplete.inputValue ?? ""}
          onChange={(value) => autoComplete.handleInputChange(String(value))}
          onClear={autoComplete.handleClear}
          onFocus={(event) => {
            if (autoComplete.filteredOptions.length > 0 || loading) {
              autoComplete.openDropdown();
            }
            onFocus?.(event);
          }}
          onKeyDown={autoComplete.handleInputKeyDown}
        />
      </PopoverAnchor>
      <AutoCompleteDropdown popupClassName={popupClassName} placement={placement}>
        {dropdownRender ? dropdownRender(menu) : menu}
      </AutoCompleteDropdown>
    </Popover>
  );
}
