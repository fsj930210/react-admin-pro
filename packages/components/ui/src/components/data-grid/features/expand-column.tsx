import { Button } from "@rap/components-ui/button";
import { cn } from "@rap/utils";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import type { DataGridExpandableConfig } from "../types";

export const DATA_GRID_EXPAND_COLUMN_ID = "__rap_data_grid_expand__";

export function createExpandColumn<TData>(
  config: DataGridExpandableConfig<TData>
): ColumnDef<TData> {
  return {
    id: DATA_GRID_EXPAND_COLUMN_ID,
    size: config.expandColumnWidth ?? 48,
    header: () => config.expandColumnTitle ?? null,
    cell: ({ row }: { row: Row<TData> }) => {
      const canExpand = row.getCanExpand() && (config.rowExpandable?.(row.original) ?? true);
      if (!canExpand) return <span className="inline-block size-7" />;

      const onExpand = () => {
        row.toggleExpanded();
        config.onExpand?.(!row.getIsExpanded(), row.original);
      };

      if (config.expandIcon) {
        return config.expandIcon({ expanded: row.getIsExpanded(), row, onExpand });
      }

      return (
        <Button
          variant="ghost"
          size="icon"
          className="size-7"
          style={{ marginLeft: row.depth * (config.indentSize ?? 16) }}
          onClick={onExpand}
        >
          <ChevronRight
            className={cn("size-4 transition-transform", row.getIsExpanded() && "rotate-90")}
          />
        </Button>
      );
    },
    enableHiding: false,
    enableSorting: false,
    enableColumnFilter: false,
    meta: {
      pinned: config.fixed ?? "left",
    },
  };
}
