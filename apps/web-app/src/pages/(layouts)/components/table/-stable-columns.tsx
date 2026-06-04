import { DATA_GRID_COLUMN_IDS, DataGrid, type DataGridProps } from "@rap/components-ui/data-grid";
import { useEffect, useState } from "react";
import { DemoTitle } from "./-basic";
import type { DemoUser } from "./-demo-data";
import { createTreeUsers } from "./-demo-data";

export function StableColumnsDataGridDemo() {
  const [data] = useState(() => createTreeUsers());
  const [tick, setTick] = useState(0);
  const [autoRender, setAutoRender] = useState(true);

  useEffect(() => {
    if (!autoRender) {
      return;
    }

    const timer = window.setInterval(() => setTick((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [autoRender]);

  const columns: DataGridProps<DemoUser>["columns"] = [
    {
      accessorKey: "name",
      header: `Name (${tick})`,
      size: 180,
      enableColumnFilter: true,
      meta: {
        ellipsis: true,
        filter: { type: "input" },
        pinned: "left",
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      size: 240,
      enableColumnFilter: true,
      meta: { ellipsis: true, filter: { type: "input" } },
    },
    { accessorKey: "age", header: "Age", size: 100, enableSorting: true },
    {
      accessorKey: "department",
      header: "Department",
      size: 160,
      enableColumnFilter: true,
      meta: {
        filter: {
          type: "radio",
          options: ["Engineering", "Product", "Design", "Operations"].map((value) => ({
            label: value,
            value,
          })),
        },
      },
    },
    { accessorKey: "position", header: "Position", size: 190, meta: { ellipsis: true } },
    { accessorKey: "joinDate", header: "Join Date", size: 140 },
    {
      accessorKey: "salary",
      header: "Salary",
      size: 130,
      cell: ({ getValue }) => `$${Number(getValue()).toLocaleString()}`,
    },
    { accessorKey: "status", header: "Status", size: 130 },
    { accessorKey: "score", header: "Score", size: 110 },
  ];

  return (
    <section className="space-y-3">
      <DemoTitle
        title="Stable columns and partial pinning order"
        description="Columns are recreated on every render. Keep a filter dropdown open while the render counter changes; the column tree stays stable by id. The left pinned order only lists the columns we care about."
      />
      <div className="flex items-center gap-3 text-sm">
        <label className="flex items-center gap-2">
          <input
            aria-label="Auto rerender"
            type="checkbox"
            checked={autoRender}
            onChange={(event) => setAutoRender(event.target.checked)}
          />
          Auto rerender
        </label>
        <span className="text-muted-foreground">Render tick: {tick}</span>
      </div>
      <DataGrid
        rowKey="id"
        columns={columns}
        data={data}
        scroll={{ x: 1300, y: 360 }}
        rowSelection={{}}
        expandable={{
          getSubRows: (record) => record.children,
        }}
        columnPinning={{
          leftOrder: [DATA_GRID_COLUMN_IDS.selection, DATA_GRID_COLUMN_IDS.expand, "name"],
        }}
        filtering={{ mode: "local" }}
        sorting={{ mode: "local" }}
      />
    </section>
  );
}
