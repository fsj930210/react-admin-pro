import { DataGrid } from "@rap/components-ui/data-grid";
import { useMemo } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createTreeUsers } from "./-demo-data";

export function ExpandingDataGridDemo() {
  const data = useMemo(() => createTreeUsers(), []);
  const columns = useMemo(() => createUserColumns(), []);

  return (
    <section className="space-y-3">
      <DemoTitle title="Expandable" description="树形数据和展开行渲染共用 expandable 出口。" />
      <DataGrid
        rowKey="id"
        columns={columns}
        data={data}
        scroll={{ x: 1300, y: 420 }}
        expandable={{
          getSubRows: (record) => record.children,
          expandedRowRender: (record) => (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              {record.name} belongs to {record.department}.
            </div>
          ),
        }}
      />
    </section>
  );
}
