import { DataGrid } from "@rap/components-ui/data-grid";
import { Button } from "@rap/components-ui/button";
import type { ColumnDef, ColumnPinningState, RowPinningState } from "@tanstack/react-table";
import { ArrowDownToLine, ArrowUpToLine, PinOff } from "lucide-react";
import { useMemo, useState } from "react";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers, type DemoUser } from "./-demo-data";

export function BasicDataGrid() {
  const data = useMemo(() => createDemoUsers(36), []);
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ["name"],
    right: ["pin-action"],
  });
  const [rowPinning, setRowPinning] = useState<RowPinningState>({ top: [], bottom: [] });
  const columns = useMemo<ColumnDef<DemoUser>[]>(
    () =>
      createUserColumns([
        {
          id: "pin-action",
          header: "Pin row",
          size: 128,
          enableSorting: false,
          enableColumnFilter: false,
          cell: ({ row }) => {
            const isTop = rowPinning.top?.includes(row.id) ?? false;
            const isBottom = rowPinning.bottom?.includes(row.id) ?? false;
            return (
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant={isTop ? "secondary" : "ghost"}
                  className="size-7"
                  onClick={() =>
                    setRowPinning((previous) => ({
                      top: isTop
                        ? previous.top?.filter((id) => id !== row.id)
                        : [...(previous.top ?? []), row.id],
                      bottom: previous.bottom?.filter((id) => id !== row.id),
                    }))
                  }
                >
                  <ArrowUpToLine className="size-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant={isBottom ? "secondary" : "ghost"}
                  className="size-7"
                  onClick={() =>
                    setRowPinning((previous) => ({
                      top: previous.top?.filter((id) => id !== row.id),
                      bottom: isBottom
                        ? previous.bottom?.filter((id) => id !== row.id)
                        : [...(previous.bottom ?? []), row.id],
                    }))
                  }
                >
                  <ArrowDownToLine className="size-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-7"
                  onClick={() =>
                    setRowPinning((previous) => ({
                      top: previous.top?.filter((id) => id !== row.id),
                      bottom: previous.bottom?.filter((id) => id !== row.id),
                    }))
                  }
                >
                  <PinOff className="size-3.5" />
                </Button>
              </div>
            );
          },
          meta: { pinned: "right" },
        },
      ]),
    [rowPinning.bottom, rowPinning.top]
  );

  return (
    <section className="space-y-3">
      <DemoTitle
        title="Basic"
        description="基础表格、列宽、固定列、固定行、空状态和 loading 的组合。"
      />
      <DataGrid
        rowKey="id"
        columns={columns}
        data={data}
        scroll={{ x: 1300, y: 420 }}
        border
        columnSizing={{ columnResizeMode: "onChange" }}
        columnPinning={{ value: columnPinning, onChange: setColumnPinning }}
        rowPinning={{ value: rowPinning, onChange: setRowPinning }}
        columnVisibility={{}}
      />
    </section>
  );
}

export function DemoTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
