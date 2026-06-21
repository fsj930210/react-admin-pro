import {
  DataGrid,
  type DataGridRef,
  type DataGridRequestContext,
} from "@rap/components-pro/data-grid";
import { FormItem } from "@rap/components-pro/form";
import { Input, NumberInput } from "@rap/components-pro/input";
import { Search, SearchItem } from "@rap/components-pro/search";
import { Select } from "@rap/components-pro/select";
import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";
import { FilterX, Plus } from "lucide-react";
import { useRef } from "react";
import type { EmployeeQuery } from "@/service/pro-data-grid";
import {
  DemoSection,
  employeeColumns,
  requestEmployees,
  transformEmployeeData,
  transformEmployeeParams,
} from "./-shared";

export function SideSearchDemo() {
  const gridRef = useRef<DataGridRef>(null);
  const searchParamsRef = useRef<Record<string, unknown>>({});
  const request = useMemoizedFn((params: EmployeeQuery, context: DataGridRequestContext) =>
    requestEmployees({ ...params, ...searchParamsRef.current }, context)
  );

  function submit(values: Record<string, unknown>) {
    searchParamsRef.current = values;
    void gridRef.current?.reload();
  }

  return (
    <DemoSection
      title="左侧查询面板"
      description="查询条件固定在左侧，适合字段较多且需要持续调整条件的列表；右侧是完整表格和操作区。"
    >
      <div className="grid grid-cols-[20rem_minmax(0,1fr)] items-stretch gap-4">
        <aside className="rounded-lg border bg-muted/20 p-4">
          <div className="mb-4">
            <h3 className="font-semibold">员工筛选</h3>
            <p className="text-xs text-muted-foreground">组合条件查询员工档案</p>
          </div>
          <Search
            initialValues={{
              employee_id: "",
              username: "",
              department_code: undefined,
              status: undefined,
              performance_min: undefined,
              performance_max: undefined,
            }}
            collapsible={false}
            actionsLayout="newline"
            fieldsClassName="!grid-cols-1"
            actionsClassName="!justify-start"
            labelAlign="left"
            labelWidth="auto"
            itemMinWidth="100%"
            searchText="查询"
            resetText="重置"
            onSubmit={submit}
            onReset={submit}
          >
            <SearchItem className="[&>[data-slot=field]]:!grid-cols-1">
              <FormItem name="employee_id" label="员工编号">
                <Input allowClear />
              </FormItem>
            </SearchItem>
            <SearchItem className="[&>[data-slot=field]]:!grid-cols-1">
              <FormItem name="username" label="姓名">
                <Input allowClear />
              </FormItem>
            </SearchItem>
            <SearchItem className="[&>[data-slot=field]]:!grid-cols-1">
              <FormItem name="department_code" label="部门">
                <Select
                  allowClear
                  options={[
                    "研发中心",
                    "产品中心",
                    "设计中心",
                    "市场中心",
                    "客户成功部",
                    "财务部",
                  ].map((value) => ({ label: value, value }))}
                />
              </FormItem>
            </SearchItem>
            <SearchItem className="[&>[data-slot=field]]:!grid-cols-1">
              <FormItem name="status" label="状态">
                <Select
                  allowClear
                  options={[
                    { label: "在职", value: "active" },
                    { label: "试用", value: "probation" },
                    { label: "休假", value: "vacation" },
                  ]}
                />
              </FormItem>
            </SearchItem>
            <SearchItem className="[&>[data-slot=field]]:!grid-cols-1">
              <FormItem name="performance_min" label="最低绩效">
                <NumberInput min={60} max={100} />
              </FormItem>
            </SearchItem>
            <SearchItem className="[&>[data-slot=field]]:!grid-cols-1">
              <FormItem name="performance_max" label="最高绩效">
                <NumberInput min={60} max={100} />
              </FormItem>
            </SearchItem>
          </Search>
        </aside>
        <div className="min-w-0 rounded-lg border bg-card p-4 [&>div]:flex [&>div]:h-full [&>div]:min-h-0 [&>div]:flex-col [&>div>div:last-child]:min-h-0 [&>div>div:last-child]:flex-1">
          <DataGrid
            ref={gridRef}
            rowKey="employee_id"
            columns={employeeColumns}
            request={request}
            transformParams={transformEmployeeParams}
            transformData={transformEmployeeData}
            toolbar={{
              buttons: [
                {
                  key: "create",
                  icon: <Plus />,
                  children: "新建员工",
                  onClick: () => alert("打开新建员工表单"),
                },
                {
                  key: "clear",
                  icon: <FilterX />,
                  variant: "outline",
                  children: "清理失效数据",
                  onClick: () => alert("清理失效数据"),
                },
              ],
            }}
            pagination={{ defaultPageSize: 8 }}
            scroll={{ x: 1150, y: "100%" }}
          />
        </div>
      </div>
    </DemoSection>
  );
}
