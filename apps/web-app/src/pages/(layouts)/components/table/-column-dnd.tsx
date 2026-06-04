import { DataGrid } from "@rap/components-ui/data-grid";
import { useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers } from "./-demo-data";

export function ColumnDndDataGridDemo() {
  const data = useMemo(() => createDemoUsers(20), []);
  const columns = useMemo(() => createUserColumns(), []);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);

  return (
    <section className="space-y-3">
      <DemoTitle
        title="Column DnD"
        description="Built-in column ordering keeps pinned and grouped column movement constrained."
      />
      <DataGrid
        rowKey="id"
        columns={columns}
        data={data}
        scroll={{ x: 1300, y: 360 }}
        columnOrdering={{
          drag: true,
          value: columnOrder,
          onChange: setColumnOrder,
        }}
      />
    </section>
  );
}
