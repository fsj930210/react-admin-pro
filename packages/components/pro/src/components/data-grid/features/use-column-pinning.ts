import { useCallback } from "react";
import type {
  ColumnDef,
  ColumnPinningState,
  OnChangeFn,
} from "@tanstack/react-table";
import { useControllableState } from "../hooks/use-controllable-state";
import type { ColumnPinningConfig, DataGridFeature } from "../types";

export function useColumnPinning<TData>(
  _columns: ColumnDef<TData>[],
  config?: ColumnPinningConfig
): DataGridFeature<TData> {
  const enabled = config?.enable ?? false;

  const defaultPinningState: ColumnPinningState = config?.defaultPinningState ?? {
    left: [],
    right: [],
  };

  const controlledPinningState = config?.columnPinningState
    ? {
        left: config.columnPinningState.left ?? [],
        right: config.columnPinningState.right ?? [],
      }
    : undefined;

  const [pinningState, setPinningStateValue] = useControllableState<ColumnPinningState>(
    defaultPinningState,
    {
      defaultValue: defaultPinningState,
      value: controlledPinningState,
      onChange: config?.onChange,
    }
  );

  const setColumnPinning: OnChangeFn<ColumnPinningState> = useCallback(
    (updater) => {
      const nextState = typeof updater === "function" ? updater(pinningState) : updater;
      const normalizedState: ColumnPinningState = {
        left: nextState.left ?? [],
        right: nextState.right ?? [],
      };
      setPinningStateValue(normalizedState);
    },
    [pinningState, setPinningStateValue]
  );

  const pinColumn = useCallback(
    (columnId: string, position: "left" | "right" | false) => {
      setColumnPinning((prev) => {
        const left = prev.left?.filter((id) => id !== columnId) ?? [];
        const right = prev.right?.filter((id) => id !== columnId) ?? [];

        if (position === "left") {
          return { left: [...left, columnId], right };
        }
        if (position === "right") {
          return { left, right: [...right, columnId] };
        }
        return { left, right };
      });
    },
    [setColumnPinning]
  );

  const unpinColumn = useCallback(
    (columnId: string) => {
      pinColumn(columnId, false);
    },
    [pinColumn]
  );

  const resetColumnPinning = useCallback(() => {
    setPinningStateValue(defaultPinningState);
  }, [defaultPinningState, setPinningStateValue]);

  return {
    state: enabled ? { columnPinning: pinningState } : {},
    callbacks: enabled ? { onColumnPinningChange: setColumnPinning } : {},
    api: {
      pinColumn,
      unpinColumn,
      resetColumnPinning,
    },
  };
}
