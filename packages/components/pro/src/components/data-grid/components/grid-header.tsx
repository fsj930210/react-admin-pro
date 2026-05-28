import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";
import { useSortable } from "@dnd-kit/react/sortable";
import { Choose, Otherwise, When } from "@rap/components-ui/when";
import { cn } from "@rap/utils";
import { flexRender, type Header, type Table } from "@tanstack/react-table";
import { type MouseEvent, type Ref, useMemo } from "react";
import type { ColumnOrderingDragState } from "../hooks/use-column-ordering-dnd";
import type { DataGridElementProps, DataGridProps } from "../types";
import { createColumnOrderModel, getColumnDragGroup } from "../utils/column-ordering";
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
	const headerGroups = getOrderedHeaderGroups(table);
	const leafColumnIndexById = useMemo(() => getLeafColumnIndexById(table), [table]);

	return (
		<div ref={headerRef} className="sticky top-0 z-40 bg-muted">
			<HeaderWrapper>
				{headerGroups.map(({ headerGroup, headers }, index) => {
					const userProps = props.onHeaderRow?.(headers, index, {
						headerGroup,
						table,
					});
					const headerRowProps = mergeElementProps(
						{
							className: cn(gridRowClassName, "bg-muted"),
							style: {
								gridTemplateColumns: "var(--rap-data-grid-template-columns)",
							},
						},
						userProps,
					);

					return (
						<HeaderRow key={headerGroup.id} role="row" {...headerRowProps}>
							{headers.map((header) => (
								<GridHeaderCell
									key={header.id}
									props={props}
									table={table}
									header={header}
									onHeaderContextMenu={onHeaderContextMenu}
									columnOrderingDrag={columnOrderingDrag}
									leafColumnIndexById={leafColumnIndexById}
								/>
							))}
						</HeaderRow>
					);
				})}
			</HeaderWrapper>
		</div>
	);
}

function getOrderedHeaderGroups<TData>(table: Table<TData>) {
	const headerGroups = table.getHeaderGroups();
	const leftHeaderGroups = table.getLeftHeaderGroups();
	const centerHeaderGroups = table.getCenterHeaderGroups();
	const rightHeaderGroups = table.getRightHeaderGroups();

	return headerGroups.map((headerGroup, index) => ({
		headerGroup,
		headers: [
			...(leftHeaderGroups[index]?.headers ?? []),
			...(centerHeaderGroups[index]?.headers ?? []),
			...(rightHeaderGroups[index]?.headers ?? []),
		],
	}));
}

function getLeafColumnIndexById<TData>(table: Table<TData>) {
	const columns = [
		...table.getLeftLeafColumns(),
		...table.getCenterLeafColumns(),
		...table.getRightLeafColumns(),
	];

	return new Map(columns.map((column, index) => [column.id, index]));
}

function GridHeaderCell<TData>({
	props,
	table,
	header,
	onHeaderContextMenu,
	columnOrderingDrag,
	leafColumnIndexById,
}: {
	props: DataGridProps<TData>;
	table: Table<TData>;
	header: Header<TData, unknown>;
	onHeaderContextMenu: (event: MouseEvent, header: Header<TData, unknown>) => void;
	columnOrderingDrag?: ColumnOrderingDragState<TData>;
	leafColumnIndexById: Map<string, number>;
}) {
	const HeaderCell = props.components?.header?.cell ?? GridCell;
	const canDrag = Boolean(columnOrderingDrag?.canDragHeader(header));
	const columnOrderModel = useMemo(() => createColumnOrderModel(table), [table]);
	const {
		ref: sortableRef,
		isDragging,
		handleRef,
		targetRef,
	} = useSortable({
		id: header.column.id,
		index: header.index,
		group: getColumnDragGroup(header.column.id, columnOrderModel),
		type: "column",
		accept: "column",
		disabled: !canDrag,
		modifiers: [RestrictToHorizontalAxis],
	});
	const pinningStyles = getHeaderPinningStyles(header);
	const meta = header.column.columnDef.meta;
	const isLeafHeader = header.colSpan === 1;
	const shouldApplyWidth =
		isLeafHeader &&
		(hasExplicitColumnWidth(header) ||
			table.getState().columnSizing[header.column.id] != null ||
			Boolean(header.column.getIsPinned()));
	const width = shouldApplyWidth ? header.column.getSize() : undefined;
	const gridColumnStart = getHeaderGridColumnStart(header, leafColumnIndexById);
	const internalProps: DataGridElementProps = {
		role: "columnheader",
		className: cn(
			"relative group/th bg-muted [background-color:var(--muted)]",
			canDrag && "cursor-grab select-none active:cursor-grabbing",
			isDragging && "opacity-60 shadow-md",
			props.border ? "border-r border-b" : "border-b",
			pinningStyles.className,
		),
		style: {
			...pinningStyles.style,
			backgroundColor: "var(--muted)",
			gridColumnStart,
			width: width ?? pinningStyles.style?.width,
		},
		"data-pinned": pinningStyles.className ? "true" : undefined,
		"data-rap-data-grid-column-id": header.column.id,
		onContextMenu: (event) => onHeaderContextMenu(event, header),
	};
	const userProps = props.onHeaderCell?.(header.column, { header, table });
	const mergedProps = mergeElementProps(internalProps, userProps);
	const content = (
		<HeaderCell
			{...mergedProps}
			ref={(element) => {
				if (!canDrag) return;
				sortableRef(element);
				targetRef(element);
			}}
			colSpan={header.colSpan}
		>
			<div
				ref={canDrag ? handleRef : undefined}
				className="flex size-full min-w-0 items-center justify-between gap-1"
			>
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
			<HeaderSeparator header={header} border={props.border} />
		</HeaderCell>
	);

	return content;
}

function getHeaderGridColumnStart<TData>(
	header: Header<TData, unknown>,
	leafColumnIndexById: Map<string, number>,
) {
	const leafIds = header.column.getLeafColumns().map((column) => column.id);
	const indices = leafIds
		.map((id) => leafColumnIndexById.get(id))
		.filter((index): index is number => index != null);

	if (!indices.length) {
		return undefined;
	}

	return Math.min(...indices) + 1;
}

function getEllipsisTitle(ellipsis: unknown, value: unknown) {
	if (!ellipsis) return undefined;
	if (typeof ellipsis === "object" && ellipsis && "showTitle" in ellipsis && !ellipsis.showTitle)
		return undefined;
	return typeof value === "string" || typeof value === "number" ? String(value) : undefined;
}
