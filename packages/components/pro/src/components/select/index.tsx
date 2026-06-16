import { type ReactNode } from "react";
import { Popover, PopoverTrigger } from "@rap/components-ui/popover";
import { Button } from "@rap/components-ui/button";
import { useSelect } from "./use-select";
import { SelectDropdown } from "./dropdown";
import { SelectOptionList } from "./option-list";
import { SelectTrigger } from "./trigger";
import type { SelectProps, SelectValue } from "./types";

export type {
  SelectChangeContext,
  SelectData,
  SelectFieldNames,
  SelectMode,
  SelectMultipleChangeContext,
  SelectOption,
  SelectOptionGroup,
  SelectOptionRenderInfo,
  SelectPlacement,
  SelectProps,
  SelectRef,
  SelectSingleChangeContext,
  SelectTagRenderInfo,
  SelectValue,
} from "./types";

export function Select<V extends SelectValue = string>(props: SelectProps<V>) {
  const {
    ref,
    allowClear,
    className,
    disabled,
    dropdownRender,
    itemHeight = 40,
    labelRender,
    listHeight = 320,
    loading = false,
    maxTagCount,
    maxTagPlaceholder,
    notFoundContent = "暂无数据",
    onBlur,
    onFocus,
    optionRender,
    placement = "bottomLeft",
    placeholder = "请选择",
    popupClassName,
    prefix,
    rootClassName,
    suffix,
    tagRender,
    virtual = false,
    ...inputProps
  } = props;

  const select = useSelect(props, ref);

  return (
    <Popover
      open={select.open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && select.ignoreCloseRef.current) return;
        if (!nextOpen) {
          select.closeDropdown();
          return;
        }
        select.emitOpenChange(true);
      }}
    >
      <PopoverTrigger asChild>
        <SelectTrigger
          rootRef={select.triggerRef}
          multiple={select.multiple}
          searchable={select.searchable}
          open={select.open}
          disabled={disabled}
          hovered={select.hovered}
          allowClear={allowClear}
          values={select.values}
          inputValue={select.inputValue}
          selectedLabel={select.selectedLabel}
          selectedOptions={select.selectedOptions}
          placeholder={placeholder}
          prefix={prefix}
          suffix={suffix}
          rootClassName={rootClassName}
          className={className}
          inputProps={inputProps}
          maxTagCount={maxTagCount}
          maxTagPlaceholder={maxTagPlaceholder}
          tagRender={tagRender}
          labelRender={labelRender}
          inputRef={select.inputRef}
          onClear={select.handleClear}
          onContainerClick={() => {
            if (disabled) return;
            if (select.searchable) {
              select.openDropdown();
              select.focus();
              return;
            }
            if (select.open) {
              select.closeDropdown();
              return;
            }
            select.openDropdown();
          }}
          onContainerKeyDown={select.handleTriggerKeyDown}
          onMouseEnter={() => select.setHovered(true)}
          onMouseLeave={() => select.setHovered(false)}
          onInputChange={(event) => {
            select.handleInputChange(event.target.value);
          }}
          onInputFocus={(event) => {
            select.openDropdown();
            onFocus?.(event);
          }}
          onInputBlur={onBlur}
          onInputKeyDown={select.handleInputKeyDown}
          onInputPointerDown={() => {
            select.ignoreCloseRef.current = true;
            select.openDropdown();
          }}
          onTagRemove={select.handleTagRemove}
        />
      </PopoverTrigger>
      <SelectDropdown
        loading={loading}
        notFound={!select.rows.length}
        notFoundContent={notFoundContent}
        popupClassName={popupClassName}
        placement={placement}
        dropdownRender={dropdownRender}
      >
        <SelectOptionList
          rows={select.rows}
          activeOptionKey={select.activeOptionKey}
          selectedKeys={select.selectedKeys}
          multiple={select.multiple}
          virtual={virtual}
          listHeight={listHeight}
          itemHeight={itemHeight}
          overscan={props.overscan ?? 6}
          optionRender={optionRender}
          onOptionSelect={select.handleSelectByKey}
          onActiveOptionChange={select.setActiveOptionKey}
        />
      </SelectDropdown>
    </Popover>
  );
}

export function SelectOptionAction({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Button variant="ghost" className="h-8 justify-start rounded-lg px-3 text-sm" onClick={onClick}>
      {children}
    </Button>
  );
}
