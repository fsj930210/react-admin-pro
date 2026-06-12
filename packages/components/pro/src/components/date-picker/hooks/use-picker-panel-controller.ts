import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";
import type { Dayjs, PickerPanelMode } from "../types";

interface PickerPanelControllerOptions {
  panelMode: PickerPanelMode;
  viewDate: Dayjs;
  setPanelMode: (mode: PickerPanelMode) => void;
  setViewDate: (date: Dayjs) => void;
}

function usePickerPanelController(options: PickerPanelControllerOptions) {
  const { viewDate, setPanelMode, setViewDate } = options;

  const setPanelModeValue = useMemoizedFn((nextPanelMode: PickerPanelMode) => {
    setPanelMode(nextPanelMode);
  });

  const setYear = useMemoizedFn((year: number) => {
    setViewDate(viewDate.year(year));
  });

  const setMonth = useMemoizedFn((month: number) => {
    setViewDate(viewDate.month(month));
  });

  const addYear = useMemoizedFn((offset: number) => {
    setViewDate(viewDate.add(offset, "year"));
  });

  const addMonth = useMemoizedFn((offset: number) => {
    setViewDate(viewDate.add(offset, "month"));
  });

  const addYears = useMemoizedFn((offset: number) => {
    setViewDate(viewDate.add(offset, "year"));
  });

  const addViewDate = useMemoizedFn((offset: number, unit: "month" | "year") => {
    setViewDate(viewDate.add(offset, unit));
  });

  return {
    setPanelMode: setPanelModeValue,
    setYear,
    setMonth,
    addMonth,
    addYear,
    addYears,
    addViewDate,
  };
}

export { usePickerPanelController };
