import { useCallback } from "react";
import type {
  ColumnDef,
  OnChangeFn,
  RowData,
  RowPinningState,
} from "@tanstack/react-table";
import { useControllableState } from "../hooks/use-controllable-state";
import type { DataGridFeature, RowPinningConfig } from "../types";

export function useRowPinning<TData extends RowData>(
  _columns: ColumnDef<TData>[],
  config?: RowPinningConfig,
): DataGridFeature<TData> {
  const enabled = config?.enable ?? false;

  const defaultPinningState: RowPinningState = config?.defaultPinningState ?? {
    top: [],
    bottom: [],
  };

  const controlledPinningState = config?.rowPinningState
    ? {
        top: config.rowPinningState.top ?? [],
        bottom: config.rowPinningState.bottom ?? [],
      }
    : undefined;

  const [pinningState, setPinningStateValue] = useControllableState<RowPinningState>(
    defaultPinningState,
    {
      defaultValue: defaultPinningState,
      value: controlledPinningState,
      onChange: config?.onChange,
    }
  );

  const setRowPinning: OnChangeFn<RowPinningState> = useCallback(
    (updater) => {
      const nextState = typeof updater === "function" ? updater(pinningState) : updater;
      const normalizedState: RowPinningState = {
        top: nextState.top ?? [],
        bottom: nextState.bottom ?? [],
      };
      setPinningStateValue(normalizedState);
    },
    [pinningState, setPinningStateValue]
  );

  const pinRow = useCallback(
    (rowId: string, position: "top" | "bottom" | false) => {
      setRowPinning((prev) => {
        const top = prev.top?.filter((id) => id !== rowId) ?? [];
        const bottom = prev.bottom?.filter((id) => id !== rowId) ?? [];

        if (position === "top") {
          return { top: [...top, rowId], bottom };
        }
        if (position === "bottom") {
          return { top, bottom: [...bottom, rowId] };
        }
        return { top, bottom };
      });
    },
    [setRowPinning]
  );

  const unpinRow = useCallback(
    (rowId: string) => {
      pinRow(rowId, false);
    },
    [pinRow]
  );

  const resetRowPinning = useCallback(() => {
    setPinningStateValue(defaultPinningState);
  }, [defaultPinningState, setPinningStateValue]);

  return {
    state: enabled ? { rowPinning: pinningState } : {},
    callbacks: enabled ? { onRowPinningChange: setRowPinning } : {},
    api: {
      pinRow,
      unpinRow,
      resetRowPinning,
    },
  };
}
