import { DataGrid } from "@rap/components-ui/data-grid";
import { useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createTreeUsers } from "./-demo-data";

export function RowSelectionDataGridDemo() {
  const data = useMemo(() => createTreeUsers(), []);
  const columns = useMemo(() => createUserColumns(), []);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>(["U-0001"]);

  return (
    <section className="space-y-3">
      <DemoTitle
        title="Row selection"
        description="checkbox、受控选择、禁用行和 checkStrictly=false 父子联动。"
      />
      <DataGrid
        rowKey="id"
        columns={columns}
        data={data}
        scroll={{ x: 1300, y: 420 }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          checkStrictly: false,
          getCheckboxProps: (record) => ({ disabled: record.status === "left" }),
        }}
        expandable={{ getSubRows: (record) => record.children }}
      />
    </section>
  );
}
