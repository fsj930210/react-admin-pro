import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";
import { Sortable } from "@rap/components-ui/sortable";
import { Choose, Otherwise, When } from "@rap/components-ui/when";
import { cn } from "@rap/utils";
import {
  type Column,
  flexRender,
  type Header,
  type HeaderGroup,
  type Table,
} from "@tanstack/react-table";
import { useMemo, type MouseEvent, type Ref } from "react";
import type { ColumnOrderingDragState } from "../hooks/use-column-ordering-dnd";
import type { DataGridElementProps, DataGridProps } from "../types";
import {
  createColumnOrderModel,
  getColumnDragGroup,
  getOrderedVisibleLeafColumns,
} from "../utils/column-ordering";
import { mergeElementProps } from "../utils/merge-element-props";
import { getHeaderPinningStyles } from "../utils/pinning-styles";
import { ColumnFilter } from "./column-filter";
import { ColumnSort } from "./column-sort";
import { GridCell, GridRow, gridRowClassName } from "./grid";
import { HeaderSeparator } from "./header-separator";

function hasExplicitColumnWidth<TData>(header: Header<TData, unknown>) {
  return Boolean(header.column.columnDef.meta?.__rapDataGridExplicitSize);
}

export function GridHeader<TData>({
  props,
  table,
  headerRef,
  onHeaderContextMenu,
  columnOrderingDrag,
}: {
  props: DataGridProps<TData>;
  table: Table<TData>;
  headerRef: Ref<HTMLDivElement>;
  onHeaderContextMenu: (event: MouseEvent, header: Header<TData, unknown>) => void;
  columnOrderingDrag?: ColumnOrderingDragState<TData>;
}) {
  const HeaderWrapper = props.components?.header?.wrapper ?? "div";
  const HeaderRow = props.components?.header?.row ?? GridRow;
  const orderedLeafColumns = getOrderedVisibleLeafColumns(table);
  const headerGroups = table.getHeaderGroups();
  const headerDepth = getHeaderDepth(headerGroups);
  const leafColumnIndexById = useMemo(
    () => new Map(orderedLeafColumns.map((column, index) => [column.id, index])),
    [orderedLeafColumns]
  );
  const headers = getRenderableHeaders(headerGroups);
  const userProps = props.onHeaderRow?.(headers, 0, {
    headerGroup: headerGroups[0] as HeaderGroup<TData>,
    table,
  });
  const headerRowProps = mergeElementProps(
    {
      className: cn(gridRowClassName, "items-stretch bg-muted"),
      style: {
        gridTemplateColumns: "var(--rap-data-grid-template-columns)",
        gridAutoRows: "var(--rap-data-grid-row-height)",
      },
    },
    userProps
  );

  return (
    <div ref={headerRef} className="sticky top-0 z-40 bg-muted">
      <HeaderWrapper>
        <HeaderRow {...headerRowProps}>
          {headers.map((header) => (
            <GridHeaderCell
              key={header.id}
              props={props}
              table={table}
              header={header}
              headerDepth={headerDepth}
              leafColumnIndexById={leafColumnIndexById}
              onHeaderContextMenu={onHeaderContextMenu}
              columnOrderingDrag={columnOrderingDrag}
              visibleColumns={orderedLeafColumns}
            />
          ))}
        </HeaderRow>
      </HeaderWrapper>
    </div>
  );
}

function getRenderableHeaders<TData>(headerGroups: HeaderGroup<TData>[]) {
  return headerGroups
    .flatMap((headerGroup) => headerGroup.headers)
    .filter((header) => {
      if (!header.isPlaceholder) return true;
      return false;
    });
}

function getHeaderDepth<TData>(headerGroups: HeaderGroup<TData>[]) {
  const headers = getRenderableHeaders(headerGroups);
  const maxColumnDepth = headers.reduce(
    (maxDepth, header) => Math.max(maxDepth, header.column.depth),
    0
  );

  return maxColumnDepth + 1;
}

function GridHeaderCell<TData>({
  props,
  table,
  header,
  headerDepth,
  leafColumnIndexById,
  onHeaderContextMenu,
  columnOrderingDrag,
  visibleColumns,
}: {
  props: DataGridProps<TData>;
  table: Table<TData>;
  header: Header<TData, unknown>;
  headerDepth: number;
  leafColumnIndexById: Map<string, number>;
  onHeaderContextMenu: (event: MouseEvent, header: Header<TData, unknown>) => void;
  columnOrderingDrag?: ColumnOrderingDragState<TData>;
  visibleColumns: Column<TData, unknown>[];
}) {
  const HeaderCell = props.components?.header?.cell ?? GridCell;
  const canDrag = Boolean(columnOrderingDrag?.canDragHeader(header));
  const columnOrderModel = useMemo(() => createColumnOrderModel(table), [table]);
  const pinningStyles = getHeaderPinningStyles(header, visibleColumns);
  const meta = header.column.columnDef.meta;
  const isLeafHeader = header.colSpan === 1;
  const shouldApplyWidth =
    isLeafHeader &&
    (hasExplicitColumnWidth(header) ||
      table.getState().columnSizing[header.column.id] != null ||
      Boolean(header.column.getIsPinned()));
  const width = shouldApplyWidth ? header.column.getSize() : undefined;
  const leafColumnStart = getHeaderGridColumnStart(header, leafColumnIndexById);
  const rowSpan = getHeaderRowSpan(header, headerDepth);
  const rowStart = getHeaderRowStart(header);
  const isGroupHeader = header.subHeaders.length > 0;
  const isRowSpanningHeader = rowSpan > 1;
  const internalProps: DataGridElementProps = {
    role: "columnheader",
    className: cn(
      "relative group/th bg-muted [background-color:var(--muted)] [border-color:var(--rap-data-grid-border-color)]",
      canDrag && "cursor-grab select-none active:cursor-grabbing",
      "h-full",
      props.border ? "border-r border-b" : "border-b",
      pinningStyles.className
    ),
    style: {
      ...pinningStyles.style,
      backgroundColor: "var(--muted)",
      gridColumnStart: leafColumnStart,
      gridRowStart: rowStart,
      width: width ?? pinningStyles.style?.width,
    },
    "data-pinned": pinningStyles.className ? "true" : undefined,
    "data-rap-data-grid-column-id": header.column.id,
    "data-rap-data-grid-header-group": isGroupHeader ? "true" : undefined,
    "data-rap-data-grid-header-row-span": isRowSpanningHeader ? String(rowSpan) : undefined,
    onContextMenu: (event) => onHeaderContextMenu(event, header),
  };
  const userProps = props.onHeaderCell?.(header.column, { header, table });
  const mergedProps = mergeElementProps(internalProps, userProps);

  const cellContent = (
    <div className="flex size-full min-w-0 items-center justify-between gap-1">
      <div
        className="min-w-0 flex-1 truncate"
        title={getEllipsisTitle(meta?.ellipsis, header.column.columnDef.header)}
      >
        <Choose>
          <When condition={header.isPlaceholder}>{null}</When>
          <Otherwise>{flexRender(header.column.columnDef.header, header.getContext())}</Otherwise>
        </Choose>
      </div>
      <When condition={!header.isPlaceholder && header.colSpan === 1}>
        <div className="flex shrink-0 items-center">
          <ColumnFilter column={header.column} table={table} />
          <ColumnSort column={header.column} table={table} />
        </div>
      </When>
    </div>
  );

  const cell = (
    <HeaderCell {...mergedProps} colSpan={header.colSpan} rowSpan={rowSpan}>
      {canDrag ? <Sortable.Handle asChild>{cellContent}</Sortable.Handle> : cellContent}
      <HeaderSeparator header={header} border={props.border} />
    </HeaderCell>
  );
  if (!canDrag) {
    return cell;
  }

  return (
    <Sortable.Item
      id={header.column.id}
      index={header.index}
      group={getColumnDragGroup(header.column.id, columnOrderModel)}
      type="column"
      accept="column"
      modifiers={[RestrictToHorizontalAxis]}
      asChild
    >
      {cell}
    </Sortable.Item>
  );
}

function getHeaderGridColumnStart<TData>(
  header: Header<TData, unknown>,
  leafColumnIndexById: Map<string, number>
) {
  const indices = header.column
    .getLeafColumns()
    .map((column) => leafColumnIndexById.get(column.id))
    .filter((index): index is number => index != null);

  if (!indices.length) {
    return undefined;
  }

  return Math.min(...indices) + 1;
}

function getHeaderRowSpan<TData>(header: Header<TData, unknown>, headerDepth: number) {
  if (header.subHeaders.length) {
    return 1;
  }

  return Math.max(headerDepth - header.column.depth, 1);
}

function getHeaderRowStart<TData>(header: Header<TData, unknown>) {
  return header.column.depth + 1;
}

function getEllipsisTitle(ellipsis: unknown, value: unknown) {
  if (!ellipsis) return undefined;
  if (typeof ellipsis === "object" && ellipsis && "showTitle" in ellipsis && !ellipsis.showTitle)
    return undefined;
  return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}
