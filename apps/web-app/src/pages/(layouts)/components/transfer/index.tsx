import { DataGrid } from "@rap/components-pro/data-grid";
import { ProTree } from "@rap/components-pro/tree";
import { Button } from "@rap/components-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rap/components-ui/card";
import {
	SelectorCount,
	SelectorEmpty,
	SelectorFooter,
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
import {
	MoveAllToSourceAction,
	MoveAllToTargetAction,
	MoveToSourceAction,
	MoveToTargetAction,
	Transfer,
	TransferPanel,
	useTransfer,
} from "@rap/components-ui/transfer";
import { createFileRoute } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/(layouts)/components/transfer/")({
	component: TransferDemo,
});

type User = {
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
	"这是一个非常非常非常非常非常非常非常非常非常长的成员名称，用来验证穿梭框面板不会被文本撑开";

function createUsers(count: number): User[] {
	return Array.from({ length: count }, (_, index) => ({
		id: `user-${index + 1}`,
		name: index % 6 === 0 ? `成员 ${index + 1} - ${longText}` : `成员 ${index + 1}`,
		department: departments[index % departments.length],
		role: roles[index % roles.length],
		status: index % 13 === 0 ? "locked" : "active",
		disabled: index % 23 === 0,
	}));
}

const dataSource = createUsers(96);
const initialValue = ["user-2", "user-5", "user-9"];

const columns: ColumnDef<User>[] = [
	{ accessorKey: "name", header: "姓名", meta: { ellipsis: true } },
	{ accessorKey: "department", header: "部门", meta: { ellipsis: true } },
	{ accessorKey: "role", header: "角色", meta: { ellipsis: true } },
];

const treeTransferData: TreeNode[] = [
	{
		key: "engineering",
		label: "研发中心",
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
			{ key: "support", label: "技术支持" },
		],
	},
];

function flattenTree(nodes: TreeNode[]): TreeNode[] {
	return nodes.flatMap((node) => [node, ...(node.children ? flattenTree(node.children) : [])]);
}

function filterTreeByKeys(nodes: TreeNode[], keys: Set<string>): TreeNode[] {
	const result: TreeNode[] = [];
	for (const node of nodes) {
		const children = node.children ? filterTreeByKeys(node.children, keys) : undefined;
		if (!keys.has(String(node.key)) && !children?.length) continue;
		result.push({ ...node, children });
	}
	return result;
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

function TransferActions() {
	return (
		<div className="flex shrink-0 flex-row items-center justify-center gap-2 md:flex-col">
			<MoveToTargetAction />
			<MoveToSourceAction />
			<MoveAllToTargetAction />
			<MoveAllToSourceAction />
		</div>
	);
}

function PanelFooter({ type }: { type: "source" | "target" }) {
	const transfer = useTransfer<User>();
	const total = type === "source" ? transfer.sourceItems.length : transfer.targetItems.length;
	const checked = type === "source" ? transfer.sourceCheckedValues.length : transfer.targetCheckedValues.length;
	return <div className="text-muted-foreground text-sm">当前 {total} 项，已勾选 {checked} 项</div>;
}

function BasicTransferDemo() {
	const [value, setValue] = useState<string[]>(initialValue);

	return (
		<Section title="基础 Transfer" description="面板固定高度，长文本不会把列表一直撑下去。">
			<Transfer<User>
				dataSource={dataSource}
				value={value}
				getValue={(item) => item.id}
				getLabel={(item) => item.name}
				getDisabled={(item) => item.disabled || item.status === "locked"}
				onChange={setValue}
			>
				<div className="flex min-h-0 flex-col gap-4 md:flex-row">
					<TransferPanel type="source" title="待选成员" footer={<PanelFooter type="source" />}>
						<ListPanelContent placeholder="搜索待选" />
					</TransferPanel>
					<TransferActions />
					<TransferPanel type="target" title="已选成员" footer={<PanelFooter type="target" />}>
						<ListPanelContent placeholder="搜索已选" />
					</TransferPanel>
				</div>
			</Transfer>
		</Section>
	);
}

function DataGridPanelContent() {
	const api = useSelector<User>();

	return (
		<>
			<SelectorSearch placeholder="搜索成员" />
			<div className="min-h-0 flex-1 [&_.os-host]:min-h-0 [&_.os-host]:flex-1 [&>div]:flex [&>div]:h-full [&>div]:flex-col">
				{api.filteredItems.length > 0 ? (
					<DataGrid
					rowKey="id"
					columns={columns}
					data={api.filteredItems}
					scroll={{ y: "100%" }}
					pagination={{
							mode: "local",
							defaultPageSize: 6,
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
				) : (
					<div className="flex h-full rounded-md border">
						<SelectorEmpty className="h-full min-h-0 flex-1" />
					</div>
				)}
			</div>
			<SelectorCount />
		</>
	);
}

function ListPanelContent({ placeholder = "搜索..." }: { placeholder?: string }) {
	const { filteredItems } = useSelector();

	return (
		<>
			<SelectorSearch placeholder={placeholder} />
			<SelectorSelectAll />
			{filteredItems.length > 0 ? (
				<SelectorList<User>>
					{({ item }) => (
						<SelectorListItem<User> item={item}>
							<span className="block truncate">{item.name}</span>
						</SelectorListItem>
					)}
				</SelectorList>
			) : (
				<div className="min-h-0 flex-1 rounded-md border">
					<SelectorEmpty className="h-full min-h-0" />
				</div>
			)}
		</>
	);
}

function TreeSourcePanelContent() {
	const api = useSelector<TreeNode>();
	const sourceKeys = useMemo(
		() => new Set(api.filteredItems.map((item) => String(item.key))),
		[api.filteredItems],
	);
	const sourceTree = useMemo(() => filterTreeByKeys(treeTransferData, sourceKeys), [sourceKeys]);

	return (
		<>
			<SelectorSearch placeholder="搜索组织" />
			<div className="min-h-0 flex-1 overflow-auto rounded-md border p-2">
				<ProTree
					data={sourceTree}
					checkable={{ checkStrictly: false }}
					defaultExpandedKeys={["engineering", "business"]}
					checkedKeys={api.selectedValues}
					onCheckedKeysChange={(keys) => api.setValues(keys.map(String))}
					labelRender={(item) => <span className="block max-w-full truncate">{item.node.label}</span>}
				/>
			</div>
			<SelectorCount />
		</>
	);
}

function TreeTargetListContent() {
	const { filteredItems } = useSelector<TreeNode>();

	return (
		<>
			<SelectorSearch placeholder="搜索已选" />
			{filteredItems.length > 0 ? (
				<SelectorList<TreeNode>>
					{({ item }) => (
						<SelectorListItem<TreeNode> item={item}>
							<span className="block truncate">{item.label}</span>
						</SelectorListItem>
					)}
				</SelectorList>
			) : (
				<div className="min-h-0 flex-1 rounded-md border">
					<SelectorEmpty className="h-full min-h-0" />
				</div>
			)}
			<SelectorCount />
		</>
	);
}

function TreeToListTransferDemo() {
	const [value, setValue] = useState<string[]>(["frontend"]);
	const flatTree = useMemo(() => flattenTree(treeTransferData), []);

	return (
		<Section title="Tree to List Transfer" description="左侧使用 ProTree，右侧使用列表；已移动到右侧的节点会从左侧树里移除，不能重复选择。">
			<Transfer<TreeNode>
				dataSource={flatTree}
				value={value}
				getValue={(item) => String(item.key)}
				getLabel={(item) => item.label}
				getDisabled={(item) => Boolean(item.disabled)}
				onChange={setValue}
			>
				<div className="flex min-h-0 flex-col gap-4 md:flex-row">
					<TransferPanel type="source" title="组织树">
						<TreeSourcePanelContent />
					</TransferPanel>
					<TransferActions />
					<TransferPanel type="target" title="已选列表">
						<TreeTargetListContent />
					</TransferPanel>
				</div>
			</Transfer>
		</Section>
	);
}

function TableTransferDemo() {
	const [value, setValue] = useState<string[]>(["user-1", "user-3"]);

	return (
		<Section title="DataGrid Transfer" description="表格面板接 pro DataGrid，表格内部带分页。">
			<Transfer<User>
				dataSource={dataSource}
				value={value}
				getValue={(item) => item.id}
				getLabel={(item) => item.name}
				getDisabled={(item) => item.disabled || item.status === "locked"}
				onChange={setValue}
			>
				<div className="flex min-h-0 flex-col gap-4 md:flex-row">
					<TransferPanel type="source" title="待选表格">
						<DataGridPanelContent />
					</TransferPanel>
					<TransferActions />
					<TransferPanel type="target" title="已选表格">
						<DataGridPanelContent />
					</TransferPanel>
				</div>
			</Transfer>
		</Section>
	);
}

function PaginatedList({ pageSize = 8 }: { pageSize?: number }) {
	const [page, setPage] = useState(1);
	const api = useSelector<User>();
	const pageCount = Math.max(1, Math.ceil(api.filteredItems.length / pageSize));
	const currentPage = Math.min(page, pageCount);
	const pageItems = api.filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

	return (
		<>
			<SelectorSearch placeholder="搜索当前面板" />
			<SelectorSelectAll />
			<div className="min-h-0 flex-1 overflow-auto rounded-md border p-1">
				{pageItems.map((item) => (
					<SelectorListItem key={item.id} item={item}>
						<div className="flex min-w-0 items-center justify-between gap-3">
							<span className="truncate">{item.name}</span>
							<span className="shrink-0 text-muted-foreground text-xs">{item.department}</span>
						</div>
					</SelectorListItem>
				))}
			</div>
			<SelectorFooter className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
				<div className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
					第 {currentPage} / {pageCount} 页，共 {api.filteredItems.length} 项
				</div>
				<Pagination className="mx-0 w-auto">
					<PaginationContent className="justify-end">
						<PaginationItem>
							<PaginationLink
								aria-label="上一页"
								disabled={currentPage <= 1}
								size="icon"
								onClick={() => setPage((prev) => Math.max(1, prev - 1))}
							>
								<ChevronLeft className="size-4" />
							</PaginationLink>
						</PaginationItem>
						<PaginationItem>
							<PaginationLink isActive>{currentPage}</PaginationLink>
						</PaginationItem>
						<PaginationItem>
							<PaginationLink
								aria-label="下一页"
								disabled={currentPage >= pageCount}
								size="icon"
								onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
							>
								<ChevronRight className="size-4" />
							</PaginationLink>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</SelectorFooter>
			<SelectorEmpty />
		</>
	);
}

function PaginatedTransferDemo() {
	const [value, setValue] = useState<string[]>(["user-7", "user-8"]);

	return (
		<Section title="Selector 内部分页 Transfer" description="分页是面板内部 footer，不放在 Transfer 外面。">
			<Transfer<User>
				dataSource={dataSource}
				value={value}
				getValue={(item) => item.id}
				getLabel={(item) => item.name}
				getDisabled={(item) => item.disabled || item.status === "locked"}
				onChange={setValue}
			>
				<div className="flex min-h-0 flex-col gap-4 md:flex-row">
					<TransferPanel type="source" title="待选分页">
						<PaginatedList />
					</TransferPanel>
					<TransferActions />
					<TransferPanel type="target" title="已选分页">
						<PaginatedList pageSize={6} />
					</TransferPanel>
				</div>
			</Transfer>
		</Section>
	);
}

function CustomActionTransferDemo() {
	const [value, setValue] = useState<string[]>([]);

	return (
		<Section title="自定义操作区" description="Action 暴露 render props，业务按钮可完全替换。">
			<Transfer<User>
				dataSource={dataSource.slice(0, 18)}
				value={value}
				getValue={(item) => item.id}
				getLabel={(item) => item.name}
				onChange={setValue}
			>
				<div className="flex min-h-0 flex-col gap-4 md:flex-row">
					<TransferPanel type="source" title="候选" />
					<div className="flex shrink-0 flex-row items-center justify-center gap-2 md:flex-col">
						<MoveToTargetAction>
							{({ action, disabled }) => (
								<Button type="button" disabled={disabled} onClick={action}>
									加入
								</Button>
							)}
						</MoveToTargetAction>
						<MoveToSourceAction>
							{({ action, disabled }) => (
								<Button type="button" variant="outline" disabled={disabled} onClick={action}>
									移除
								</Button>
							)}
						</MoveToSourceAction>
					</div>
					<TransferPanel type="target" title="结果" />
				</div>
			</Transfer>
		</Section>
	);
}

function TransferDemo() {
	return (
		<div className="container mx-auto space-y-6 py-8">
			<div>
				<h1 className="text-3xl font-bold">Transfer 组件</h1>
				<p className="mt-2 text-muted-foreground">Transfer 负责左右集合，面板可以是真实列表、DataGrid 或带分页的 Selector 视图。</p>
			</div>
			<div className="space-y-6">
				<BasicTransferDemo />
				<TableTransferDemo />
				<TreeToListTransferDemo />
				<PaginatedTransferDemo />
				<CustomActionTransferDemo />
			</div>
		</div>
	);
}
