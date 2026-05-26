import {
	closestCenter,
	DndContext,
	type DraggableAttributes,
	type DraggableSyntheticListeners,
	type DragOverEvent,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { DataGrid } from "@rap/components-pro/data-grid";
import { GripVertical } from "lucide-react";
import { type ComponentProps, createContext, useContext, useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers } from "./-demo-data";

const ROW_DND_COLUMN_ID = "__row_dnd_handle__";

interface RowDragContextValue {
	attributes: DraggableAttributes;
	listeners: DraggableSyntheticListeners | undefined;
	setActivatorNodeRef: (node: HTMLElement | null) => void;
}

const RowDragContext = createContext<RowDragContextValue | null>(null);

export function RowDndDataGridDemo() {
	const [data, setData] = useState(() => createDemoUsers(20));
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
	const columns = useMemo(() => createUserColumns(), []);
	const dndColumn = useMemo(
		() => ({
			id: ROW_DND_COLUMN_ID,
			header: "",
			size: 44,
			cell: () => <RowDragHandle />,
			enableSorting: false,
			enableColumnFilter: false,
			meta: {
				pinned: "left" as const,
			},
		}),
		[],
	);
	const ids = data.map((row) => row.id);

	const moveOver = ({ active, over }: DragOverEvent) => {
		if (!over || active.id === over.id) return;
		setData((previous) => {
			const from = previous.findIndex((item) => item.id === active.id);
			const to = previous.findIndex((item) => item.id === over.id);
			return from < 0 || to < 0 ? previous : arrayMove(previous, from, to);
		});
	};

	return (
		<section className="space-y-3">
			<DemoTitle
				title="Row DnD extension"
				description="用 dnd-kit 接管行拖拽，拖动经过目标行时立即交换，代码可直接复制。"
			/>
			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				modifiers={[restrictToVerticalAxis]}
				onDragOver={moveOver}
			>
				<SortableContext items={ids} strategy={verticalListSortingStrategy}>
					<DataGrid
						rowKey="id"
						columns={columns}
						data={data}
						scroll={{ x: 1300, y: 360 }}
						featureColumns={{
							order: [ROW_DND_COLUMN_ID],
							columns: [dndColumn],
						}}
						components={{ body: { row: SortableRow } }}
						onRow={(record) => ({ "data-row-id": record.id })}
					/>
				</SortableContext>
			</DndContext>
		</section>
	);
}

function SortableRow({ style, ...props }: ComponentProps<"div">) {
	const id = String(
		(props as ComponentProps<"div"> & { "data-row-id"?: string })["data-row-id"] ?? "",
	);
	const {
		attributes,
		listeners,
		setActivatorNodeRef,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({
		id,
	});

	return (
		<RowDragContext.Provider value={{ attributes, listeners, setActivatorNodeRef }}>
			<div
				{...props}
				ref={setNodeRef}
				style={{
					...style,
					transform: CSS.Transform.toString(transform),
					transition,
				}}
				className={`${props.className ?? ""} ${isDragging ? "relative z-30 bg-background opacity-80 shadow-md" : ""}`}
			/>
		</RowDragContext.Provider>
	);
}

function RowDragHandle() {
	const context = useContext(RowDragContext);

	return (
		<button
			type="button"
			ref={context?.setActivatorNodeRef}
			className="flex size-7 cursor-grab items-center justify-center rounded-sm text-muted-foreground hover:bg-muted active:cursor-grabbing"
			aria-label="Drag row"
			{...context?.attributes}
			{...context?.listeners}
		>
			<GripVertical className="size-4" />
		</button>
	);
}
