import { DataGrid } from "@rap/components-pro/data-grid";
import { RangePicker, type RangeValue } from "@rap/components-pro/date-picker";
import { Input } from "@rap/components-pro/input";
import { Button } from "@rap/components-ui/button";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import type { Employee } from "@/service/pro-data-grid";
import {
  DemoSection,
  employeeColumns,
  requestEmployees,
  transformEmployeeData,
  transformEmployeeParams,
} from "./-shared";

const rangeColumns: ColumnDef<Employee>[] = employeeColumns.map((column) =>
  "accessorKey" in column && column.accessorKey === "joined_at"
    ? {
        ...column,
        enableColumnFilter: true,
        meta: {
          ...column.meta,
          filter: {
            type: "custom",
            searchKey: (value) => {
              const range = value as RangeValue;
              return {
                joined_start: range?.[0]?.format("YYYY-MM-DD"),
                joined_end: range?.[1]?.format("YYYY-MM-DD"),
              };
            },
            render: ({ column: tableColumn }) => (
              <RangePicker
                className="w-64"
                value={(tableColumn.getFilterValue() as RangeValue) ?? null}
                onChange={(value) => tableColumn.setFilterValue(value ?? undefined)}
              />
            ),
          },
        },
      }
    : column
);

function CustomEmployeeSearch({
  search,
  reset,
}: {
  search: (params?: Record<string, unknown>) => void;
  reset: () => void;
}) {
  const [name, setName] = useState("");
  const [range, setRange] = useState<RangeValue>(null);
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Input
        className="w-40"
        value={name}
        placeholder="姓名"
        onChange={(value) => setName(String(value ?? ""))}
      />
      <RangePicker className="w-64" value={range} onChange={setRange} />
      <Button
        onClick={() =>
          search({
            username: name || undefined,
            joined_start: range?.[0]?.format("YYYY-MM-DD"),
            joined_end: range?.[1]?.format("YYYY-MM-DD"),
          })
        }
      >
        查询
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          setName("");
          setRange(null);
          reset();
        }}
      >
        重置
      </Button>
    </div>
  );
}

export function ComplexQueryDemo() {
  return (
    <DemoSection
      title="复杂字段与自定义搜索"
      description="入职时间筛选值是一个范围，searchKey 函数将它转换成 joined_start/joined_end；工具栏也可提交任意多字段参数。"
    >
      <DataGrid
        rowKey="employee_id"
        columns={rangeColumns}
        request={requestEmployees}
        transformParams={transformEmployeeParams}
        transformData={transformEmployeeData}
        toolbar={{
          search: { type: "custom", render: (context) => <CustomEmployeeSearch {...context} /> },
        }}
        pagination={{ defaultPageSize: 6 }}
        scroll={{ x: 1250 }}
      />
    </DemoSection>
  );
}
