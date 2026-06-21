import { DataGrid } from "@rap/components-pro/data-grid";
import {
  DemoSection,
  employeeColumns,
  requestEmployees,
  transformEmployeeData,
  transformEmployeeParams,
} from "./-shared";

export function ColumnQueryDemo() {
  return (
    <DemoSection
      title="表头筛选与排序"
      description="姓名、部门、状态直接映射后端字段；姓名、日期、绩效排序会转换成接口的 order_field/order_direction。"
    >
      <DataGrid
        rowKey="employee_id"
        columns={employeeColumns}
        request={requestEmployees}
        transformParams={transformEmployeeParams}
        transformData={transformEmployeeData}
        pagination={{ defaultPageSize: 8, showTotal: (total) => `筛选后 ${total} 条` }}
        scroll={{ x: 1150 }}
      />
    </DemoSection>
  );
}
