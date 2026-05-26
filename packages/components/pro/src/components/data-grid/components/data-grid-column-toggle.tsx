import type { DragEndEvent, DragMoveEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/abstract";
import { RestrictToVerticalAxis } from "@dnd-kit/abstract/modifiers";
import { DragDropProvider } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import { Button } from "@rap/components-ui/button";
import { Input } from "@rap/components-ui/input";
import { cn } from "@rap/utils";
import type { Column, Table } from "@tanstack/react-table";
import { Check, GripVertical, RefreshCw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
	canMoveColumnByTarget,
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
	const [search, setSearch] = useState("");
	const model = useMemo(() => createColumnOrderModel(table), [table]);
	const initialOrderRef = useRef<string[]>([]);
	const previewOrderRef = useRef<string[]>([]);
	const lastTargetRef = useRef<string | undefined>(undefined);
	const columnOrder = table.getState().columnOrder;
	const safeOrder = useMemo(() => normalizeColumnOrder(columnOrder, model), [columnOrder, model]);
	const orderedColumns = useMemo(
		() => sortColumnsByOrder(table.getAllColumns(), safeOrder, model),
		[table, safeOrder, model],
	);
	const columns = useMemo(() => filterColumns(orderedColumns, search), [orderedColumns, search]);

	const getSafeOrder = () => normalizeColumnOrder(table.getState().columnOrder, model);

	const handleDragStart = (event: DragStartEvent) => {
		if (!isKnownColumnId(event.operation.source?.id, model)) return;
		const safeOrder = getSafeOrder();
		initialOrderRef.current = safeOrder;
		previewOrderRef.current = safeOrder;
		lastTargetRef.current = undefined;
	};

	const handleDragOver = (event: DragMoveEvent | DragOverEvent) => {
		const { source, target } = event.operation;
		if (!isKnownColumnId(source?.id, model) || !isKnownColumnId(target?.id, model)) return;
		const sourceId = String(source?.id);
		const targetId = String(target?.id);
		if (sourceId === targetId || lastTargetRef.current === targetId) return;
		if (!canMoveColumnByTarget(sourceId, targetId, model)) return;

		lastTargetRef.current = targetId;
		const nextOrder = moveColumnByTarget(previewOrderRef.current, sourceId, targetId, model);
		previewOrderRef.current = nextOrder;
		table.setColumnOrder(nextOrder);
	};

	const handleDragEnd = (event: DragEndEvent) => {
		if (!isKnownColumnId(event.operation.source?.id, model)) return;
		if (event.canceled) {
			table.setColumnOrder(initialOrderRef.current);
		}
		lastTargetRef.current = undefined;
	};

	return (
		<DragDropProvider
			onDragStart={handleDragStart}
			onDragMove={handleDragOver}
			onDragOver={handleDragOver}
			onDragEnd={handleDragEnd}
		>
			<div className="w-64 space-y-2 p-2">
				<Input
					type="text"
					placeholder="Search columns..."
					value={search}
					onChange={(event) => setSearch(event.target.value)}
					className="h-8 text-sm"
				/>
				<div className="max-h-64 space-y-1 overflow-y-auto">
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
				</div>
				<div className="border-t pt-2">
					<Button
						variant="outline"
						size="sm"
						className="w-full gap-2"
						onClick={() => table.setColumnOrder(model.leafIds)}
					>
						<RefreshCw className="size-3.5" />
						Reset column order
					</Button>
				</div>
			</div>
		</DragDropProvider>
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
	const canDrag = Boolean(zone && zone !== "mixed");
	const dragGroup = getColumnToggleDragGroup(column.id, model);
	const {
		ref: sortableRef,
		handleRef,
		targetRef,
		isDragging,
	} = useSortable({
		id: column.id,
		index,
		group: dragGroup,
		type: "column",
		accept: (source) => {
			const sourceId = String(source.id);
			return sourceId !== column.id && getColumnToggleDragGroup(sourceId, model) === dragGroup;
		},
		disabled: !canDrag,
		modifiers: [RestrictToVerticalAxis],
	});
	const children = useMemo(
		() => sortColumnsByOrder(column.columns, order, model),
		[column.columns, order, model],
	);

	return (
		<div>
			<div
				ref={(element) => {
					if (!canDrag) return;
					sortableRef(element);
					targetRef(element);
				}}
				className={cn(
					"flex items-center gap-1 rounded-sm px-1 py-1 transition-colors hover:bg-accent",
					isDragging && "opacity-60",
				)}
				style={{ paddingLeft: 4 + depth * 14 }}
			>
				<button
					ref={canDrag ? handleRef : undefined}
					type="button"
					className="cursor-grab rounded-sm p-1 opacity-50 hover:opacity-100 active:cursor-grabbing"
					disabled={!canDrag}
				>
					<GripVertical className="size-3.5 text-muted-foreground" />
				</button>
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
			</div>
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

function filterColumns<TData>(
	columns: Column<TData, unknown>[],
	keyword: string,
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
	model: DataGridColumnOrderModel,
) {
	const rankById = new Map(order.map((id, index) => [id, index]));

	return [...columns].sort((left, right) => {
		return getColumnOrderRank(left, rankById, model) - getColumnOrderRank(right, rankById, model);
	});
}

function getColumnOrderRank<TData>(
	column: Column<TData, unknown>,
	rankById: Map<string, number>,
	model: DataGridColumnOrderModel,
) {
	const ranks = getLeafIdsForColumn(column.id, model)
		.map((id) => rankById.get(id))
		.filter((rank): rank is number => rank != null);

	if (!ranks.length) return Number.MAX_SAFE_INTEGER;
	return Math.min(...ranks);
}

function isKnownColumnId(id: unknown, model: DataGridColumnOrderModel) {
	if (id == null) return false;
	return model.leafIdsById.has(String(id));
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
