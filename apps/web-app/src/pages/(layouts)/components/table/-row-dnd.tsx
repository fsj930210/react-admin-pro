import { DataGrid } from "@rap/components-ui/data-grid";
import {
  Sortable,
} from "@rap/components-ui/sortable";
import { GripVertical } from "lucide-react";
import { type ComponentProps, type ReactNode, useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers } from "./-demo-data";

const ROW_DND_COLUMN_ID = "__row_dnd_handle__";

export function RowDndDataGridDemo() {
  const [data, setData] = useState(() => createDemoUsers(20));
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

  const handleValueChange = (nextIds: string[]) => {
    setData((previous) => {
      const rowById = new Map(previous.map((row) => [row.id, row]));
      const next = nextIds.map((id) => rowById.get(id)).filter(Boolean) as typeof previous;
      return next.length === previous.length ? next : previous;
    });
  };

  return (
    <section className="space-y-3">
      <DemoTitle
        title="Row DnD extension"
        description="Drag rows by the handle and commit the reordered data on drop."
      />
      <Sortable.Root
        items={ids}
        onItemsChange={(nextIds) => handleValueChange(nextIds.map(String))}
        orientation="vertical"
        activationDistance={4}
      >
        <DataGrid
          rowKey="id"
          columns={columns}
          data={data}
          scroll={{ x: 1300, y: 360 }}
          featureColumns={{
            order: [ROW_DND_COLUMN_ID],
            columns: [dndColumn],
          }}
          components={{ body: { wrapper: SortableRows, row: SortableRow } }}
          onRow={(record) => ({ "data-row-id": record.id })}
        />
      </Sortable.Root>
    </section>
  );
}

function SortableRows({ children }: { children?: ReactNode }) {
  return (
    <Sortable.List asChild>
      <div>{children}</div>
    </Sortable.List>
  );
}

function SortableRow({ style, ...props }: ComponentProps<"div">) {
  const id = String(
    (props as ComponentProps<"div"> & { "data-row-id"?: string })["data-row-id"] ?? "",
  );

  return (
    <Sortable.Item id={id} type="row" accept="row" asChild>
      <div
        {...props}
        style={style}
        className={`${props.className ?? ""} data-dragging:relative data-dragging:z-30 data-dragging:bg-background data-dragging:opacity-80 data-dragging:shadow-md`}
      />
    </Sortable.Item>
  );
}

function RowDragHandle() {
  return (
    <Sortable.Handle
      className="flex size-7 cursor-grab items-center justify-center rounded-sm text-muted-foreground hover:bg-muted active:cursor-grabbing"
      aria-label="Drag row"
    >
      <GripVertical className="size-4" />
    </Sortable.Handle>
  );
}
