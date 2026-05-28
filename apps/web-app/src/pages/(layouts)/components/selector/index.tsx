import { DataGrid } from "@rap/components-pro/data-grid";
import { ProTree } from "@rap/components-pro/tree";
import { Button } from "@rap/components-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rap/components-ui/card";
import { FieldGroup, FieldLabel } from "@rap/components-ui/field";
import { Form, FormField } from "@rap/components-ui/form";
import { Input } from "@rap/components-ui/input";
import {
	Selector,
	SelectorCount,
	SelectorEmpty,
	SelectorFooter,
	type SelectorItem,
	SelectorList,
	SelectorListItem,
	SelectorSearch,
	SelectorSelectAll,
	useSelector,
} from "@rap/components-ui/selector";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
} from "@rap/components-ui/pagination";
import type { TreeNode } from "@rap/components-ui/tree/types";
import { useForm } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/(layouts)/components/selector/")({
	component: RouteComponent,
});

interface User {
	id: string;
	name: string;
	department: string;
	role: string;
	status: "active" | "locked";
	disabled?: boolean;
};

const departments = ["研发中心", "产品设计", "增长运营", "客户成功"];
const roles = ["Owner", "Admin", "Editor", "Viewer"];
const longText =
	"这是一个非常非常非常非常非常非常非常非常非常长的名称，用来验证省略、布局稳定和选择状态不会把面板撑破";

function createUsers(count: number): User[] {
	return Array.from({ length: count }, (_, index) => ({
		id: `user-${index + 1}`,
		name: index % 7 === 0 ? `成员 ${index + 1} - ${longText}` : `成员 ${index + 1}`,
		department: departments[index % departments.length],
		role: roles[index % roles.length],
		status: index % 11 === 0 ? "locked" : "active",
		disabled: index % 19 === 0,
	}));
}

const listItems: SelectorItem[] = Array.from({ length: 80 }, (_, index) => ({
	label: index % 6 === 0 ? `选项 ${index + 1} - ${longText}` : `选项 ${index + 1}`,
	value: `option-${index + 1}`,
	disabled: index % 17 === 0,
}));

const users = createUsers(128);

const treeData: TreeNode[] = [
	{
		key: "engineering",
		label: "研发中心 - 包含多个真实业务小组",
		children: [
			{ key: "frontend", label: `前端平台 - ${longText}` },
			{ key: "backend", label: "后端服务" },
			{ key: "qa", label: "质量保障", disabled: true },
		],
	},
	{
		key: "business",
		label: "业务团队",
		children: [
			{ key: "growth", label: "增长运营" },
			{ key: "success", label: `客户成功 - ${longText}` },
		],
	},
];

function flattenTree(nodes: TreeNode[]): TreeNode[] {
	return nodes.flatMap((node) => [node, ...(node.children ? flattenTree(node.children) : [])]);
}

function Section({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: React.ReactNode;
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
				<CardDescription>{description}</CardDescription>
			</CardHeader>
			<CardContent>{children}</CardContent>
		</Card>
	);
}

function BasicListDemo() {
	const [value, setValue] = useState<string[]>(["option-2", "option-4"]);

	return (
		<Section title="列表选择" description="默认列表、长文本、搜索、全选、空状态。">
			<Selector className="h-[460px]" dataSource={listItems} value={value} onChange={setValue}>
				<SelectorSearch placeholder="搜索选项" />
				<SelectorSelectAll />
				<SelectorList>
					{({ item }) => (
						<SelectorListItem item={item}>
							<span className="block truncate">{item.label}</span>
						</SelectorListItem>
					)}
				</SelectorList>
				<SelectorEmpty />
				<SelectorCount />
			</Selector>
		</Section>
	);
}

function VirtualListDemo() {
	const [value, setValue] = useState<string[]>([]);
	const data = useMemo(
		() =>
			Array.from({ length: 2000 }, (_, index) => ({
				label: index % 10 === 0 ? `虚拟列表选项 ${index + 1} - ${longText}` : `虚拟列表选项 ${index + 1}`,
				value: `virtual-${index + 1}`,
			})),
		[],
	);

	return (
		<Section title="虚拟列表" description="virtual 默认关闭，需要时传 true 或配置对象。">
			<Selector
				className="h-[460px]"
				dataSource={data}
				value={value}
				virtual={{ itemSize: 42, overscan: 8 }}
				onChange={setValue}
			>
				<SelectorSearch placeholder="搜索虚拟列表" />
				<SelectorSelectAll />
				<SelectorList />
				<SelectorEmpty />
				<SelectorCount />
			</Selector>
		</Section>
	);
}

const userColumns: ColumnDef<User>[] = [
	{ accessorKey: "name", header: "姓名", meta: { ellipsis: true } },
	{ accessorKey: "department", header: "部门", meta: { ellipsis: true } },
	{ accessorKey: "role", header: "角色", meta: { ellipsis: true } },
];

function DataGridSelectorContent() {
	const api = useSelector<User>();

	return (
		<div className="min-h-0 flex-1">
			<DataGrid
				rowKey="id"
				columns={userColumns}
				data={api.filteredItems}
				scroll={{ y: 320 }}
				pagination={{
					mode: "local",
					defaultPageSize: 8,
					showSizeChanger: false,
					contentClassName:
						"flex-nowrap justify-end [&_[data-slot=pagination-link]>span]:hidden",
				}}
				rowSelection={{
					selectedRowKeys: api.selectedValues,
					onChange: (keys) => api.setValues(keys),
					getCheckboxProps: (record) => ({ disabled: api.getDisabled(record) }),
				}}
			/>
		</div>
	);
}

function TableDemo() {
	const [value, setValue] = useState<string[]>(["user-2", "user-5"]);

	return (
		<Section title="DataGrid 渲染" description="真实表格场景接 pro DataGrid，并使用 DataGrid 自己的分页。">
			<Selector<User>
				className="h-[520px]"
				dataSource={users}
				value={value}
				getValue={(item) => item.id}
				getLabel={(item) => item.name}
				getDisabled={(item) => item.disabled ?? item.status === "locked"}
				onChange={setValue}
			>
				<SelectorSearch placeholder="搜索成员" />
				<DataGridSelectorContent />
				<SelectorCount />
			</Selector>
		</Section>
	);
}

function ProTreeSelectorContent() {
	const api = useSelector<TreeNode>();

	return (
		<div className="min-h-0 flex-1 overflow-auto rounded-md border p-2">
			<ProTree
				data={treeData}
				checkable={{ checkStrictly: false }}
				defaultExpandedKeys={["engineering", "business"]}
				checkedKeys={api.selectedValues}
				onCheckedKeysChange={(keys) => api.setValues(keys.map(String))}
				labelRender={(item) => <span className="block max-w-[520px] truncate">{item.node.label}</span>}
			/>
		</div>
	);
}

function TreeDemo() {
	const [value, setValue] = useState<string[]>(["frontend"]);
	const flatTree = useMemo(() => flattenTree(treeData), []);

	return (
		<Section title="ProTree 渲染" description="真实树场景接 pro Tree，Selector 只同步 checkedKeys。">
			<Selector<TreeNode>
				className="h-[420px]"
				dataSource={flatTree}
				value={value}
				getValue={(item) => String(item.key)}
				getLabel={(item) => item.label}
				getDisabled={(item) => Boolean(item.disabled)}
				onChange={setValue}
			>
				<ProTreeSelectorContent />
				<SelectorCount />
			</Selector>
		</Section>
	);
}

function InternalPaginationDemo() {
	const [page, setPage] = useState(1);
	const [value, setValue] = useState<string[]>([]);
	const pageSize = 10;
	const pageCount = Math.ceil(listItems.length / pageSize);
	const pageItems = listItems.slice((page - 1) * pageSize, page * pageSize);

	return (
		<Section title="Selector 内部分页" description="分页作为 Selector 内部 footer，而不是放到 Selector 外面。">
			<Selector className="h-[460px]" dataSource={pageItems} value={value} onChange={setValue}>
				<SelectorSearch placeholder="搜索当前页" />
				<SelectorSelectAll />
				<SelectorList>
					{({ item }) => (
						<SelectorListItem item={item}>
							<span className="block truncate">{item.label}</span>
						</SelectorListItem>
					)}
				</SelectorList>
				<SelectorEmpty />
				<SelectorFooter className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
					<div className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
						第 {page} / {pageCount} 页，共 {listItems.length} 项
					</div>
					<Pagination className="mx-0 w-auto">
						<PaginationContent className="justify-end">
							<PaginationItem>
								<PaginationLink
									aria-label="上一页"
									disabled={page <= 1}
									size="icon"
									onClick={() => setPage((prev) => Math.max(1, prev - 1))}
								>
									<ChevronLeft className="size-4" />
								</PaginationLink>
							</PaginationItem>
							{Array.from({ length: Math.min(5, pageCount) }, (_, index) => index + 1).map((itemPage) => (
								<PaginationItem key={itemPage}>
									<PaginationLink isActive={itemPage === page} onClick={() => setPage(itemPage)}>
										{itemPage}
									</PaginationLink>
								</PaginationItem>
							))}
							<PaginationItem>
								<PaginationLink
									aria-label="下一页"
									disabled={page >= pageCount}
									size="icon"
									onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
								>
									<ChevronRight className="size-4" />
								</PaginationLink>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</SelectorFooter>
			</Selector>
		</Section>
	);
}

function FormDemo() {
	const form = useForm({
		defaultValues: {
			name: "",
			members: ["option-1"] as string[],
		},
		onSubmit: ({ value }) => console.log("selector form submit", value),
	});

	return (
		<Section title="表单集成" description="value/onChange 维持纯数组，适合放进 FormField。">
			<Form
				form={form}
				className="space-y-5"
				onSubmit={(event) => {
					event.preventDefault();
					form.handleSubmit();
				}}
			>
				<FieldGroup>
					<FormField
						name="name"
						render={({ field }) => (
							<>
								<FieldLabel htmlFor="selector-form-name">名称</FieldLabel>
								<Input
									id="selector-form-name"
									name={field.name}
									value={field.state.value}
									placeholder="请输入名称"
									onBlur={field.handleBlur}
									onChange={(event) => field.handleChange(event.target.value)}
								/>
							</>
						)}
					/>
					<FormField
						name="members"
						render={({ field }) => (
							<>
								<FieldLabel>选择项</FieldLabel>
								<Selector
									className="h-80"
									dataSource={listItems}
									value={field.state.value}
									onChange={(nextValue) => field.handleChange(nextValue)}
								/>
							</>
						)}
					/>
				</FieldGroup>
				<Button type="submit">提交</Button>
			</Form>
		</Section>
	);
}

function RouteComponent() {
	return (
		<div className="container mx-auto space-y-6 py-8">
			<div>
				<h1 className="text-3xl font-bold">Selector 组件</h1>
				<p className="mt-2 text-muted-foreground">选择状态内核接真实 List、DataGrid、ProTree、分页和表单场景。</p>
			</div>
			<div className="grid gap-6 xl:grid-cols-2">
				<BasicListDemo />
				<VirtualListDemo />
				<TableDemo />
				<TreeDemo />
				<InternalPaginationDemo />
				<FormDemo />
			</div>
		</div>
	);
}
