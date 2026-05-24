import { Choose, Otherwise, When } from "@rap/components-ui/when";
import { cn } from "@rap/utils";
import { flexRender, type Header, type Table } from "@tanstack/react-table";
import type { MouseEvent, Ref } from "react";
import type { DataGridElementProps, DataGridProps } from "../types";
import { mergeElementProps } from "../utils/merge-element-props";
import { getColumnPinningStyles } from "../utils/pinning-styles";
import { ColumnFilter } from "./column-filter";
import { ColumnSort } from "./column-sort";
import { GridCell, GridRow } from "./grid";
import { HeaderSeparator } from "./header-separator";

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
	const enableResizing = Boolean(props.columnSizing);
	const width = enableResizing ? header.column.getSize() : undefined;
	const internalProps: DataGridElementProps = {
		role: "columnheader",
		className: cn(
			"relative group/th bg-muted",
			props.border && "border-r",
			pinningStyles.className,
		),
		style: {
			...pinningStyles.style,
			width,
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
					<Choose>
						<When condition={header.isPlaceholder}>
							{null}
						</When>
						<Otherwise>
							{flexRender(header.column.columnDef.header, header.getContext())}
						</Otherwise>
					</Choose>
				</div>
				<When condition={!header.isPlaceholder && header.colSpan === 1}>
					<div className="flex shrink-0 items-center">
						<ColumnFilter column={header.column} table={table} />
						<ColumnSort column={header.column} table={table} />
					</div>
				</When>
			</div>
			<When condition={header.column.getCanResize()}>
				<HeaderSeparator header={header} border={props.border} />
			</When>
		</HeaderCell>
	);

	return content;
}

function getEllipsisTitle(ellipsis: unknown, value: unknown) {
	if (!ellipsis) return undefined;
	if (typeof ellipsis === "object" && ellipsis && "showTitle" in ellipsis && !ellipsis.showTitle) return undefined;
	return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}
