import { DataGrid } from "@rap/components-pro/data-grid";
import {
  DemoSection,
  employeeColumns,
  requestEmployees,
  transformEmployeeData,
  transformEmployeeParams,
} from "./-shared";

export function RequestDemo() {
  return (
    <DemoSection
      title="自动请求与分页"
      description="切换页码或每页条数后自动请求；每页数据、员工编号和姓名均明显不同。"
    >
      <DataGrid
        rowKey="employee_id"
        columns={employeeColumns}
        request={requestEmployees}
        transformParams={transformEmployeeParams}
        transformData={transformEmployeeData}
        pagination={{
          defaultPageSize: 5,
          showSizeChanger: true,
          pageSizeOptions: [5, 10, 20],
          showTotal: (total) => `共 ${total} 位员工`,
        }}
        sorting={false}
        filtering={false}
        scroll={{ x: 1150 }}
      />
    </DemoSection>
  );
}
