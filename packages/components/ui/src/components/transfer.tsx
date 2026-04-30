import { useState, useMemo, createContext, use } from 'react';
import { cn } from "@rap/utils";
import { Selector, type SelectorItem, type SelectorProps } from "./selector";
import { ChevronLeft, ChevronRight, ChevronsLeft } from 'lucide-react';
import { Button } from './button';
import React from 'react';

interface TransferContextValue {
  sourceItems: SelectorItem[];
  targetItems: SelectorItem[];
  selectedValues: string[];
  sourceSelectedValues: string[];
  targetSelectedValues: string[];
  setSourceSelectedValues: (values: string[]) => void;
  setTargetSelectedValues: (values: string[]) => void;
  handleMoveToTarget: () => void;
  handleMoveToSource: () => void;
  handleMoveAllToTarget: () => void;
  handleMoveAllToSource: () => void;
}

const TransferContext = createContext<TransferContextValue | undefined>(undefined);

export function useTransfer() {
  const context = use(TransferContext);
  if (!context) {
    throw new Error("useTransfer must be used within a Transfer");
  }
  return context;
}

interface TransferProps {
  dataSource: SelectorItem[];
  value?: string[];
  defaultValue?: string[];
  children: React.ReactNode;
  onChange?: (value: string[]) => void;
}

export function Transfer({
  dataSource,
  value,
  defaultValue = [],
  onChange,
  children,
}: TransferProps) {
  const [internalValue, setInternalValue] = useState<string[]>(defaultValue);
  const [sourceSelectedValues, setSourceSelectedValues] = useState<string[]>([]);
  const [targetSelectedValues, setTargetSelectedValues] = useState<string[]>([]);
  const isControlled = value !== undefined;
  const selectedValues = isControlled ? value : internalValue;

  const sourceItems = useMemo(() => {
    return dataSource.filter(item => !selectedValues.includes(item.value));
  }, [dataSource, selectedValues]);

  const targetItems = useMemo(() => {
    return dataSource.filter(item => selectedValues.includes(item.value));
  }, [dataSource, selectedValues]);

  const handleValueChange = (newValues: string[]) => {
    if (!isControlled) {
      setInternalValue(newValues);
    }
    onChange?.(newValues);
  };

  const handleMoveToTarget = () => {
    const newValues = [...selectedValues, ...sourceSelectedValues];
    handleValueChange(newValues);
    setSourceSelectedValues([]);
  };

  const handleMoveToSource = () => {
    const newValues = selectedValues.filter(value => !targetSelectedValues.includes(value));
    handleValueChange(newValues);
    setTargetSelectedValues([]);
  };

  const handleMoveAllToTarget = () => {
    const sourceValues = sourceItems.filter(item => !item.disabled).map(item => item.value);
    handleValueChange([...selectedValues, ...sourceValues]);
    setSourceSelectedValues([]);
  };

  const handleMoveAllToSource = () => {
    const targetValues = targetItems.filter(item => !item.disabled).map(item => item.value);
    handleValueChange([...targetValues]);
    setTargetSelectedValues([]);
  };

  const contextValue: TransferContextValue = {
    sourceItems,
    targetItems,
    selectedValues,
    handleMoveToTarget,
    handleMoveToSource,
    handleMoveAllToTarget,
    handleMoveAllToSource,
    sourceSelectedValues,
    targetSelectedValues,
    setSourceSelectedValues,
    setTargetSelectedValues,
  };


  return (
    <TransferContext value={contextValue}>
      {children}
    </TransferContext>
  );

}

interface TransferPanelProps extends Omit<SelectorProps, 'dataSource'> {
  className?: string;
  type: 'source' | 'target';
}
export function TransferPanel({ className, type, ...resetProps }: TransferPanelProps) {
  const { sourceItems, targetItems, setSourceSelectedValues, setTargetSelectedValues } = useTransfer();
  return (
    <div className={cn("h-104 border border-accent", className)}>
      <Selector
        {...resetProps}
        dataSource={type === 'source' ? sourceItems : targetItems}
        onChange={(values, selectedItems) => {
          if (type === 'source') {
            setSourceSelectedValues(values);
          } else {
            setTargetSelectedValues(values);
          }
          resetProps.onChange?.(values, selectedItems);
        }}
      />
    </div>
  );
}

interface MoveToTargetActionProps {
  disabled?: boolean;
  children?: ({ moveToTarget, disabled }: { moveToTarget: () => void; disabled: boolean }) => React.ReactNode;
}
export function MoveToTargetAction({
  children,
  disabled,
}: MoveToTargetActionProps) {
  const { handleMoveToTarget, sourceSelectedValues } = useTransfer();
  const moveToTarget = () => handleMoveToTarget();
  if (children) {
    return children({ moveToTarget, disabled: sourceSelectedValues.length === 0 || !!disabled });
  }
  return (
    <Button
      className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => handleMoveToTarget()}
      disabled={sourceSelectedValues.length === 0 || !!disabled}
      variant="outline"
    >
      <ChevronRight className="size-5" />
      <span>右移</span>
    </Button>
  );
}
interface MoveToSourceActionProps {
  disabled?: boolean;
  children?: ({ moveToSource, disabled }: { moveToSource: () => void; disabled: boolean }) => React.ReactNode;
}
export function MoveToSourceAction({
  children,
  disabled,
}: MoveToSourceActionProps) {
  const { handleMoveToSource, targetSelectedValues } = useTransfer();
  const moveToSource = () => handleMoveToSource();
  if (children) {
    return children({ moveToSource, disabled: targetSelectedValues.length === 0 || !!disabled });
  }
  return (
    <Button
      className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => handleMoveToSource()}
      disabled={targetSelectedValues.length === 0 || !!disabled}
      variant="outline"
    >
      <ChevronLeft className="size-5" />
      <span>左移</span>
    </Button>
  );
}
interface MoveAllToTargetActionProps {
  disabled?: boolean;
  children?: ({ moveAllToTarget, disabled }: { moveAllToTarget: () => void; disabled: boolean }) => React.ReactNode;
}
export function MoveAllToTargetAction({
  children,
  disabled,
}: MoveAllToTargetActionProps) {
  const { handleMoveAllToTarget, sourceItems } = useTransfer();
  if (children) {
    return children({ moveAllToTarget: handleMoveAllToTarget, disabled: sourceItems.length === 0 || !!disabled });
  }
  return (
    <Button
      className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => handleMoveAllToTarget()}
      disabled={sourceItems.length === 0 || !!disabled}
      variant="outline"
    >
      <ChevronRight className="size-5" />
      <span>全部右移</span>
    </Button>
  );
}
interface MoveAllToSourceActionProps {
  disabled?: boolean;
  children?: ({ moveAllToSource, disabled }: { moveAllToSource: () => void; disabled: boolean }) => React.ReactNode;
}
export function MoveAllToSourceAction({
  children,
  disabled,
}: MoveAllToSourceActionProps) {
  const { handleMoveAllToSource, targetItems } = useTransfer();
  if (children) {
    return children({ moveAllToSource: handleMoveAllToSource, disabled: targetItems.length === 0 || !!disabled });
  }
  return (
    <Button
      className="p-2 rounded-md hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={() => handleMoveAllToSource()}
      disabled={targetItems.length === 0 || !!disabled}
      variant="outline"
    >
      <ChevronsLeft className="size-5" />
      <span>全部左移</span>
    </Button>
  );
}