import { cn } from "@rap/utils";
import { flexRender, type Header, type Table } from "@tanstack/react-table";
import type { MouseEvent, Ref } from "react";
import type { DataGridElementProps, DataGridProps } from "../types";
import { mergeElementProps } from "../utils/merge-element-props";
import { getColumnPinningStyles } from "../utils/pinning-styles";
import { ColumnFilter } from "./column-filter";
import { ColumnSort } from "./column-sort";
import { GridCell, GridRow } from "./grid";

export function GridHeader<TData>({
	props,
	table,
	headerRef,
	onHeaderContextMenu,
}: {
	props: DataGridProps<TData>;
	table: Table<TData>;
	headerRef: Ref<HTMLDivElement>;
	onHeaderContextMenu: (event: MouseEvent, header: Header<TData, unknown>) => void;
}) {
	const HeaderWrapper = props.components?.header?.wrapper ?? "div";
	const HeaderRow = props.components?.header?.row ?? GridRow;

	return (
		<div ref={headerRef} className="sticky top-0 z-40 bg-muted">
			<HeaderWrapper>
				{table.getHeaderGroups().map((headerGroup, index) => {
					const userProps = props.onHeaderRow?.(headerGroup.headers, index, { headerGroup, table });
					return (
						<HeaderRow
							key={headerGroup.id}
							role="row"
							{...userProps}
						>
							{headerGroup.headers.map((header) => (
								<GridHeaderCell
									key={header.id}
									props={props}
									table={table}
									header={header}
									onHeaderContextMenu={onHeaderContextMenu}
								/>
							))}
						</HeaderRow>
					);
				})}
			</HeaderWrapper>
		</div>
	);
}

function GridHeaderCell<TData>({
	props,
	table,
	header,
	onHeaderContextMenu,
}: {
	props: DataGridProps<TData>;
	table: Table<TData>;
	header: Header<TData, unknown>;
	onHeaderContextMenu: (event: MouseEvent, header: Header<TData, unknown>) => void;
}) {
	const HeaderCell = props.components?.header?.cell ?? GridCell;
	const pinningStyles = getColumnPinningStyles(header.column);
	const meta = header.column.columnDef.meta;
	const internalProps: DataGridElementProps = {
		role: "columnheader",
		className: cn(
			"group/th bg-muted ",
			props.border && "border-r",
			pinningStyles.className,
		),
		style: {
			...pinningStyles.style,
			width: header.column.getSize(),
		},
		"data-pinned": header.column.getIsPinned() ? "true" : undefined,
		onContextMenu: (event) => onHeaderContextMenu(event, header),
	};
	const userProps = props.onHeaderCell?.(header.column, { header, table });
	const mergedProps = mergeElementProps(internalProps, userProps);
	const content = (
		<HeaderCell {...mergedProps} colSpan={header.colSpan}>
			<div className="flex size-full min-w-0 items-center justify-between gap-1">
				<div className="min-w-0 flex-1 truncate" title={getEllipsisTitle(meta?.ellipsis, header.column.columnDef.header)}>
					{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
				</div>
				{!header.isPlaceholder && header.colSpan === 1 ? (
					<div className="flex shrink-0 items-center">
						<ColumnFilter column={header.column} table={table} />
						<ColumnSort column={header.column} table={table} />
					</div>
				) : null}
			</div>
			{header.column.getCanResize() ? (
				<div
					onMouseDown={header.getResizeHandler()}
					onTouchStart={header.getResizeHandler()}
					className="absolute right-0 top-0 h-full w-1 cursor-col-resize touch-none select-none bg-border opacity-0 group-hover/th:opacity-100"
				/>
			) : null}
		</HeaderCell>
	);

	return content;
}

function getEllipsisTitle(ellipsis: unknown, value: unknown) {
	if (!ellipsis) return undefined;
	if (typeof ellipsis === "object" && ellipsis && "showTitle" in ellipsis && !ellipsis.showTitle) return undefined;
	return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}
