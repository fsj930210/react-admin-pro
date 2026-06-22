import {
  fetchSelectedTreeTransferUsers,
  fetchTreeTransferAsyncOrganizations,
  fetchTreeTransferOrganizationChildren,
  fetchTreeTransferOrganizations,
  fetchTreeTransferUsers,
  type TreeTransferUser,
} from "@/service/tree-transfer";
import { Form, FormItem } from "@rap/components-pro/form";
import { TreeTransfer } from "@rap/components-pro/transfer";
import { Button } from "@rap/components-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rap/components-ui/card";
import type { TreeNode } from "@rap/components-ui/tree/types";
import type { ColumnDef } from "@tanstack/react-table";
import { type ComponentProps, type ReactNode, useEffect, useState } from "react";
import { z } from "zod";

const columns: ColumnDef<TreeTransferUser>[] = [
  { accessorKey: "name", header: "用户名称", meta: { ellipsis: true } },
  { accessorKey: "account", header: "账号", meta: { ellipsis: true } },
];

const organizationPathMap = new Map<string, string>([
  ["grade-1", "一年级"],
  ["grade-1-class-1", "一年级 / 一班"],
  ["grade-1-class-2", "一年级 / 二班"],
  ["grade-2", "二年级"],
  ["grade-2-class-1", "二年级 / 一班"],
  ["grade-2-class-2", "二年级 / 二班"],
]);

const formSchema = z.object({
  users: z.array(z.string()).min(1, "请至少选择一个用户"),
});

type ExampleProps = {
  value?: string[];
  onChange?: (value: string[]) => void;
  title?: {
    left?: ReactNode;
    right?: ReactNode;
  };
} & Omit<
  ComponentProps<typeof TreeTransfer<TreeTransferUser>>,
  | "treeProps"
  | "rowKey"
  | "columns"
  | "loadList"
  | "loadSelected"
  | "organizationColumn"
  | "title"
  | "value"
  | "onChange"
>;

const tableProps = {
  border: true,
  pagination: {
    mode: "local" as const,
    defaultPageSize: 4,
    hideOnSinglePage: true,
    showSizeChanger: false,
  },
};

function SyncTreeTransferExample({ value = [], onChange, title, ...props }: ExampleProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  useEffect(() => {
    // Demo data comes from the same request path a real page would use.
    void fetchTreeTransferOrganizations().then(setTreeData);
  }, []);

  return (
    <TreeTransfer<TreeTransferUser>
      {...props}
      value={value}
      onChange={onChange}
      rowKey="id"
      columns={columns}
      title={title}
      treeProps={{
        treeData,
        searchable: true,
        defaultExpandedKeys: ["grade-1", "grade-2"],
        defaultSelectedKeys: ["grade-1-class-1"],
      }}
      placeholder={{
        tree: "搜索组织",
        source: "搜索用户名称 / 账号",
        target: "搜索已选用户",
      }}
      organizationColumn={{
        title: "所属组织",
        dataIndex: "organizationPath",
        width: 160,
      }}
      loadList={({ treeKey, search, includeChild }) =>
        fetchTreeTransferUsers({ treeKey: String(treeKey), search, includeChild })
      }
      loadSelected={fetchSelectedTreeTransferUsers}
      sourceTableProps={tableProps}
      targetTableProps={tableProps}
    />
  );
}

function AsyncTreeTransferExample({ value = [], onChange, title, ...props }: ExampleProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  useEffect(() => {
    // Async tree only loads the root first; expanding a grade requests its classes.
    void fetchTreeTransferAsyncOrganizations().then(setTreeData);
  }, []);

  return (
    <TreeTransfer<TreeTransferUser>
      {...props}
      value={value}
      onChange={onChange}
      rowKey="id"
      columns={columns}
      title={title}
      defaultIncludeChild
      treeProps={{
        treeData,
        searchable: true,
        defaultSelectedKeys: ["grade-1"],
        asyncLoader: {
          loadChildren: (node) => fetchTreeTransferOrganizationChildren(String(node.key)),
        },
      }}
      placeholder={{
        tree: "搜索已加载组织",
        source: "搜索用户名称 / 账号",
        target: "搜索已选用户",
      }}
      organizationColumn={{
        title: "所属组织",
        dataIndex: "organizationPath",
        width: 160,
      }}
      getTreeNodePathLabel={(node) => organizationPathMap.get(String(node.key)) ?? node.label}
      loadList={({ treeKey, search, includeChild }) =>
        fetchTreeTransferUsers({ treeKey: String(treeKey), search, includeChild })
      }
      loadSelected={fetchSelectedTreeTransferUsers}
      sourceTableProps={tableProps}
      targetTableProps={tableProps}
    />
  );
}

export function TreeTransferDemo() {
  const [syncValue, setSyncValue] = useState<string[]>(["u-3"]);
  const [asyncValue, setAsyncValue] = useState<string[]>(["u-5"]);
  const [leftTitleValue, setLeftTitleValue] = useState<string[]>(["u-1"]);
  const [rightTitleValue, setRightTitleValue] = useState<string[]>(["u-2", "u-3"]);
  const [bothTitleValue, setBothTitleValue] = useState<string[]>(["u-4"]);
  const [formSubmitValues, setFormSubmitValues] = useState<z.infer<typeof formSchema>>();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>TreeTransfer 同步树</CardTitle>
          <CardDescription>
            组织树、候选用户、已选回显都通过 service 请求 mock 接口，树搜索使用 Tree 的 searchable。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SyncTreeTransferExample value={syncValue} onChange={setSyncValue} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>TreeTransfer 异步树</CardTitle>
          <CardDescription>
            首次只加载年级节点，展开节点时再请求班级；包含下级会按当前树节点查询候选用户。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AsyncTreeTransferExample value={asyncValue} onChange={setAsyncValue} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>自定义左侧 Title</CardTitle>
          <CardDescription>只替换左侧候选面板 title，右侧保留默认数量展示。</CardDescription>
        </CardHeader>
        <CardContent>
          <SyncTreeTransferExample
            value={leftTitleValue}
            onChange={setLeftTitleValue}
            title={{
              left: <span className="font-medium text-primary">候选用户</span>,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>自定义右侧 Title</CardTitle>
          <CardDescription>只替换右侧已选面板 title，左侧包含下级查询保持默认。</CardDescription>
        </CardHeader>
        <CardContent>
          <SyncTreeTransferExample
            value={rightTitleValue}
            onChange={setRightTitleValue}
            title={{
              right: <span className="ml-auto font-medium text-primary">已配置用户</span>,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>自定义左右 Title</CardTitle>
          <CardDescription>左右 title 都交给业务完全自定义。</CardDescription>
        </CardHeader>
        <CardContent>
          <SyncTreeTransferExample
            value={bothTitleValue}
            onChange={setBothTitleValue}
            title={{
              left: <span className="font-medium">源数据</span>,
              right: <span className="ml-auto font-medium">目标数据</span>,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>TreeTransfer 表单校验</CardTitle>
          <CardDescription>
            通过 pro Form/FormItem 接入真实校验，错误状态由 FormItem 注入到组件根节点。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form
            initialValues={{ users: [] }}
            validators={{ onSubmit: formSchema }}
            onFinish={(values) => setFormSubmitValues(values)}
          >
            <FormItem name="users" label="用户" required validateMode="submitted">
              <SyncTreeTransferExample />
            </FormItem>
            <Button type="submit">提交</Button>
            {formSubmitValues ? (
              <pre className="mt-3 rounded-md bg-muted p-3 text-xs">
                {JSON.stringify(formSubmitValues, null, 2)}
              </pre>
            ) : null}
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
