import { useControllableState } from "@rap/hooks/use-controllable-state";
import { cn } from "@rap/utils";
import { Check, Inbox, SearchIcon } from "lucide-react";
import * as React from "react";
import { use, useCallback, useMemo, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Checkbox } from "./checkbox";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./input-group";
import { Label } from "./label";

export type SelectorValue = string | number;

export interface SelectorItem {
  label: React.ReactNode;
  value: SelectorValue;
  disabled?: boolean;
  [key: string]: unknown;
}

export type SelectorFieldNames<T> = {
  label?: keyof T;
  value?: keyof T;
  disabled?: keyof T;
};

export type SelectorVirtualOptions = {
  itemSize?: number;
  overscan?: number;
};

export type SelectorSelectionScope = "all" | "filtered";

export interface SelectorRenderApi<T, V extends SelectorValue = string> {
  dataSource: T[];
  filteredItems: T[];
  selectedValues: V[];
  selectedSet: Set<V>;
  selectedItems: T[];
  searchValue: string;
  getValue: (item: T) => V;
  getLabel: (item: T) => React.ReactNode;
  getDisabled: (item: T) => boolean;
  isSelected: (value: V) => boolean;
  toggleValue: (value: V) => void;
  setValues: (values: V[]) => void;
  selectValues: (values: V[]) => void;
  deselectValues: (values: V[]) => void;
  clear: () => void;
  selectAll: (selected?: boolean, scope?: SelectorSelectionScope) => void;
  setSearchValue: (value: string) => void;
}

export interface SelectorProps<T = SelectorItem, V extends SelectorValue = string> extends Omit<
  React.ComponentProps<"div">,
  "children" | "defaultValue" | "onChange"
> {
  dataSource: T[];
  value?: V[];
  defaultValue?: V[];
  onChange?: (value: V[], selectedItems: T[]) => void;
  getValue?: (item: T) => V;
  getLabel?: (item: T) => React.ReactNode;
  getDisabled?: (item: T) => boolean;
  fieldNames?: SelectorFieldNames<T>;
  multiple?: boolean;
  disabled?: boolean;
  searchValue?: string;
  defaultSearchValue?: string;
  onSearchChange?: (value: string) => void;
  filterOption?: false | ((input: string, item: T) => boolean);
  virtual?: boolean | SelectorVirtualOptions;
  children?: React.ReactNode | ((api: SelectorRenderApi<T, V>) => React.ReactNode);
}

type SelectorContextValue<T = SelectorItem, V extends SelectorValue = string> = SelectorRenderApi<
  T,
  V
> & {
  multiple: boolean;
  disabled: boolean;
  virtual?: boolean | SelectorVirtualOptions;
};

const SelectorContext = React.createContext<SelectorContextValue<any, any> | undefined>(undefined);

export function useSelector<T = SelectorItem, V extends SelectorValue = string>() {
  const context = use(SelectorContext);
  if (!context) {
    throw new Error("useSelector must be used within a Selector");
  }
  return context as SelectorContextValue<T, V>;
}

function defaultFilter(input: string, item: unknown, getLabel: (item: unknown) => React.ReactNode) {
  return String(getLabel(item) ?? "")
    .toLowerCase()
    .includes(input.toLowerCase());
}

function readField<T>(item: T, key: keyof T | undefined) {
  if (!key || item == null) return undefined;
  return item[key];
}

function uniqueValues<V extends SelectorValue>(values: V[]) {
  return Array.from(new Set(values));
}

export function Selector<T = SelectorItem, V extends SelectorValue = string>({
  dataSource,
  value,
  defaultValue = [],
  onChange,
  getValue: getValueProp,
  getLabel: getLabelProp,
  getDisabled: getDisabledProp,
  fieldNames,
  multiple = true,
  disabled = false,
  searchValue: searchValueProp,
  defaultSearchValue = "",
  onSearchChange,
  filterOption,
  virtual = false,
  children,
  className,
  ...props
}: SelectorProps<T, V>) {
  const [selectedValues, setSelectedValues] = useControllableState<V[]>(
    { value, defaultValue },
    { defaultValue: [] as V[] }
  );
  const [searchValue, setSearchValueState] = useControllableState<string>(
    { value: searchValueProp, defaultValue: defaultSearchValue, onChange: onSearchChange },
    { defaultValue: "" }
  );

  const getValue = useCallback(
    (item: T) => {
      if (getValueProp) return getValueProp(item);
      return readField(item, fieldNames?.value ?? ("value" as keyof T)) as V;
    },
    [getValueProp, fieldNames?.value]
  );

  const getLabel = useCallback(
    (item: T) => {
      if (getLabelProp) return getLabelProp(item);
      return readField(item, fieldNames?.label ?? ("label" as keyof T)) as React.ReactNode;
    },
    [getLabelProp, fieldNames?.label]
  );

  const getDisabled = useCallback(
    (item: T) => {
      if (disabled) return true;
      if (getDisabledProp) return getDisabledProp(item);
      return Boolean(readField(item, fieldNames?.disabled ?? ("disabled" as keyof T)));
    },
    [disabled, getDisabledProp, fieldNames?.disabled]
  );

  const itemMap = useMemo(() => {
    const map = new Map<V, T>();
    for (const item of dataSource) {
      map.set(getValue(item), item);
    }
    return map;
  }, [dataSource, getValue]);

  const selectedSet = useMemo(() => new Set(selectedValues), [selectedValues]);

  const selectedItems = useMemo(() => {
    return selectedValues
      .map((itemValue) => itemMap.get(itemValue))
      .filter((item): item is T => Boolean(item));
  }, [itemMap, selectedValues]);

  const filteredItems = useMemo(() => {
    if (!searchValue || filterOption === false) return dataSource;
    const predicate =
      filterOption ??
      ((input: string, item: T) =>
        defaultFilter(input, item, getLabel as (item: unknown) => React.ReactNode));
    return dataSource.filter((item) => predicate(searchValue, item));
  }, [dataSource, filterOption, getLabel, searchValue]);

  const emitChange = useCallback(
    (nextValue: V[]) => {
      const nextValues = multiple ? uniqueValues(nextValue) : nextValue.slice(0, 1);
      setSelectedValues(nextValues);
      onChange?.(
        nextValues,
        nextValues
          .map((itemValue) => itemMap.get(itemValue))
          .filter((item): item is T => Boolean(item))
      );
    },
    [itemMap, multiple, onChange, setSelectedValues]
  );

  const isSelectableValue = useCallback(
    (itemValue: V) => {
      const item = itemMap.get(itemValue);
      return Boolean(item && !getDisabled(item));
    },
    [getDisabled, itemMap]
  );

  const isSelected = useCallback((itemValue: V) => selectedSet.has(itemValue), [selectedSet]);

  const selectValues = useCallback(
    (values: V[]) => {
      const availableValues = values.filter(isSelectableValue);
      if (!availableValues.length) return;
      emitChange(multiple ? [...selectedValues, ...availableValues] : [availableValues[0]]);
    },
    [emitChange, isSelectableValue, multiple, selectedValues]
  );

  const setValues = useCallback(
    (values: V[]) => {
      emitChange(values.filter(isSelectableValue));
    },
    [emitChange, isSelectableValue]
  );

  const deselectValues = useCallback(
    (values: V[]) => {
      const removeSet = new Set(values);
      emitChange(selectedValues.filter((itemValue) => !removeSet.has(itemValue)));
    },
    [emitChange, selectedValues]
  );

  const toggleValue = useCallback(
    (itemValue: V) => {
      if (!isSelectableValue(itemValue)) return;
      if (selectedSet.has(itemValue)) {
        deselectValues([itemValue]);
      } else {
        selectValues([itemValue]);
      }
    },
    [deselectValues, isSelectableValue, selectValues, selectedSet]
  );

  const clear = useCallback(() => emitChange([]), [emitChange]);

  const selectAll = useCallback(
    (selected = true, scope: SelectorSelectionScope = "filtered") => {
      const source = scope === "all" ? dataSource : filteredItems;
      const values = source.filter((item) => !getDisabled(item)).map(getValue);
      if (selected) {
        selectValues(values);
      } else {
        deselectValues(values);
      }
    },
    [dataSource, deselectValues, filteredItems, getDisabled, getValue, selectValues]
  );

  const setSearchValue = useCallback(
    (nextValue: string) => {
      setSearchValueState(nextValue);
    },
    [setSearchValueState]
  );

  const api = useMemo<SelectorContextValue<T, V>>(
    () => ({
      dataSource,
      filteredItems,
      selectedValues,
      selectedSet,
      selectedItems,
      searchValue,
      getValue,
      getLabel,
      getDisabled,
      isSelected,
      toggleValue,
      setValues,
      selectValues,
      deselectValues,
      clear,
      selectAll,
      setSearchValue,
      multiple,
      disabled,
      virtual,
    }),
    [
      dataSource,
      filteredItems,
      selectedValues,
      selectedSet,
      selectedItems,
      searchValue,
      getValue,
      getLabel,
      getDisabled,
      isSelected,
      toggleValue,
      setValues,
      selectValues,
      deselectValues,
      clear,
      selectAll,
      setSearchValue,
      multiple,
      disabled,
      virtual,
    ]
  );

  const content = typeof children === "function" ? children(api) : children;

  return (
    <SelectorContext value={api}>
      <div className={cn("flex min-h-0 flex-col gap-3", className)} {...props}>
        {content ?? (
          <>
            <SelectorSearch />
            <SelectorSelectAll />
            <SelectorList />
            <SelectorEmpty />
          </>
        )}
      </div>
    </SelectorContext>
  );
}

export interface SelectorSearchProps extends Omit<
  React.ComponentProps<typeof InputGroupInput>,
  "value" | "onChange"
> {
  wrapperClassName?: string;
  onSearch?: (value: string) => void;
}

export function SelectorSearch({
  wrapperClassName,
  className,
  placeholder = "搜索...",
  onSearch,
  onKeyDown,
  ...props
}: SelectorSearchProps) {
  const { searchValue, setSearchValue } = useSelector();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setSearchValue(nextValue);
    onSearch?.(nextValue);
  };

  return (
    <InputGroup className={wrapperClassName}>
      <InputGroupInput
        className={className}
        placeholder={placeholder}
        value={searchValue}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSearch?.(searchValue);
          onKeyDown?.(event);
        }}
        {...props}
      />
      <InputGroupAddon>
        <SearchIcon className="size-4 cursor-pointer" onClick={() => onSearch?.(searchValue)} />
      </InputGroupAddon>
    </InputGroup>
  );
}

export interface SelectorSelectAllProps extends React.ComponentProps<"div"> {
  scope?: SelectorSelectionScope;
  label?: React.ReactNode;
}

export function SelectorSelectAll({
  scope = "filtered",
  label = "全选",
  className,
  ...props
}: SelectorSelectAllProps) {
  const { dataSource, filteredItems, getDisabled, getValue, selectedSet, selectAll } =
    useSelector();
  const items = scope === "all" ? dataSource : filteredItems;
  const enabledItems = items.filter((item) => !getDisabled(item));
  const allSelected =
    enabledItems.length > 0 && enabledItems.every((item) => selectedSet.has(getValue(item)));
  const someSelected = enabledItems.some((item) => selectedSet.has(getValue(item)));

  if (items.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-2 px-2", className)} {...props}>
      <Checkbox
        checked={allSelected ? true : someSelected ? "indeterminate" : false}
        onCheckedChange={(checked) => selectAll(checked === true, scope)}
      />
      <Label className="text-sm">
        {label} ({enabledItems.length})
      </Label>
    </div>
  );
}

export interface SelectorListProps<T = SelectorItem, V extends SelectorValue = string> extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  children?: (api: {
    item: T;
    index: number;
    value: V;
    selected: boolean;
    disabled: boolean;
  }) => React.ReactNode;
  virtual?: boolean | SelectorVirtualOptions;
  itemSize?: number;
  overscan?: number;
}

export function SelectorList<T = SelectorItem, V extends SelectorValue = string>({
  children,
  className,
  virtual: virtualProp,
  itemSize: itemSizeProp,
  overscan: overscanProp,
  ...props
}: SelectorListProps<T, V>) {
  const {
    filteredItems,
    getValue,
    getDisabled,
    selectedSet,
    virtual: rootVirtual,
  } = useSelector<T, V>();
  const parentRef = useRef<HTMLDivElement>(null);
  const virtual = virtualProp ?? rootVirtual;
  const virtualOptions = typeof virtual === "object" ? virtual : {};
  const useVirtual = Boolean(virtual);
  const itemSize = itemSizeProp ?? virtualOptions.itemSize ?? 40;
  const overscan = overscanProp ?? virtualOptions.overscan ?? 6;

  const renderItem = (item: T, index: number) => {
    const itemValue = getValue(item);
    return (
      children?.({
        item,
        index,
        value: itemValue,
        selected: selectedSet.has(itemValue),
        disabled: getDisabled(item),
      }) ?? <SelectorListItem item={item} />
    );
  };

  const virtualizer = useVirtualizer({
    count: useVirtual ? filteredItems.length : 0,
    estimateSize: () => itemSize,
    overscan,
    getScrollElement: () => parentRef.current,
  });

  if (!useVirtual) {
    return (
      <div
        ref={parentRef}
        className={cn("min-h-0 flex-1 overflow-auto rounded-md border p-1", className)}
        {...props}
      >
        {filteredItems.map((item, index) => (
          <React.Fragment key={String(getValue(item))}>{renderItem(item, index)}</React.Fragment>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={parentRef}
      className={cn("min-h-0 flex-1 overflow-auto rounded-md border p-1", className)}
      {...props}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
          width: "100%",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = filteredItems[virtualItem.index];
          return (
            <div
              key={String(getValue(item))}
              style={{
                left: 0,
                position: "absolute",
                top: 0,
                transform: `translateY(${virtualItem.start}px)`,
                width: "100%",
              }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface SelectorListItemProps<T = SelectorItem> extends Omit<
  React.ComponentProps<"div">,
  "children"
> {
  item: T;
  children?: React.ReactNode | ((api: SelectorRenderApi<T, any>) => React.ReactNode);
  hideCheckIcon?: boolean;
}

export function SelectorListItem<T = SelectorItem>({
  item,
  children,
  className,
  hideCheckIcon = false,
  onClick,
  ...props
}: SelectorListItemProps<T>) {
  const api = useSelector<T, any>();
  const itemValue = api.getValue(item);
  const selected = api.selectedSet.has(itemValue);
  const disabled = api.getDisabled(item);
  const label = api.getLabel(item);

  return (
    <div
      data-selected={selected}
      data-disabled={disabled}
      className={cn(
        "flex min-h-10 w-full cursor-pointer select-none items-center justify-between gap-2 rounded-md px-2 py-2 text-sm outline-hidden hover:bg-accent data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[selected=true]:bg-accent/60",
        className
      )}
      onClick={(event) => {
        api.toggleValue(itemValue);
        onClick?.(event);
      }}
      {...props}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <div onClick={(event) => event.stopPropagation()}>
          <Checkbox
            checked={selected}
            disabled={disabled}
            onCheckedChange={() => api.toggleValue(itemValue)}
          />
        </div>
        <div className="min-w-0 flex-1 truncate">
          {typeof children === "function" ? children(api) : (children ?? label)}
        </div>
      </div>
      {selected && !hideCheckIcon ? <Check className="size-4 shrink-0 text-green-500" /> : null}
    </div>
  );
}

export interface SelectorEmptyProps extends React.ComponentProps<"div"> {
  emptyText?: React.ReactNode;
  emptyIcon?: React.ReactNode;
}

export function SelectorEmpty({
  className,
  children,
  emptyText = "暂无数据",
  emptyIcon,
  ...props
}: SelectorEmptyProps) {
  const { filteredItems } = useSelector();

  if (filteredItems.length > 0) return null;

  return (
    <div
      className={cn(
        "flex min-h-40 flex-col items-center justify-center gap-2 text-muted-foreground",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          {emptyIcon ?? <Inbox className="size-6" />}
          <span className="text-sm">{emptyText}</span>
        </>
      )}
    </div>
  );
}

export function SelectorCount({ className, ...props }: React.ComponentProps<"div">) {
  const { filteredItems, selectedValues } = useSelector();

  return (
    <div className={cn("text-sm text-muted-foreground", className)} {...props}>
      已选 {selectedValues.length} 项 / 当前 {filteredItems.length} 项
    </div>
  );
}

export function SelectorFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("border-t pt-3", className)} {...props} />;
}

export { SelectorList as SelectorContent, SelectorListItem as SelectorContentItem };
