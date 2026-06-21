import type { DataGridRequestContext } from "@rap/components-pro/data-grid";
import type { ColumnDef } from "@tanstack/react-table";
import type { ReactNode } from "react";
import {
  fetchEmployees,
  type Employee,
  type EmployeeQuery,
  type EmployeeResponse,
} from "@/service/pro-data-grid";

export function DemoSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-lg border bg-card p-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

export const employeeColumns: ColumnDef<Employee>[] = [
  { accessorKey: "employee_id", header: "员工编号", size: 120, meta: { pinned: "left" } },
  {
    accessorKey: "username",
    header: "姓名",
    size: 110,
    enableColumnFilter: true,
    enableSorting: true,
    meta: {
      filter: { type: "input", searchKey: "username" },
      sort: { sortKey: (order) => ({ order_field: "username", order_direction: order }) },
    },
  },
  { accessorKey: "email", header: "邮箱", size: 210, meta: { ellipsis: true } },
  {
    accessorKey: "department",
    header: "部门",
    size: 130,
    enableColumnFilter: true,
    meta: {
      filter: {
        type: "radio",
        searchKey: "department_code",
        options: ["研发中心", "产品中心", "设计中心", "市场中心", "客户成功部", "财务部"].map(
          (value) => ({ label: value, value })
        ),
      },
    },
  },
  { accessorKey: "position", header: "职位", size: 140 },
  {
    accessorKey: "status",
    header: "状态",
    size: 110,
    enableColumnFilter: true,
    meta: {
      filter: {
        type: "checkbox",
        searchKey: "status",
        options: [
          { label: "在职", value: "active" },
          { label: "试用", value: "probation" },
          { label: "休假", value: "vacation" },
        ],
      },
    },
  },
  {
    accessorKey: "joined_at",
    header: "入职日期",
    size: 120,
    enableSorting: true,
    meta: { sort: { sortKey: (order) => ({ order_field: "joined_at", order_direction: order }) } },
  },
  {
    accessorKey: "performance",
    header: "绩效分",
    size: 100,
    enableSorting: true,
    meta: {
      sort: { sortKey: (order) => ({ order_field: "performance", order_direction: order }) },
    },
  },
];

export function transformEmployeeParams(
  params: Record<string, unknown>,
  context: DataGridRequestContext
): EmployeeQuery {
  return {
    ...params,
    current: context.pagination?.page ?? 1,
    page_size: context.pagination?.pageSize ?? 10,
  };
}

export function transformEmployeeData(response: EmployeeResponse) {
  return { data: response.data.records, total: response.data.total_count };
}

export function requestEmployees(params: EmployeeQuery, context: DataGridRequestContext) {
  return fetchEmployees(params, context);
}
