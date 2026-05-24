import {
	closestCenter,
	DndContext,
	type DragOverEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
	arrayMove,
	horizontalListSortingStrategy,
	SortableContext,
	useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DataGrid } from "@rap/components-pro/data-grid";
import type { ColumnDef } from "@tanstack/react-table";
import { type ComponentProps, useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers, type DemoUser } from "./-demo-data";

export function ColumnDndDataGridDemo() {
	const data = useMemo(() => createDemoUsers(20), []);
	const baseColumns = useMemo(() => createUserColumns(), []);
	const [columnIds, setColumnIds] = useState(() => baseColumns.map(getColumnId));
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
	const columns = useMemo<ColumnDef<DemoUser>[]>(() => {
		const byId = new Map(baseColumns.map((column) => [getColumnId(column), column]));
		return columnIds.map((id) => byId.get(id)).filter(Boolean) as ColumnDef<DemoUser>[];
	}, [baseColumns, columnIds]);

	const moveOver = ({ active, over }: DragOverEvent) => {
		if (!over || active.id === over.id) return;
		setColumnIds((previous) => {
			const from = previous.indexOf(String(active.id));
			const to = previous.indexOf(String(over.id));
			return from < 0 || to < 0 ? previous : arrayMove(previous, from, to);
		});
	};

	return (
		<section className="space-y-3">
			<DemoTitle
				title="Column DnD extension"
				description="用 dnd-kit 接管表头拖拽，拖动经过目标列时立即交换。"
			/>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				modifiers={[restrictToHorizontalAxis]}
				onDragOver={moveOver}
			>
				<SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
					<DataGrid
						rowKey="id"
						columns={columns}
						data={data}
						scroll={{ x: 1300, y: 360 }}
						components={{ header: { cell: SortableHeaderCell } }}
						onHeaderCell={(column) => ({ "data-column-id": column.id })}
					/>
				</SortableContext>
			</DndContext>
		</section>
	);
}

function SortableHeaderCell({ style, ...props }: ComponentProps<"div">) {
	const id = String(
		(props as ComponentProps<"div"> & { "data-column-id"?: string })["data-column-id"] ?? "",
	);
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id,
	});

	return (
		<div
			{...props}
			ref={setNodeRef}
			style={{
				...style,
				transform: CSS.Transform.toString(transform),
				transition,
			}}
			className={`${props.className ?? ""} cursor-grab ${isDragging ? "relative z-40 bg-background opacity-80 shadow-md" : ""}`}
			{...attributes}
			{...listeners}
		/>
	);
}

function getColumnId(column: ColumnDef<DemoUser>) {
	return String(column.id ?? ("accessorKey" in column ? column.accessorKey : ""));
}
