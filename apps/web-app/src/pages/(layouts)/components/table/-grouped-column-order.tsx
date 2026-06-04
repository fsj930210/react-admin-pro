import { DataGrid } from "@rap/components-ui/data-grid";
import { Button } from "@rap/components-ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import type { DemoUser } from "./-demo-data";
import { createDemoUsers } from "./-demo-data";

const groupedColumnOrder = [
  "profile-email",
  "profile-name",
  "metrics-status",
  "metrics-score",
  "metrics-salary",
  "organization-position",
  "organization-department",
];

export function GroupedColumnOrderDataGridDemo() {
  const data = useMemo(() => createDemoUsers(18), []);
  const [ordered, setOrdered] = useState(false);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const columns = useMemo<ColumnDef<DemoUser>[]>(
    () => [
      {
        id: "profile",
        header: "Profile",
        columns: [
          { accessorKey: "name", header: "Name", size: 180 },
          { accessorKey: "email", header: "Email", size: 240, meta: { ellipsis: true } },
        ],
      },
      {
        id: "organization",
        header: "Organization",
        columns: [
          { accessorKey: "department", header: "Department", size: 160 },
          { accessorKey: "position", header: "Position", size: 190, meta: { ellipsis: true } },
        ],
      },
      {
        id: "metrics",
        header: "Metrics",
        columns: [
          { accessorKey: "salary", header: "Salary", size: 130 },
          { accessorKey: "score", header: "Score", size: 110 },
          { accessorKey: "status", header: "Status", size: 130 },
        ],
      },
    ],
    []
  );

  return (
    <section className="space-y-3">
      <DemoTitle
        title="Grouped column order"
        description="Grouped headers can be reordered as blocks, while leaf columns only move inside their own group."
      />
      <Button
        variant="outline"
        onClick={() => {
          setOrdered((value) => !value);
          setColumnOrder(ordered ? [] : groupedColumnOrder);
        }}
      >
        Toggle grouped order
      </Button>
      <DataGrid
        rowKey="id"
        columns={columns}
        data={data}
        scroll={{ x: 1100, y: 360 }}
        border
        columnOrdering={{
          drag: true,
          value: columnOrder,
          onChange: setColumnOrder,
        }}
      />
    </section>
  );
}
