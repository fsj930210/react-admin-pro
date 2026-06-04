import { DataGrid } from "@rap/components-ui/data-grid";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createTreeUsers, type DemoUser } from "./-demo-data";

export function TreeTableDataGridDemo() {
  const data = useMemo(() => createTreeUsers(), []);
  const columns = useMemo<ColumnDef<DemoUser>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        size: 220,
        cell: ({ row, getValue }) => (
          <span className={row.depth > 0 ? "text-muted-foreground" : "font-medium"}>
            {row.depth > 0 ? "Child - " : "Parent - "}
            {String(getValue())}
          </span>
        ),
        meta: { pinned: "left", ellipsis: true },
      },
      ...createUserColumns().filter((column) =>
        "accessorKey" in column ? column.accessorKey !== "name" : column.id !== "name"
      ),
    ],
    []
  );

  return (
    <section className="space-y-3">
      <DemoTitle
        title="Tree table extension"
        description="树表格包含展开图标、缩进感和行选择，代码可直接复制。"
      />
      <DataGrid
        rowKey="id"
        columns={columns}
        data={data}
        scroll={{ x: 1300, y: 360 }}
        rowSelection={{ checkStrictly: false }}
        expandable={{
          getSubRows: (record) => record.children,
          defaultExpandedRowKeys: ["U-0001"],
          indentSize: 18,
        }}
      />
    </section>
  );
}
