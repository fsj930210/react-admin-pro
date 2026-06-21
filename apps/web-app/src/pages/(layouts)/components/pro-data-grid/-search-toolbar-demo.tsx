import {
  DataGrid,
  type DataGridRef,
  type DataGridRequestContext,
} from "@rap/components-pro/data-grid";
import { FormItem } from "@rap/components-pro/form";
import { Input } from "@rap/components-pro/input";
import { Search, SearchItem } from "@rap/components-pro/search";
import { Select } from "@rap/components-pro/select";
import { RangePicker, type RangeValue } from "@rap/components-pro/date-picker";
import { Plus, Trash2 } from "lucide-react";
import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";
import { useRef } from "react";
import type { EmployeeQuery } from "@/service/pro-data-grid";
import {
  DemoSection,
  employeeColumns,
  requestEmployees,
  transformEmployeeData,
  transformEmployeeParams,
} from "./-shared";

export function SearchToolbarDemo() {
  const gridRef = useRef<DataGridRef>(null);
  const searchParamsRef = useRef<Record<string, unknown>>({});
  const request = useMemoizedFn((params: EmployeeQuery, context: DataGridRequestContext) =>
    requestEmployees({ ...params, ...searchParamsRef.current }, context)
  );

  function submit(values: Record<string, unknown>) {
    const joinedRange = values.joinedRange as RangeValue;
    searchParamsRef.current = {
      ...values,
      joinedRange: undefined,
      joined_start: joinedRange?.[0]?.format("YYYY-MM-DD"),
      joined_end: joinedRange?.[1]?.format("YYYY-MM-DD"),
    };
    void gridRef.current?.reload();
  }

  return (
    <DemoSection
      title="表格上方高级查询"
      description="多条件 Search 默认收起一行，可展开全部条件；操作按钮独立位于表格左侧。"
    >
      <div className="rounded-md bg-muted/20 p-3">
        <Search
          initialValues={{
            employee_id: "",
            username: "",
            email: "",
            department_code: undefined,
            position: undefined,
            status: undefined,
            joinedRange: null,
          }}
          collapsible="auto"
          defaultCollapsed
          collapsedRows={1}
          itemMinWidth={230}
          searchText="查询"
          resetText="重置"
          onSubmit={submit}
          onReset={submit}
        >
          <SearchItem>
            <FormItem name="employee_id" label="员工编号">
              <Input allowClear placeholder="例如 EMP-0001" />
            </FormItem>
          </SearchItem>
          <SearchItem>
            <FormItem name="username" label="姓名">
              <Input allowClear />
            </FormItem>
          </SearchItem>
          <SearchItem>
            <FormItem name="email" label="邮箱">
              <Input allowClear />
            </FormItem>
          </SearchItem>
          <SearchItem>
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
          <SearchItem>
            <FormItem name="position" label="职位">
              <Select
                allowClear
                options={[
                  "前端工程师",
                  "后端工程师",
                  "产品经理",
                  "交互设计师",
                  "数据分析师",
                  "客户顾问",
                ].map((value) => ({ label: value, value }))}
              />
            </FormItem>
          </SearchItem>
          <SearchItem>
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
          <SearchItem>
            <FormItem name="joinedRange" label="入职时间">
              <RangePicker />
            </FormItem>
          </SearchItem>
        </Search>
      </div>
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
              key: "delete",
              icon: <Trash2 />,
              variant: "destructive",
              children: "批量删除",
              onClick: () => alert("请选择员工"),
            },
          ],
        }}
        pagination={{ defaultPageSize: 6 }}
        scroll={{ x: 1150 }}
      />
    </DemoSection>
  );
}
