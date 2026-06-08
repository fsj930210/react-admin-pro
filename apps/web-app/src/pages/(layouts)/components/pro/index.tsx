import { ConfirmButton } from "@rap/components-pro/action";
import { ProButton } from "@rap/components-pro/button";
import {
  DatePicker,
  RangePicker,
  TimePicker,
  TimeRangePicker,
} from "@rap/components-pro/date-picker";
import { Page, PageOverlay, SplitLayout } from "@rap/components-pro/layout";
import { Input, InputNumber } from "@rap/components-pro/input";
import { ProDataGrid } from "@rap/components-pro/pro-data-grid";
import { Cascader, RemoteSelect, TreeSelect, type ProOption } from "@rap/components-pro/select";
import { ProSearchBar, useProSearch } from "@rap/components-pro/search";
import { Transfer, TreeTransfer } from "@rap/components-pro/transfer";
import { ChunkUpload } from "@rap/components-pro/upload";
import { ProForm, PageOverlayForm, useProForm } from "@rap/components-pro/form";
import { Badge } from "@rap/components-ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@rap/components-ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rap/components-ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rap/components-ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { Download, Plus, Trash2, Upload } from "lucide-react";
import * as React from "react";

export const Route = createFileRoute("/(layouts)/components/pro/")({
  component: ProComponentsDemo,
});

type User = {
  id: string;
  name: string;
  phone: string;
  status: "enabled" | "disabled";
  role: string;
  org: string;
  createdAt: string;
};

const users: User[] = Array.from({ length: 78 }, (_, index) => ({
  id: String(index + 1),
  name: `用户 ${index + 1}`,
  phone: `1380000${String(index + 1).padStart(4, "0")}`,
  status: index % 5 === 0 ? "disabled" : "enabled",
  role: ["管理员", "运营", "财务", "访客"][index % 4],
  org: ["总公司", "研发中心", "销售中心", "财务中心"][index % 4],
  createdAt: `2026-06-${String((index % 28) + 1).padStart(2, "0")}`,
}));

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "姓名",
    enableSorting: true,
    meta: { sort: { key: "userName" }, ellipsis: true },
  },
  { accessorKey: "phone", header: "手机号", meta: { ellipsis: true } },
  {
    accessorKey: "status",
    header: "状态",
    enableColumnFilter: true,
    meta: {
      filter: {
        key: "status",
        type: "select",
        options: [
          { label: "启用", value: "enabled" },
          { label: "停用", value: "disabled" },
        ],
      },
    },
    cell: ({ getValue }) => (
      <Badge variant={getValue() === "enabled" ? "default" : "secondary"}>
        {getValue() === "enabled" ? "启用" : "停用"}
      </Badge>
    ),
  },
  { accessorKey: "role", header: "角色", meta: { ellipsis: true } },
  {
    accessorKey: "org",
    header: "组织",
    enableColumnFilter: true,
    meta: { filter: { key: "org", type: "input" } },
  },
  {
    accessorKey: "createdAt",
    header: "创建时间",
    enableSorting: true,
    meta: { sort: { key: "created_time" } },
  },
];

async function requestUsers(params: any) {
  await new Promise((resolve) => window.setTimeout(resolve, 260));
  let list = [...users];
  if (params.keyword) {
    list = list.filter(
      (item) => item.name.includes(params.keyword) || item.phone.includes(params.keyword)
    );
  }
  if (params.search?.name) list = list.filter((item) => item.name.includes(params.search.name));
  if (params.search?.status) list = list.filter((item) => item.status === params.search.status);
  if (params.filters?.status) list = list.filter((item) => item.status === params.filters.status);
  if (params.filters?.org)
    list = list.filter((item) => item.org.includes(String(params.filters.org)));
  for (const sorter of params.sorter ?? []) {
    list.sort((a, b) => {
      const left = String((a as any)[sorter.columnId] ?? "");
      const right = String((b as any)[sorter.columnId] ?? "");
      return sorter.order === "desc" ? right.localeCompare(left) : left.localeCompare(right);
    });
  }
  const start = (params.page - 1) * params.pageSize;
  return { data: list.slice(start, start + params.pageSize), total: list.length };
}

function DemoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function UserSearchFields({ search }: { search: ReturnType<typeof useProSearch<any>> }) {
  return (
    <>
      <ProSearchBar.Item name="name">
        <Input
          value={search.values.name ?? ""}
          onValueChange={(value) => search.setValue("name", value)}
          placeholder="姓名"
        />
      </ProSearchBar.Item>
      <ProSearchBar.Item name="status">
        <Select
          value={search.values.status ?? ""}
          onValueChange={(value) => search.setValue("status", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="enabled">启用</SelectItem>
            <SelectItem value="disabled">停用</SelectItem>
          </SelectContent>
        </Select>
      </ProSearchBar.Item>
      <ProSearchBar.Item name="createdAt" span={2}>
        <RangePicker changeMode="confirm" />
      </ProSearchBar.Item>
      <ProSearchBar.Actions className="xl:col-span-4">
        <ProButton onClick={() => void search.submit()}>查询</ProButton>
        <ProButton variant="outline" onClick={search.reset}>
          重置
        </ProButton>
        <ProButton variant="ghost" onClick={search.toggleExpanded}>
          {search.expanded ? "收起" : "展开"}
        </ProButton>
      </ProSearchBar.Actions>
    </>
  );
}

function ProDataGridDemos() {
  const [open, setOpen] = React.useState(false);
  const search = useProSearch({ defaultValues: { name: "", status: "" } });
  const form = useProForm({
    defaultValues: { name: "", phone: "", age: 18 },
    validate: (values) => ({ name: values.name ? undefined : "请输入姓名" }),
  });

  return (
    <Page
      title="ProDataGrid"
      description="包含表头筛选、上方筛选、侧边筛选、toolbar、keywordSearch 和 PageOverlay。"
    >
      <Tabs defaultValue="top">
        <TabsList className="flex-wrap">
          <TabsTrigger value="top">上方筛选</TabsTrigger>
          <TabsTrigger value="left">侧边筛选</TabsTrigger>
          <TabsTrigger value="header">表头筛选</TabsTrigger>
          <TabsTrigger value="page">PageOverlay</TabsTrigger>
        </TabsList>
        <TabsContent value="top">
          <ProDataGrid
            rowKey="id"
            columns={columns}
            request={requestUsers}
            search={search}
            renderSearchBar={(controller) => (
              <ProSearchBar search={controller} collapsedRows={1}>
                <UserSearchFields search={controller} />
              </ProSearchBar>
            )}
            toolbar={{
              buttons: [
                { key: "create", children: "新建", icon: <Plus />, onClick: () => setOpen(true) },
                { key: "delete", children: "删除", icon: <Trash2 />, variant: "outline" },
                { key: "import", children: "导入", icon: <Upload />, variant: "outline" },
                { key: "export", children: "导出", icon: <Download />, variant: "outline" },
              ],
            }}
            keywordSearch={{ placeholder: "搜索姓名/手机号" }}
            rowSelection={{}}
            scroll={{ x: 900 }}
          />
        </TabsContent>
        <TabsContent value="left">
          <ProDataGrid
            rowKey="id"
            columns={columns}
            request={requestUsers}
            search={search}
            searchBarPosition="left"
            renderSearchBar={(controller) => (
              <ProSearchBar search={controller} position="left" collapsedRows={3}>
                <UserSearchFields search={controller} />
              </ProSearchBar>
            )}
            keywordSearch={{ placeholder: "快速搜索" }}
            scroll={{ x: 900 }}
          />
        </TabsContent>
        <TabsContent value="header">
          <ProDataGrid
            rowKey="id"
            columns={columns}
            request={requestUsers}
            toolbar={{ buttons: [{ key: "create", children: "新建", icon: <Plus /> }] }}
            scroll={{ x: 900 }}
          />
        </TabsContent>
        <TabsContent value="page">
          <div className="relative min-h-[620px] overflow-hidden rounded-md border">
            <ProDataGrid
              rowKey="id"
              columns={columns}
              request={requestUsers}
              toolbar={{
                buttons: [
                  { key: "create", children: "打开完整页面", onClick: () => setOpen(true) },
                ],
              }}
            />
            <PageOverlayForm open={open} onOpenChange={setOpen} title="新建用户" form={form}>
              <div className="grid gap-4 md:grid-cols-2">
                <ProForm.Item label="姓名" required error={form.errors.name}>
                  <Input
                    value={form.values.name}
                    onValueChange={(value) => form.setValue("name", value)}
                  />
                </ProForm.Item>
                <ProForm.Item label="手机号">
                  <Input
                    value={form.values.phone}
                    onValueChange={(value) => form.setValue("phone", value)}
                  />
                </ProForm.Item>
                <ProForm.Item label="年龄">
                  <InputNumber
                    value={form.values.age}
                    min={1}
                    max={120}
                    onChange={(value) => form.setValue("age", Number(value ?? 0))}
                  />
                </ProForm.Item>
              </div>
            </PageOverlayForm>
          </div>
        </TabsContent>
      </Tabs>
    </Page>
  );
}

const options: ProOption[] = [
  {
    label: "浙江",
    value: "zhejiang",
    children: [
      {
        label: "杭州",
        value: "hangzhou",
        children: [{ label: "西湖区", value: "xihu", isLeaf: true }],
      },
    ],
  },
  {
    label: "江苏",
    value: "jiangsu",
    children: [{ label: "南京", value: "nanjing", isLeaf: true }],
  },
];

function FieldDemos() {
  const [number, setNumber] = React.useState<number | string | null>(128.5);
  const [range, setRange] = React.useState<[Date | null, Date | null]>([null, null]);
  const [remote, setRemote] = React.useState<string | null>(null);
  const [tree, setTree] = React.useState<any>(null);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <DemoCard title="InputNumber">
        <InputNumber value={number} precision={2} prefix="￥" min={0} onChange={setNumber} />
      </DemoCard>
      <DemoCard title="Date / Time">
        <div className="grid gap-3">
          <DatePicker />
          <RangePicker value={range} onChange={setRange} changeMode="confirm" />
          <TimePicker changeMode="confirm" />
          <TimeRangePicker />
        </div>
      </DemoCard>
      <DemoCard title="RemoteSelect / Cascader / TreeSelect">
        <div className="grid gap-3">
          <RemoteSelect
            value={remote}
            onChange={setRemote}
            request={async (keyword) =>
              users.filter((item) => item.name.includes(keyword)).slice(0, 10)
            }
            transformOptions={(items) =>
              items.map((item) => ({ label: item.name, value: item.id }))
            }
          />
          <Cascader options={options} changeOnSelect />
          <TreeSelect
            value={tree}
            onChange={setTree}
            treeData={options}
            searchMode="remote"
            onSearch={async (keyword) =>
              flattenOptions(options).filter((item) => String(item.label).includes(keyword))
            }
            loadPath={async (target) => target.path ?? []}
          />
        </div>
      </DemoCard>
      <DemoCard title="ConfirmButton">
        <ConfirmButton
          title="确认删除？"
          description="这个操作需要二次确认"
          variant="destructive"
          onConfirm={async () => new Promise((resolve) => setTimeout(resolve, 500))}
        >
          删除用户
        </ConfirmButton>
      </DemoCard>
    </div>
  );
}

function flattenOptions(nodes: ProOption[]): ProOption[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenOptions(node.children) : [])]);
}

function TransferAndUploadDemos() {
  const [value, setValue] = React.useState<string[]>(["1", "2"]);
  return (
    <div className="space-y-4">
      <DemoCard title="Transfer">
        <Transfer
          dataSource={users.slice(0, 20)}
          value={value}
          onChange={setValue}
          getValue={(item) => item.id}
          getLabel={(item) => item.name}
        />
      </DemoCard>
      <DemoCard title="TreeTransfer">
        <TreeTransfer
          treeData={options}
          requestItems={async (node, keyword) =>
            users.filter((item) => (!keyword || item.name.includes(keyword)) && (!node || item.org))
          }
          value={value}
          onChange={setValue}
          getValue={(item) => item.id}
          getLabel={(item) => item.name}
        />
      </DemoCard>
      <DemoCard title="ChunkUpload">
        <ChunkUpload
          minChunkSize={1024 * 128}
          chunkSize={1024 * 256}
          concurrency={3}
          hash={{ enabled: true, worker: true }}
          checkFile={async () => ({ uploadedChunks: [] })}
          uploadFile={async () => new Promise((resolve) => setTimeout(resolve, 600))}
          uploadChunk={async () => new Promise((resolve) => setTimeout(resolve, 180))}
          mergeChunks={async () => new Promise((resolve) => setTimeout(resolve, 300))}
        />
      </DemoCard>
    </div>
  );
}

function LayoutDemos() {
  const [open, setOpen] = React.useState(false);
  return (
    <Page title="Layout" description="Page、SplitLayout、PageOverlay 覆盖式子页面。">
      <SplitLayout
        aside={
          <div className="space-y-2 text-sm">
            <div className="rounded bg-accent px-2 py-1">研发中心</div>
            <div className="px-2 py-1">销售中心</div>
            <div className="px-2 py-1">财务中心</div>
          </div>
        }
        asideWidth={240}
      >
        <Card>
          <CardHeader>
            <CardTitle>右侧内容</CardTitle>
          </CardHeader>
          <CardContent>
            <ProButton onClick={() => setOpen(true)}>打开 PageOverlay</ProButton>
          </CardContent>
        </Card>
      </SplitLayout>
      <div className="relative min-h-[420px] overflow-hidden rounded-md border">
        <PageOverlay
          open={open}
          title="覆盖式页面"
          onBack={() => setOpen(false)}
          footer={<ProButton onClick={() => setOpen(false)}>完成</ProButton>}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="大量表单字段" />
            <Input placeholder="更多字段" />
            <RangePicker changeMode="confirm" />
          </div>
        </PageOverlay>
      </div>
    </Page>
  );
}

function ProComponentsDemo() {
  return (
    <div className="min-h-0 p-6">
      <Tabs defaultValue="grid">
        <TabsList className="flex-wrap">
          <TabsTrigger value="grid">ProDataGrid</TabsTrigger>
          <TabsTrigger value="fields">输入/日期/选择</TabsTrigger>
          <TabsTrigger value="transfer-upload">Transfer / Upload</TabsTrigger>
          <TabsTrigger value="layout">Layout / PageOverlay</TabsTrigger>
        </TabsList>
        <TabsContent value="grid">
          <ProDataGridDemos />
        </TabsContent>
        <TabsContent value="fields">
          <FieldDemos />
        </TabsContent>
        <TabsContent value="transfer-upload">
          <TransferAndUploadDemos />
        </TabsContent>
        <TabsContent value="layout">
          <LayoutDemos />
        </TabsContent>
      </Tabs>
    </div>
  );
}
