import { Choose, Otherwise, When } from "@rap/components-ui/when";
import { cn } from "@rap/utils";
import { type Cell, flexRender, type Row, type Table } from "@tanstack/react-table";
import { type CSSProperties, Fragment, type ReactNode } from "react";
import type { DataGridElementProps, DataGridProps } from "../types";
import { mergeElementProps } from "../utils/merge-element-props";
import { getColumnPinningStyles, getRowPinningStyles } from "../utils/pinning-styles";
import { GridCell, GridRow, gridRowClassName } from "./grid";

export function GridBody<TData>({
	props,
	table,
	rows,
	scrollElement,
}: {
	props: DataGridProps<TData>;
	table: Table<TData>;
	rows: Row<TData>[];
	scrollElement: HTMLElement | null;
}) {
	if (typeof props.components?.body === "function") {
		return props.components.body({ table, rows, scrollElement, children: null });
	}

	const bodyComponents =
		typeof props.components?.body === "object" ? props.components.body : undefined;
	const BodyWrapper = bodyComponents?.wrapper ?? Fragment;
	const BodyRow = bodyComponents?.row ?? GridRow;
	const expandedRowRender =
		props.expandable === false ? undefined : props.expandable?.expandedRowRender;
	const renderedRows = props.rowPinning
		? [...table.getTopRows(), ...table.getCenterRows(), ...table.getBottomRows()]
		: rows;
	const visibleColumns = [
		...table.getLeftLeafColumns(),
		...table.getCenterLeafColumns(),
		...table.getRightLeafColumns(),
	];

	const body = (
		<BodyWrapper>
			{renderedRows.map((row) => {
				const rowPinningStyles = getRowPinningStyles(
					row,
					table.getTopRows().length,
					table.getBottomRows().length,
				);
				const internalRowProps: DataGridElementProps = {
					"data-pinned": row.getIsPinned() || undefined,
					"data-state": row.getIsSelected() ? "selected" : undefined,
					role: "row",
					className: cn(
						gridRowClassName,
						rowPinningStyles.className,
						row.getIsPinned() && "z-20 bg-background",
					),
					style: {
						gridTemplateColumns: "var(--rap-data-grid-template-columns)",
						"--rap-data-grid-row-background":
							props.striped && row.index % 2 === 1 ? "var(--muted)" : "var(--background)",
						...rowPinningStyles.style,
					} as CSSProperties,
				};
				const userRowProps = props.onRow?.(row.original, row.index, { row, table });
				const mergedRowProps = mergeElementProps(internalRowProps, userRowProps);

				return (
					<Fragment key={row.id}>
						<BodyRow {...mergedRowProps}>
							{getOrderedVisibleCells(row, visibleColumns).map((cell) => (
								<GridBodyCell key={cell.id} props={props} table={table} cell={cell} />
							))}
						</BodyRow>
						<When condition={row.getIsExpanded() && Boolean(expandedRowRender)}>
							<GridRow>
								<GridCell className="h-auto py-0" colSpan={row.getVisibleCells().length}>
									{expandedRowRender?.(row.original, row.index, row)}
								</GridCell>
							</GridRow>
						</When>
					</Fragment>
				);
			})}
		</BodyWrapper>
	);

	return body;
}

function getOrderedVisibleCells<TData>(
	row: Row<TData>,
	columns: ReturnType<Table<TData>["getVisibleLeafColumns"]>,
) {
	const cellsByColumnId = new Map(row.getVisibleCells().map((cell) => [cell.column.id, cell]));
	return columns.map((column) => cellsByColumnId.get(column.id)).filter(Boolean) as Cell<
		TData,
		unknown
	>[];
}

function GridBodyCell<TData>({
	props,
	table,
	cell,
}: {
	props: DataGridProps<TData>;
	table: Table<TData>;
	cell: Cell<TData, unknown>;
}) {
	const bodyComponents =
		typeof props.components?.body === "object" ? props.components.body : undefined;
	const CellComponent = bodyComponents?.cell ?? GridCell;
	const pinning = getColumnPinningStyles(cell.column);
	const meta = cell.column.columnDef.meta;
	const shouldApplyWidth =
		cell.column.columnDef.size != null ||
		table.getState().columnSizing[cell.column.id] != null ||
		Boolean(cell.column.getIsPinned());
	const width = shouldApplyWidth ? cell.column.getSize() : undefined;
	const internalProps: DataGridElementProps = {
		className: cn(
			"relative [background-color:var(--rap-data-grid-row-background,var(--background))] group-hover/row:[--rap-data-grid-row-background:var(--muted)]",
			pinning.className,
			meta?.ellipsis && "truncate",
			props.border ? "border-r border-b" : "border-b",
		),
		style: {
			...pinning.style,
			backgroundColor: "var(--rap-data-grid-row-background,var(--background))",
			width,
		},
		"data-pinned": cell.column.getIsPinned() ? "true" : undefined,
	};
	const userProps = props.onCell?.(cell.row.original, cell.row.index, {
		cell,
		row: cell.row,
		column: cell.column,
		table,
	});
	const mergedProps = mergeElementProps(internalProps, userProps);
	const content = (
		<Choose>
			<When condition={"children" in mergedProps}>{mergedProps.children}</When>
			<Otherwise>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Otherwise>
		</Choose>
	);
	const { children: _children, ...cellProps } = mergedProps;

	return (
		<CellComponent {...cellProps} title={getEllipsisTitle(meta?.ellipsis, cell.getValue())}>
			{content as ReactNode}
		</CellComponent>
	);
}

function getEllipsisTitle(ellipsis: unknown, value: unknown) {
	if (!ellipsis) return undefined;
	if (typeof ellipsis === "object" && ellipsis && "showTitle" in ellipsis && !ellipsis.showTitle)
		return undefined;
	return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}
