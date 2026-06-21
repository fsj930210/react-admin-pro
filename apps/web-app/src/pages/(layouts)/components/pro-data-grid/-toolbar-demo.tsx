import { DataGrid } from "@rap/components-pro/data-grid";
import { Button } from "@rap/components-ui/button";
import { Download, Plus, Trash2 } from "lucide-react";
import {
  DemoSection,
  employeeColumns,
  requestEmployees,
  transformEmployeeData,
  transformEmployeeParams,
} from "./-shared";

export function ToolbarDemo() {
  return (
    <DemoSection
      title="工具栏与回车搜索"
      description="左侧按钮直接复用 UI Button props，也支持自定义渲染；右侧可按编号、姓名、邮箱、部门或职位模糊搜索。"
    >
      <DataGrid
        rowKey="employee_id"
        columns={employeeColumns}
        request={requestEmployees}
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
            {
              key: "export",
              type: "custom",
              render: () => (
                <Button variant="outline" icon={<Download />}>
                  导出当前结果
                </Button>
              ),
            },
          ],
          search: { searchKey: "keyword", placeholder: "输入关键字，回车搜索" },
        }}
        pagination={{ defaultPageSize: 6 }}
        scroll={{ x: 1150 }}
      />
    </DemoSection>
  );
}
