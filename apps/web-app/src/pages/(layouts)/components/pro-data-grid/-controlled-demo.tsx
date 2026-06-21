import { DataGrid, type DataGridRequestContext } from "@rap/components-pro/data-grid";
import { useState } from "react";
import type { Employee, EmployeeQuery, EmployeeResponse } from "@/service/pro-data-grid";
import {
  DemoSection,
  employeeColumns,
  requestEmployees,
  transformEmployeeData,
  transformEmployeeParams,
} from "./-shared";

export function ControlledDemo() {
  const [loading, setLoading] = useState(false);
  const [requestInfo, setRequestInfo] = useState("等待首次请求");
  return (
    <DemoSection
      title="受控 loading 与参数回调"
      description="loading 由外部状态接管；onParamsChange 可以记录每次请求的最终业务参数和触发原因。"
    >
      <div className="rounded-md bg-muted px-3 py-2 font-mono text-xs">{requestInfo}</div>
      <DataGrid<Employee, Record<string, unknown>, EmployeeQuery, EmployeeResponse>
        rowKey="employee_id"
        columns={employeeColumns}
        request={requestEmployees}
        transformParams={transformEmployeeParams}
        transformData={transformEmployeeData}
        loading={loading}
        onLoadingChange={setLoading}
        onParamsChange={(params: EmployeeQuery, context: DataGridRequestContext) => {
          setRequestInfo(`${context.reason}: ${JSON.stringify(params)}`);
        }}
        toolbar={{ search: { searchKey: "keyword", placeholder: "观察上方最终参数" } }}
        pagination={{ defaultPageSize: 5 }}
        scroll={{ x: 1150 }}
      />
    </DemoSection>
  );
}
