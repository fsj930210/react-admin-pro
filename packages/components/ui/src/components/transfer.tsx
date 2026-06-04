import { useControllableState } from "@rap/hooks/use-controllable-state";
import { cn } from "@rap/utils";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import * as React from "react";
import { use, useCallback, useEffect, useMemo } from "react";
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

const TransferContext = React.createContext<TransferContextValue<any, any> | undefined>(undefined);

export function useTransfer<T = SelectorItem, V extends SelectorValue = string>() {
  const context = use(TransferContext);
  if (!context) {
    throw new Error("useTransfer must be used within a Transfer");
  }
  return context as TransferContextValue<T, V>;
}

export interface TransferProps<T = SelectorItem, V extends SelectorValue = string> extends Omit<
  React.ComponentProps<"div">,
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
  children?: React.ReactNode | ((api: TransferRenderApi<T, V>) => React.ReactNode);
}

function readTransferField<T>(item: T, key: keyof T | undefined) {
  if (!key || item == null) return undefined;
  return item[key];
}

function uniqueValues<V extends SelectorValue>(values: V[]) {
  return Array.from(new Set(values));
}

export function Transfer<T = SelectorItem, V extends SelectorValue = string>({
  dataSource,
  value,
  defaultValue = [],
  onChange,
  getValue: getValueProp,
  getLabel,
  getDisabled: getDisabledProp,
  fieldNames,
  filterOption,
  virtual,
  children,
  className,
  ...props
}: TransferProps<T, V>) {
  const [targetValues, setTargetValues] = useControllableState<V[]>(
    { value, defaultValue },
    { defaultValue: [] as V[] }
  );
  const [sourceCheckedValues, setSourceCheckedValues] = React.useState<V[]>([]);
  const [targetCheckedValues, setTargetCheckedValues] = React.useState<V[]>([]);

  const getValue = useCallback(
    (item: T) => {
      if (getValueProp) return getValueProp(item);
      return readTransferField(item, fieldNames?.value ?? ("value" as keyof T)) as V;
    },
    [getValueProp, fieldNames?.value]
  );

  const getDisabled = useCallback(
    (item: T) => {
      if (getDisabledProp) return getDisabledProp(item);
      return Boolean(readTransferField(item, fieldNames?.disabled ?? ("disabled" as keyof T)));
    },
    [getDisabledProp, fieldNames?.disabled]
  );

  const itemMap = useMemo(() => {
    const map = new Map<V, T>();
    for (const item of dataSource) {
      map.set(getValue(item), item);
    }
    return map;
  }, [dataSource, getValue]);

  const targetSet = useMemo(() => new Set(targetValues), [targetValues]);

  const sourceItems = useMemo(
    () => dataSource.filter((item) => !targetSet.has(getValue(item))),
    [dataSource, getValue, targetSet]
  );

  const targetItems = useMemo(
    () => dataSource.filter((item) => targetSet.has(getValue(item))),
    [dataSource, getValue, targetSet]
  );

  useEffect(() => {
    const sourceSet = new Set(sourceItems.map(getValue));
    setSourceCheckedValues((currentValues) =>
      currentValues.filter((itemValue) => sourceSet.has(itemValue))
    );
  }, [getValue, sourceItems]);

  useEffect(() => {
    const currentTargetSet = new Set(targetItems.map(getValue));
    setTargetCheckedValues((currentValues) =>
      currentValues.filter((itemValue) => currentTargetSet.has(itemValue))
    );
  }, [getValue, targetItems]);

  const emitChange = useCallback(
    (nextValues: V[]) => {
      const nextTargetValues = uniqueValues(nextValues);
      setTargetValues(nextTargetValues);
      onChange?.(
        nextTargetValues,
        nextTargetValues
          .map((itemValue) => itemMap.get(itemValue))
          .filter((item): item is T => Boolean(item))
      );
    },
    [itemMap, onChange, setTargetValues]
  );

  const moveToTarget = useCallback(() => {
    emitChange([...targetValues, ...sourceCheckedValues]);
    setSourceCheckedValues([]);
  }, [emitChange, sourceCheckedValues, targetValues]);

  const moveToSource = useCallback(() => {
    const removeSet = new Set(targetCheckedValues);
    emitChange(targetValues.filter((itemValue) => !removeSet.has(itemValue)));
    setTargetCheckedValues([]);
  }, [emitChange, targetCheckedValues, targetValues]);

  const moveAllToTarget = useCallback(() => {
    const movableValues = sourceItems.filter((item) => !getDisabled(item)).map(getValue);
    emitChange([...targetValues, ...movableValues]);
    setSourceCheckedValues([]);
  }, [emitChange, getDisabled, getValue, sourceItems, targetValues]);

  const moveAllToSource = useCallback(() => {
    const movableSet = new Set(targetItems.filter((item) => !getDisabled(item)).map(getValue));
    emitChange(targetValues.filter((itemValue) => !movableSet.has(itemValue)));
    setTargetCheckedValues([]);
  }, [emitChange, getDisabled, getValue, targetItems, targetValues]);

  const selectorProps = useMemo(
    () => ({
      fieldNames,
      getValue: getValueProp,
      getLabel,
      getDisabled: getDisabledProp,
      filterOption,
      virtual,
    }),
    [fieldNames, filterOption, getDisabledProp, getLabel, getValueProp, virtual]
  );

  const api = useMemo<TransferContextValue<T, V>>(
    () => ({
      sourceItems,
      targetItems,
      targetValues,
      sourceCheckedValues,
      targetCheckedValues,
      moveToTarget,
      moveToSource,
      moveAllToTarget,
      moveAllToSource,
      setSourceCheckedValues,
      setTargetCheckedValues,
      getValue,
      getLabel,
      getDisabled,
      selectorProps,
    }),
    [
      sourceItems,
      targetItems,
      targetValues,
      sourceCheckedValues,
      targetCheckedValues,
      moveToTarget,
      moveToSource,
      moveAllToTarget,
      moveAllToSource,
      getValue,
      getLabel,
      getDisabled,
      selectorProps,
    ]
  );

  const content = typeof children === "function" ? children(api) : children;

  return (
    <TransferContext value={api}>
      <div className={cn("flex min-h-0 flex-col gap-3", className)} {...props}>
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
  title?: React.ReactNode;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
}

export function TransferPanel<T = SelectorItem, V extends SelectorValue = string>({
  type,
  title,
  extra,
  footer,
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
      {title || extra ? (
        <div className="flex min-h-11 items-center justify-between border-b px-3">
          <div className="font-medium text-sm">{title}</div>
          {extra}
        </div>
      ) : null}
      <Selector
        {...transfer.selectorProps}
        {...props}
        className="min-h-0 flex-1 gap-2 p-3"
        dataSource={items}
        value={checkedValues}
        onChange={(nextValues) => setCheckedValues(nextValues)}
      >
        {children ?? <DefaultTransferPanelContent />}
      </Selector>
      {footer ? <div className="border-t px-3 py-2">{footer}</div> : null}
    </div>
  );
}

function DefaultTransferPanelContent() {
  const { filteredItems } = useSelector();

  return (
    <>
      <SelectorSearch />
      <SelectorSelectAll />
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

type TransferActionChildren = (props: { disabled: boolean; action: () => void }) => React.ReactNode;

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
