import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { createContext, use, useState, type ComponentProps, type ReactNode } from "react";
import { useControllableState } from "@rap/hooks/use-controllable-state";
import { cn } from "@rap/utils";
import { Button } from "./button";
import {
  Selector,
  SelectorEmpty,
  type SelectorItem,
  SelectorList,
  type SelectorProps,
  SelectorSearch,
  SelectorSelectAll,
  type SelectorValue,
  useSelector,
} from "./selector";
import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";

export interface TransferRenderApi<T, V extends SelectorValue = string> {
  sourceItems: T[];
  targetItems: T[];
  targetValues: V[];
  sourceCheckedValues: V[];
  targetCheckedValues: V[];
  moveToTarget: () => void;
  moveToSource: () => void;
  moveAllToTarget: () => void;
  moveAllToSource: () => void;
  setSourceCheckedValues: (values: V[]) => void;
  setTargetCheckedValues: (values: V[]) => void;
}

interface TransferContextValue<
  T = SelectorItem,
  V extends SelectorValue = string,
> extends TransferRenderApi<T, V> {
  getValue: (item: T) => V;
  getLabel?: SelectorProps<T, V>["getLabel"];
  getDisabled: (item: T) => boolean;
  selectorProps: Pick<
    SelectorProps<T, V>,
    "fieldNames" | "getValue" | "getLabel" | "getDisabled" | "filterOption" | "virtual"
  >;
}

const TransferContext = createContext<TransferContextValue<any, any> | undefined>(undefined);

export function useTransfer<T = SelectorItem, V extends SelectorValue = string>() {
  const context = use(TransferContext);
  if (!context) {
    throw new Error("useTransfer must be used within a Transfer");
  }
  return context as TransferContextValue<T, V>;
}

export interface TransferProps<T = SelectorItem, V extends SelectorValue = string> extends Omit<
  ComponentProps<"div">,
  "defaultValue" | "onChange" | "children"
> {
  dataSource: T[];
  value?: V[];
  defaultValue?: V[];
  onChange?: (value: V[], selectedItems: T[]) => void;
  getValue?: SelectorProps<T, V>["getValue"];
  getLabel?: SelectorProps<T, V>["getLabel"];
  getDisabled?: SelectorProps<T, V>["getDisabled"];
  fieldNames?: SelectorProps<T, V>["fieldNames"];
  filterOption?: SelectorProps<T, V>["filterOption"];
  virtual?: SelectorProps<T, V>["virtual"];
  children?: ReactNode | ((api: TransferRenderApi<T, V>) => ReactNode);
}

function readTransferField<T>(item: T, key: keyof T | undefined) {
  if (!key || item == null) return undefined;
  return item[key];
}

function getUniqueValues<V extends SelectorValue>(values: V[]) {
  return Array.from(new Set(values));
}

function createValueMap<T, V extends SelectorValue>(items: T[], getValue: (item: T) => V) {
  const map = new Map<V, T>();
  for (const item of items) {
    map.set(getValue(item), item);
  }
  return map;
}

function splitTransferItems<T, V extends SelectorValue>(
  items: T[],
  targetValues: V[],
  getValue: (item: T) => V
) {
  const targetValueSet = new Set(targetValues);
  const sourceItems: T[] = [];
  const targetItems: T[] = [];

  for (const item of items) {
    if (targetValueSet.has(getValue(item))) {
      targetItems.push(item);
    } else {
      sourceItems.push(item);
    }
  }

  return { sourceItems, targetItems };
}

function keepExistingValues<V extends SelectorValue>(values: V[], existingValues: Set<V>) {
  return values.filter((itemValue) => existingValues.has(itemValue));
}

function useTransferState<T, V extends SelectorValue>({
  dataSource,
  value,
  defaultValue,
  onChange,
  getValue: getValueProp,
  getLabel,
  getDisabled: getDisabledProp,
  fieldNames,
  filterOption,
  virtual,
}: TransferProps<T, V>): TransferContextValue<T, V> {
  const [targetValues, setTargetValues] = useControllableState<V[]>(
    { value, defaultValue },
    { defaultValue: [] as V[] }
  );
  const [sourceCheckedValues, setSourceCheckedValuesState] = useState<V[]>([]);
  const [targetCheckedValues, setTargetCheckedValuesState] = useState<V[]>([]);

  const getValue = (item: T) => {
    if (getValueProp) return getValueProp(item);
    return readTransferField(item, fieldNames?.value ?? ("value" as keyof T)) as V;
  };

  const getDisabled = (item: T) => {
    if (getDisabledProp) return getDisabledProp(item);
    return Boolean(readTransferField(item, fieldNames?.disabled ?? ("disabled" as keyof T)));
  };

  const itemMap = createValueMap(dataSource, getValue);
  const { sourceItems, targetItems } = splitTransferItems(dataSource, targetValues, getValue);
  const sourceValueSet = new Set(sourceItems.map(getValue));
  const targetValueSet = new Set(targetItems.map(getValue));
  const checkedSourceValues = keepExistingValues(sourceCheckedValues, sourceValueSet);
  const checkedTargetValues = keepExistingValues(targetCheckedValues, targetValueSet);

  const emitChange = (nextValues: V[]) => {
    const nextTargetValues = getUniqueValues(nextValues);
    setTargetValues(nextTargetValues);
    onChange?.(
      nextTargetValues,
      nextTargetValues
        .map((itemValue) => itemMap.get(itemValue))
        .filter((item): item is T => Boolean(item))
    );
  };

  const setSourceCheckedValues = useMemoizedFn((values: V[]) => {
    setSourceCheckedValuesState(keepExistingValues(values, sourceValueSet));
  });

  const setTargetCheckedValues = useMemoizedFn((values: V[]) => {
    setTargetCheckedValuesState(keepExistingValues(values, targetValueSet));
  });

  const moveToTarget = useMemoizedFn(() => {
    emitChange([...targetValues, ...checkedSourceValues]);
    setSourceCheckedValuesState([]);
  });

  const moveToSource = useMemoizedFn(() => {
    const removeSet = new Set(checkedTargetValues);
    emitChange(targetValues.filter((itemValue) => !removeSet.has(itemValue)));
    setTargetCheckedValuesState([]);
  });

  const moveAllToTarget = useMemoizedFn(() => {
    const movableValues = sourceItems.filter((item) => !getDisabled(item)).map(getValue);
    emitChange([...targetValues, ...movableValues]);
    setSourceCheckedValuesState([]);
  });

  const moveAllToSource = useMemoizedFn(() => {
    const movableSet = new Set(targetItems.filter((item) => !getDisabled(item)).map(getValue));
    emitChange(targetValues.filter((itemValue) => !movableSet.has(itemValue)));
    setTargetCheckedValuesState([]);
  });

  return {
    sourceItems,
    targetItems,
    targetValues,
    sourceCheckedValues: checkedSourceValues,
    targetCheckedValues: checkedTargetValues,
    moveToTarget,
    moveToSource,
    moveAllToTarget,
    moveAllToSource,
    setSourceCheckedValues,
    setTargetCheckedValues,
    getValue,
    getLabel,
    getDisabled,
    selectorProps: {
      fieldNames,
      getValue: getValueProp,
      getLabel,
      getDisabled: getDisabledProp,
      filterOption,
      virtual,
    },
  };
}

export function Transfer<T = SelectorItem, V extends SelectorValue = string>({
  dataSource,
  value,
  defaultValue = [],
  onChange,
  getValue,
  getLabel,
  getDisabled,
  fieldNames,
  filterOption,
  virtual,
  children,
  className,
  ...props
}: TransferProps<T, V>) {
  const api = useTransferState<T, V>({
    dataSource,
    value,
    defaultValue,
    onChange,
    getValue,
    getLabel,
    getDisabled,
    fieldNames,
    filterOption,
    virtual,
  });
  const content = typeof children === "function" ? children(api) : children;

  return (
    <TransferContext value={api}>
      <div
        className={cn(
          "flex min-h-0 flex-col gap-3 rounded-md border border-transparent aria-invalid:border-destructive aria-invalid:ring-destructive/20",
          className
        )}
        {...props}
      >
        {content}
      </div>
    </TransferContext>
  );
}

export interface TransferPanelProps<
  T = SelectorItem,
  V extends SelectorValue = string,
> extends Omit<
  SelectorProps<T, V>,
  "dataSource" | "value" | "defaultValue" | "onChange" | "title"
> {
  type: "source" | "target";
  title?: ReactNode;
  footer?: ReactNode;
  showSearch?: boolean;
  showSelectAll?: boolean;
}

export function TransferPanel<T = SelectorItem, V extends SelectorValue = string>({
  type,
  title,
  footer,
  showSearch = true,
  showSelectAll = true,
  className,
  children,
  ...props
}: TransferPanelProps<T, V>) {
  const transfer = useTransfer<T, V>();
  const isSource = type === "source";
  const items = isSource ? transfer.sourceItems : transfer.targetItems;
  const checkedValues = isSource ? transfer.sourceCheckedValues : transfer.targetCheckedValues;
  const setCheckedValues = isSource
    ? transfer.setSourceCheckedValues
    : transfer.setTargetCheckedValues;

  return (
    <div
      className={cn(
        "flex h-[520px] min-w-0 flex-1 flex-col rounded-md border bg-background",
        className
      )}
    >
      {title ? (
        <div className="flex min-h-11 items-center border-b px-3 font-medium text-sm">{title}</div>
      ) : null}
      <Selector
        {...transfer.selectorProps}
        {...props}
        className="min-h-0 flex-1 gap-2 p-3"
        dataSource={items}
        value={checkedValues}
        onChange={(nextValues) => setCheckedValues(nextValues)}
      >
        {children ?? (
          <DefaultTransferPanelContent showSearch={showSearch} showSelectAll={showSelectAll} />
        )}
      </Selector>
      {footer ? <div className="border-t px-3 py-2">{footer}</div> : null}
    </div>
  );
}

interface DefaultTransferPanelContentProps {
  showSearch?: boolean;
  showSelectAll?: boolean;
}

function DefaultTransferPanelContent({
  showSearch = true,
  showSelectAll = true,
}: DefaultTransferPanelContentProps) {
  const { filteredItems } = useSelector();

  return (
    <>
      {showSearch ? <SelectorSearch /> : null}
      {showSelectAll ? <SelectorSelectAll /> : null}
      {filteredItems.length > 0 ? (
        <SelectorList />
      ) : (
        <div className="min-h-0 flex-1 rounded-md border">
          <SelectorEmpty className="h-full min-h-0" />
        </div>
      )}
    </>
  );
}

type TransferActionChildren = (props: { disabled: boolean; action: () => void }) => ReactNode;

interface TransferActionProps {
  disabled?: boolean;
  children?: TransferActionChildren;
}

export function MoveToTargetAction({ children, disabled }: TransferActionProps) {
  const { moveToTarget, sourceCheckedValues } = useTransfer();
  const isDisabled = sourceCheckedValues.length === 0 || Boolean(disabled);
  if (children) return children({ action: moveToTarget, disabled: isDisabled });
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={moveToTarget}
      disabled={isDisabled}
    >
      <ChevronRight className="size-4" />
    </Button>
  );
}

export function MoveToSourceAction({ children, disabled }: TransferActionProps) {
  const { moveToSource, targetCheckedValues } = useTransfer();
  const isDisabled = targetCheckedValues.length === 0 || Boolean(disabled);
  if (children) return children({ action: moveToSource, disabled: isDisabled });
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={moveToSource}
      disabled={isDisabled}
    >
      <ChevronLeft className="size-4" />
    </Button>
  );
}

export function MoveAllToTargetAction({ children, disabled }: TransferActionProps) {
  const { moveAllToTarget, sourceItems, getDisabled } = useTransfer();
  const isDisabled = !sourceItems.some((item) => !getDisabled(item)) || Boolean(disabled);
  if (children) return children({ action: moveAllToTarget, disabled: isDisabled });
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={moveAllToTarget}
      disabled={isDisabled}
    >
      <ChevronsRight className="size-4" />
    </Button>
  );
}

export function MoveAllToSourceAction({ children, disabled }: TransferActionProps) {
  const { moveAllToSource, targetItems, getDisabled } = useTransfer();
  const isDisabled = !targetItems.some((item) => !getDisabled(item)) || Boolean(disabled);
  if (children) return children({ action: moveAllToSource, disabled: isDisabled });
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={moveAllToSource}
      disabled={isDisabled}
    >
      <ChevronsLeft className="size-4" />
    </Button>
  );
}
