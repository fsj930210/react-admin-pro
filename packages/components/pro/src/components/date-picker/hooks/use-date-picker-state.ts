import { useControllableState } from "@rap/hooks/use-controllable-state";
import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";
import { useState } from "react";
import type { Dayjs, MultipleValue, PickerPanelMode, RangeValue } from "../types";

interface PickerStateProps<T> {
  value?: T;
  defaultValue?: T;
  open?: boolean;
  defaultOpen?: boolean;
  onChange?: (value: T) => void;
  onOpenChange?: (open: boolean) => void;
  defaultPanelMode?: PickerPanelMode;
  defaultViewDate?: Dayjs;
}

function usePickerState<T>(
  props: PickerStateProps<T>,
  fallbackViewDate: Dayjs,
  defaultPanelMode: PickerPanelMode
) {
  const [value, setValue] = useControllableState<T>({
    value: props.value,
    defaultValue: props.defaultValue as T,
    onChange: props.onChange,
  });
  const [open, setOpen] = useControllableState<boolean>({
    value: props.open,
    defaultValue: props.defaultOpen ?? false,
    onChange: props.onOpenChange,
  });
  const [panelMode, setPanelMode] = useState<PickerPanelMode>(
    props.defaultPanelMode ?? defaultPanelMode
  );
  const [viewDate, setViewDate] = useState<Dayjs>(props.defaultViewDate ?? fallbackViewDate);
  const [hoverValue, setHoverValue] = useState<Dayjs | null>(null);

  return {
    value,
    setValue: useMemoizedFn(setValue),
    open,
    setOpen: useMemoizedFn(setOpen),
    panelMode,
    setPanelMode,
    viewDate,
    setViewDate,
    hoverValue,
    setHoverValue,
  };
}

function useSinglePickerState<T extends Dayjs | MultipleValue | null = Dayjs | null>(
  props: PickerStateProps<T>,
  fallbackViewDate: Dayjs,
  defaultPanelMode: PickerPanelMode
) {
  return usePickerState<T>(props, fallbackViewDate, defaultPanelMode);
}

function useRangePickerState(
  props: PickerStateProps<RangeValue>,
  fallbackViewDate: Dayjs,
  defaultPanelMode: PickerPanelMode
) {
  const state = usePickerState<RangeValue>(props, fallbackViewDate, defaultPanelMode);
  const [activePart, setActivePart] = useState<"start" | "end">("start");

  return {
    ...state,
    activePart,
    setActivePart,
  };
}

export { useRangePickerState, useSinglePickerState };
