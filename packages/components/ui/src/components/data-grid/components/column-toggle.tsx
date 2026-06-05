import type { DragEndEvent } from "@dnd-kit/abstract";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { Button } from "@rap/components-ui/button";
import { Input } from "@rap/components-ui/input";
import { Sortable } from "@rap/components-ui/sortable";
import { useTranslation } from "@rap/i18n";
import { cn } from "@rap/utils";
import type { Column, Table } from "@tanstack/react-table";
import { Check, GripVertical, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import {
  createColumnOrderModel,
  type DataGridColumnOrderModel,
  getLeafIdsForColumn,
  moveColumnByTarget,
  normalizeColumnOrder,
} from "../utils/column-ordering";

interface DataGridColumnToggleProps<TData> {
  table: Table<TData>;
}

export function DataGridColumnToggle<TData>({ table }: DataGridColumnToggleProps<TData>) {
  const { t } = useTranslation("ui");
  const [search, setSearch] = useState("");
  const model = useMemo(() => createColumnOrderModel(table), [table]);
  const columnOrder = table.getState().columnOrder;
  const safeOrder = useMemo(() => normalizeColumnOrder(columnOrder, model), [columnOrder, model]);
  const orderedColumns = useMemo(
    () => sortColumnsByOrder(table.getAllColumns(), safeOrder, model),
    [table, safeOrder, model]
  );
  const columns = useMemo(() => filterColumns(orderedColumns, search), [orderedColumns, search]);

  const handleDragEnd = (event: DragEndEvent) => {
    const sourceId = event.operation.source?.id;
    const targetId = getColumnToggleTargetIdAtPoint(
      event,
      sourceId == null ? undefined : String(sourceId)
    );
    if (event.operation.canceled || sourceId == null || targetId == null) return;

    table.setColumnOrder(moveColumnByTarget(safeOrder, String(sourceId), targetId, model));
  };

  return (
    <Sortable.Root items={safeOrder} activationDistance={4} onDragEnd={handleDragEnd}>
      <div className="w-64 space-y-2 p-2">
        <Input
          type="text"
          placeholder={t("dataGrid.columnToggle.searchPlaceholder")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="h-8 text-sm"
        />
        <Sortable.List className="max-h-64 space-y-1 overflow-y-auto">
          {columns.map((column, index) => (
            <ColumnToggleItem
              key={column.id}
              column={column}
              depth={0}
              index={index}
              model={model}
              order={safeOrder}
            />
          ))}
        </Sortable.List>
        <div className="border-t pt-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-2"
            onClick={() => table.setColumnOrder(model.leafIds)}
          >
            <RefreshCw className="size-3.5" />
            {t("dataGrid.columnToggle.resetOrder")}
          </Button>
        </div>
      </div>
    </Sortable.Root>
  );
}

function ColumnToggleItem<TData>({
  column,
  depth,
  index,
  model,
  order,
}: {
  column: Column<TData, unknown>;
  depth: number;
  index: number;
  model: DataGridColumnOrderModel;
  order: string[];
}) {
  const isGroup = column.columns.length > 0;
  const canHide = column.getCanHide();
  const leafColumns = isGroup ? column.getLeafColumns() : [column];
  const visible = leafColumns.some((item) => item.getIsVisible());
  const zone = model.pinZoneById.get(column.id);
  const isSortableLeaf = model.leafIdSet.has(column.id);
  const canDrag = isSortableLeaf && Boolean(zone && zone !== "mixed");
  const dragGroup = getColumnToggleDragGroup(column.id, model);
  const children = useMemo(
    () => sortColumnsByOrder(column.columns, order, model),
    [column.columns, order, model]
  );

  return (
    <div>
      {isSortableLeaf ? (
        <Sortable.Item
          id={column.id}
          index={index}
          group={dragGroup}
          type="column"
          accept="column"
          disabled={!canDrag}
          modifiers={[RestrictToVerticalAxis]}
          data-rap-data-grid-column-toggle-id={column.id}
          className={cn(
            "flex items-center gap-1 rounded-sm px-1 py-1 transition-colors hover:bg-accent"
          )}
          style={{ paddingLeft: 4 + depth * 14 }}
        >
          <Sortable.Handle
            className="cursor-grab rounded-sm p-1 opacity-50 hover:opacity-100 active:cursor-grabbing"
            disabled={!canDrag}
          >
            <GripVertical className="size-3.5 text-muted-foreground" />
          </Sortable.Handle>
          <ColumnToggleButton
            column={column}
            canHide={canHide}
            isGroup={isGroup}
            leafColumns={leafColumns}
            visible={visible}
          />
        </Sortable.Item>
      ) : (
        <div
          className={cn(
            "flex items-center gap-1 rounded-sm px-1 py-1 transition-colors hover:bg-accent"
          )}
          style={{ paddingLeft: 4 + depth * 14 }}
        >
          <span className="p-1 opacity-30">
            <GripVertical className="size-3.5 text-muted-foreground" />
          </span>
          <ColumnToggleButton
            column={column}
            canHide={canHide}
            isGroup={isGroup}
            leafColumns={leafColumns}
            visible={visible}
          />
        </div>
      )}
      {isGroup ? (
        <div>
          {children.map((child, childIndex) => (
            <ColumnToggleItem
              key={child.id}
              column={child}
              depth={depth + 1}
              index={childIndex}
              model={model}
              order={order}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ColumnToggleButton<TData>({
  column,
  canHide,
  isGroup,
  leafColumns,
  visible,
}: {
  column: Column<TData, unknown>;
  canHide: boolean;
  isGroup: boolean;
  leafColumns: Column<TData, unknown>[];
  visible: boolean;
}) {
  return (
    <button
      type="button"
      disabled={!canHide && !isGroup}
      className="flex h-7 min-w-0 flex-1 items-center justify-between gap-2 rounded-sm px-1.5 text-left hover:bg-transparent disabled:opacity-70"
      onClick={() => {
        for (const leafColumn of leafColumns) {
          if (leafColumn.getCanHide()) {
            leafColumn.toggleVisibility(!visible);
          }
        }
      }}
    >
      <span className={cn("truncate", isGroup && "font-medium")}>{getColumnTitle(column)}</span>
      <Check className={cn("size-3.5 shrink-0", visible ? "opacity-100" : "opacity-0")} />
    </button>
  );
}

function filterColumns<TData>(
  columns: Column<TData, unknown>[],
  keyword: string
): Column<TData, unknown>[] {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return columns;

  return columns.filter((column) => {
    const title = getColumnTitle(column).toLowerCase();
    return (
      title.includes(normalizedKeyword) ||
      column.id.toLowerCase().includes(normalizedKeyword) ||
      filterColumns(column.columns, keyword).length > 0
    );
  });
}

function sortColumnsByOrder<TData>(
  columns: Column<TData, unknown>[],
  order: string[],
  model: DataGridColumnOrderModel
) {
  const rankById = new Map(order.map((id, index) => [id, index]));

  return [...columns].sort((left, right) => {
    return getColumnOrderRank(left, rankById, model) - getColumnOrderRank(right, rankById, model);
  });
}

function getColumnOrderRank<TData>(
  column: Column<TData, unknown>,
  rankById: Map<string, number>,
  model: DataGridColumnOrderModel
) {
  const ranks = getLeafIdsForColumn(column.id, model)
    .map((id) => rankById.get(id))
    .filter((rank): rank is number => rank != null);

  if (!ranks.length) return Number.MAX_SAFE_INTEGER;
  return Math.min(...ranks);
}

function getColumnToggleTargetIdAtPoint(event: DragEndEvent, sourceId?: string) {
  const fallbackTargetId = event.operation.target?.id;

  if (typeof document === "undefined") {
    return fallbackTargetId == null ? undefined : String(fallbackTargetId);
  }

  const { x, y } = getEventClientPoint(event);
  const targetByRect = getNearestTargetId(
    "[data-rap-data-grid-column-toggle-id]",
    "data-rap-data-grid-column-toggle-id",
    x,
    y,
    sourceId
  );
  if (targetByRect) return targetByRect;

  return fallbackTargetId == null ? undefined : String(fallbackTargetId);
}

function getEventClientPoint(event: DragEndEvent) {
  const nativeEvent = "nativeEvent" in event ? event.nativeEvent : undefined;
  if (
    nativeEvent &&
    "clientX" in nativeEvent &&
    "clientY" in nativeEvent &&
    typeof nativeEvent.clientX === "number" &&
    typeof nativeEvent.clientY === "number"
  ) {
    return { x: nativeEvent.clientX, y: nativeEvent.clientY };
  }

  return event.operation.position.current;
}

function getNearestTargetId(
  selector: string,
  attribute: string,
  x: number,
  y: number,
  sourceId?: string
) {
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(selector))
    .map((element) => {
      const id = element.getAttribute(attribute);
      const rect = element.getBoundingClientRect();
      return { id, rect };
    })
    .filter(
      (item): item is { id: string; rect: DOMRect } =>
        Boolean(item.id) && item.id !== sourceId && item.rect.width > 0 && item.rect.height > 0
    );

  const containing = candidates.find(
    ({ rect }) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
  );
  if (containing) return containing.id;

  return candidates
    .map((item) => ({
      id: item.id,
      distance: Math.hypot(
        x - (item.rect.left + item.rect.width / 2),
        y - (item.rect.top + item.rect.height / 2)
      ),
    }))
    .sort((left, right) => left.distance - right.distance)[0]?.id;
}

function getColumnToggleDragGroup(id: string, model: DataGridColumnOrderModel) {
  const zone = model.pinZoneById.get(id);
  if (!zone || zone === "mixed") {
    return undefined;
  }

  const parentId = model.parentIdById.get(id);
  const isLeaf = model.leafIdSet.has(id);

  if (isLeaf) {
    return `${zone}:leaf:${parentId ?? "__root__"}`;
  }

  return `${zone}:group:${parentId ?? "__root__"}`;
}

function getColumnTitle<TData>(column: Column<TData, unknown>) {
  const header = column.columnDef.header;
  const meta = column.columnDef.meta as { title?: unknown } | undefined;

  if (typeof header === "string") return header;
  if (typeof meta?.title === "string") return meta.title;
  return column.id;
}
