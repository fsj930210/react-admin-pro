import { cn } from "@rap/utils";
import { flexRender, type Cell, type Row, type Table } from "@tanstack/react-table";
import { Fragment, type ReactNode } from "react";
import type { DataGridElementProps, DataGridProps } from "../types";
import { mergeElementProps } from "../utils/merge-element-props";
import { getColumnPinningStyles, getRowPinningStyles } from "../utils/pinning-styles";
import { GridCell, GridRow } from "./grid";

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

	const bodyComponents = typeof props.components?.body === "object" ? props.components.body : undefined;
	const BodyWrapper = bodyComponents?.wrapper ?? Fragment;
	const BodyRow = bodyComponents?.row ?? GridRow;
	const renderedRows = props.rowPinning
		? [...table.getTopRows(), ...table.getCenterRows(), ...table.getBottomRows()]
		: rows;

	const body = (
		<BodyWrapper>
			{renderedRows.map((row) => {
				const rowPinningStyles = getRowPinningStyles(
					row,
					table.getTopRows().length,
					table.getBottomRows().length,
				);
				return (
					<Fragment key={row.id}>
						<BodyRow
							data-state={row.getIsSelected() ? "selected" : undefined}
							data-pinned={row.getIsPinned() || undefined}
							style={{ ...rowPinningStyles.style }}
							className={cn(rowPinningStyles.className, row.getIsPinned() && "z-20 bg-background")}
							{...props.onRow?.(row.original, row.index, { row, table })}
						>
							{row.getVisibleCells().map((cell) => (
								<GridBodyCell
									key={cell.id}
									props={props}
									table={table}
									cell={cell}
								/>
							))}
						</BodyRow>
						{row.getIsExpanded() && props.expandable && props.expandable.expandedRowRender ? (
							<GridRow >
								<GridCell className="h-auto py-0">
									{props.expandable.expandedRowRender(row.original, row.index, row)}
								</GridCell>
							</GridRow>
						) : null}
					</Fragment>
				)
			})}
		</BodyWrapper>
	);

	return body;
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
	const bodyComponents = typeof props.components?.body === "object" ? props.components.body : undefined;
	const CellComponent = bodyComponents?.cell ?? GridCell;
	const pinning = getColumnPinningStyles(cell.column);
	const meta = cell.column.columnDef.meta;
	const internalProps: DataGridElementProps = {
		className: cn(
			"relative bg-background group-hover/row:bg-muted/50",
			pinning.className,
			meta?.ellipsis && "truncate",
			props.border && "border-r",
		),
		style: {
			...pinning.style,
			width: cell.column.getSize(),
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
	const content = "children" in mergedProps ? mergedProps.children : flexRender(cell.column.columnDef.cell, cell.getContext());
	const { children: _children, ...cellProps } = mergedProps;

	return (
		<CellComponent {...cellProps} title={getEllipsisTitle(meta?.ellipsis, cell.getValue())}>
			{content as ReactNode}
		</CellComponent>
	);
}

function getEllipsisTitle(ellipsis: unknown, value: unknown) {
	if (!ellipsis) return undefined;
	if (typeof ellipsis === "object" && ellipsis && "showTitle" in ellipsis && !ellipsis.showTitle) return undefined;
	return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}
