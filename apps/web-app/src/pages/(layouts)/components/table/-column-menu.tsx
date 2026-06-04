import { DataGrid } from "@rap/components-ui/data-grid";
import { useMemo } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers } from "./-demo-data";

export function ColumnMenuDataGridDemo() {
  const data = useMemo(() => createDemoUsers(24), []);
  const columns = useMemo(() => createUserColumns(), []);

  return (
    <section className="space-y-3">
      <DemoTitle
        title="Header context menu"
        description="右键表头打开菜单，支持 pin left/right、取消固定、hide、sort 子菜单和 column visibility 子菜单。"
      />
      <DataGrid
        rowKey="id"
        columns={columns}
        data={data}
        scroll={{ x: 1300, y: 360 }}
        contextMenu={{ enable: true }}
      />
    </section>
  );
}
