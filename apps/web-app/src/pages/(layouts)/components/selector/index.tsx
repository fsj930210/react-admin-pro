/* eslint-disable react-hooks/set-state-in-effect */
/** biome-ignore-all lint:correctness/useExhaustiveDependencies */

import { Button } from "@rap/components-base/button";
import { Card, CardContent, CardHeader, CardTitle } from "@rap/components-base/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@rap/components-base/form";
import { Input } from "@rap/components-base/input";
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "@rap/components-base/pagination";
import {
	Selector,
	SelectorContent,
	SelectorContentItem,
	SelectorEmpty,
	type SelectorItem,
	SelectorSearch,
	SelectorSelectAll,
} from "@rap/components-base/selector";
import { Tree, TreeCheckbox, TreeExpandIcon, TreeItem, TreeLabel } from "@rap/components-base/tree";
import {
	checkableFeature,
	expandableFeature,
	selectableFeature,
} from "@rap/components-base/tree/features";
import type { TreeItemInstance, TreeNode } from "@rap/components-base/tree/types";
import { traverseTree } from "@rap/utils";
import { createFileRoute } from "@tanstack/react-router";
import { useMemoizedFn } from "ahooks";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { fetchSelectorItems } from "@/service/selector";

export const Route = createFileRoute("/(layouts)/components/selector/")({
	component: RouteComponent,
});

const dig = (path = "root", level = 1, childCount = 5) => {
	const treeNode: TreeNode = {
		label: path === "root" ? "Root" : path,
		key: path,
	};

	if (level > 0) {
		treeNode.children = [];
		for (let i = 0; i < childCount; i += 1) {
			const childKey = `${path}-${i}`;
			treeNode.children.push(dig(childKey, level - 1, childCount));
		}
	}

	return treeNode;
};
const generateData = (count: number): SelectorItem[] => {
	return Array.from({ length: count }, (_, index) => ({
		label: `选项 ${index + 1}`,
		value: `value-${index + 1}`,
	}));
};

function BasicTree({
	treeData,
	onSelect,
	onCheck,
}: {
	treeData: TreeNode[];
	onSelect: (
		selectedKeys: string[],
		selectedItems: TreeItemInstance[],
		selectInfo: {
			selected: boolean;
			node: TreeItemInstance;
		},
	) => void;
	onCheck: (
		checkKeys: string[],
		checkItems: TreeItemInstance[],
		checkInfo: {
			checked: boolean;
			node: TreeItemInstance;
		},
	) => void;
}) {
	return (
		<Tree
			treeData={treeData}
			features={[
				expandableFeature({
					defaultExpandedKeys: ["root"],
					onExpand: (expandedKeys, expandedItems, expandInfo) => {
						console.log(expandedKeys, expandedItems, expandInfo);
					},
				}),
				selectableFeature({
					onSelect: (selectedKeys, selectedItems, selectInfo) => {
						console.log(selectedKeys, selectedItems, selectInfo);
						onSelect(selectedKeys, selectedItems, selectInfo);
					},
				}),
				checkableFeature({
					onCheck: (checkKeys, checkItems, checkInfo) => {
						console.log(checkKeys, checkItems, checkInfo);
						onCheck(checkKeys, checkItems, checkInfo);
					},
				}),
			]}
		>
			{({ item, draggable, onDragStart, onDragOver, onDrop, onDragEnd }) => (
				<TreeItem key={item.key} item={item}>
					<div
						className="flex items-center w-full h-full"
						draggable={draggable}
						onDragStart={onDragStart}
						onDragOver={onDragOver}
						onDrop={onDrop}
						onDragEnd={onDragEnd}
					>
						<TreeExpandIcon item={item} />
						<TreeCheckbox item={item} />
						<TreeLabel item={item} />
					</div>
				</TreeItem>
			)}
		</Tree>
	);
}
// 1. 基础使用示例
function BasicUsage() {
	const [data] = useState(() => generateData(200));
	const [value, setValue] = useState<string[]>([]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>基础使用</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<Selector dataSource={data} height={400} onChange={setValue} value={value}>
						<SelectorSearch placeholder="搜索选项..." />
						<SelectorSelectAll />
						<SelectorContent>{({ item }) => <SelectorContentItem item={item} />}</SelectorContent>
						<SelectorEmpty />
					</Selector>
					<div className="mt-4">
						<p>
							已选择: {value.length}/{data.length}{" "}
						</p>
						<p>选中的值: {value.join(", ")}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// 2. 无限滚动示例
function InfiniteScroll() {
	const [data, setData] = useState<SelectorItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [value, setValue] = useState<string[]>([]);

	const loadMore = useMemoizedFn(async () => {
		if (loading) return;
		setLoading(true);
		try {
			const response = await fetchSelectorItems({
				page,
				limit: 20,
			});
			const { data } = response.data;

			setData((prev) => [...prev, ...data]);
			setPage((prev) => prev + 1);
		} catch (error) {
			console.error("Failed to load data:", error);
		} finally {
			setLoading(false);
		}
	});

	useEffect(() => {
		loadMore();
	}, []);

	const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, clientHeight, scrollHeight } = event.currentTarget;
		if (scrollTop + clientHeight >= scrollHeight - 100) {
			loadMore();
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>无限滚动</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<Selector dataSource={data} value={value} onChange={setValue} height={400}>
						<SelectorSearch placeholder="搜索选项..." />
						<SelectorSelectAll />
						<SelectorContent onScroll={handleScroll}>
							{({ item }) => <SelectorContentItem item={item} />}
						</SelectorContent>
						{loading && <div className="p-4 text-center">加载中...</div>}
						<SelectorEmpty />
					</Selector>
					<div className="mt-4">
						<p>已选择: {value.length} 项</p>
						<p>总数据量: {data.length} 项</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// 3. 分页示例
function PaginationExample() {
	const [data, setData] = useState<SelectorItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const pageSize = 20;
	const [value, setValue] = useState<string[]>([]);

	const loadPageData = async () => {
		setLoading(true);
		try {
			const response = await fetchSelectorItems({
				page: currentPage,
				limit: pageSize,
			});
			const { data, pagination } = response.data;
			setData(data);
			setTotalPages(pagination.total || 1);
		} catch (error) {
			console.error("Failed to load page data:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadPageData();
	}, [currentPage]);

	return (
		<Card>
			<CardHeader>
				<CardTitle>分页示例</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<Selector dataSource={data} value={value} onChange={setValue} height={400}>
						<SelectorSearch placeholder="搜索选项..." />
						<SelectorSelectAll />
						<SelectorContent>{({ item }) => <SelectorContentItem item={item} />}</SelectorContent>
						{loading && <div className="p-4 text-center">加载中...</div>}
						<SelectorEmpty />
					</Selector>
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
									disabled={currentPage === 1 || loading}
								/>
							</PaginationItem>
							{/* 第一页 */}
							<PaginationItem>
								<PaginationLink isActive={currentPage === 1} onClick={() => setCurrentPage(1)}>
									1
								</PaginationLink>
							</PaginationItem>
							{/* 第一页和当前页之间的省略号 */}
							{currentPage > 4 && (
								<PaginationItem>
									<PaginationEllipsis />
								</PaginationItem>
							)}
							{/* 当前页的前两页 */}
							{Array.from({ length: 2 }, (_, i) => currentPage - 2 + i)
								.filter((page) => page > 1 && page < currentPage)
								.map((page) => (
									<PaginationItem key={page}>
										<PaginationLink onClick={() => setCurrentPage(page)}>{page}</PaginationLink>
									</PaginationItem>
								))}
							{/* 当前页 */}
							{currentPage > 1 && currentPage < totalPages && (
								<PaginationItem>
									<PaginationLink isActive onClick={() => setCurrentPage(currentPage)}>
										{currentPage}
									</PaginationLink>
								</PaginationItem>
							)}
							{/* 当前页的后两页 */}
							{Array.from({ length: 2 }, (_, i) => currentPage + 1 + i)
								.filter((page) => page > currentPage && page < totalPages)
								.map((page) => (
									<PaginationItem key={page}>
										<PaginationLink onClick={() => setCurrentPage(page)}>{page}</PaginationLink>
									</PaginationItem>
								))}
							{/* 当前页和最后一页之间的省略号 */}
							{currentPage < totalPages - 3 && (
								<PaginationItem>
									<PaginationEllipsis />
								</PaginationItem>
							)}
							{/* 最后一页 */}
							{totalPages > 1 && (
								<PaginationItem>
									<PaginationLink
										isActive={currentPage === totalPages}
										onClick={() => setCurrentPage(totalPages)}
									>
										{totalPages}
									</PaginationLink>
								</PaginationItem>
							)}
							<PaginationItem>
								<PaginationNext
									onClick={() => setCurrentPage((prev) => prev + 1)}
									disabled={currentPage >= totalPages || loading}
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
					<div className="mt-4">
						<p>已选择: {value.length} 项</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// 4. 渲染树示例
function TreeRendering() {
	const [treeData] = useState(() => {
		const rootNode = dig("root", 2);
		if (rootNode?.children?.[1]) {
			rootNode.children[1].disabled = true;
		}
		return [rootNode];
	});
	const data = useMemo(() => {
		const result: SelectorItem[] = [];
		traverseTree(treeData, (node: TreeNode) => {
			result.push({ value: node.key, label: node.label });
		});
		return result;
	}, [treeData]);
	const [value, setValue] = useState<string[]>([]);
	return (
		<Card>
			<CardHeader>
				<CardTitle>渲染树</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<Selector dataSource={data} height={400} onChange={setValue} value={value}>
						{({ onItemsSelect }) => (
							<BasicTree
								treeData={treeData}
								onSelect={(selectedKeys, _, selectInfo) =>
									onItemsSelect(selectedKeys, selectInfo.selected)
								}
								onCheck={(checkKeys, _, checkInfo) => onItemsSelect(checkKeys, checkInfo.checked)}
							/>
						)}
					</Selector>
					<div className="mt-4">
						<p>
							已选择: {value.length}/{data.length}{" "}
						</p>
						<p>选中的值: {value.join(", ")}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// 5. 结合表单示例
function FormIntegration() {
	const [data] = useState(() => generateData(20));
	const form = useForm({
		defaultValues: {
			selectedItems: [],
			name: "",
		},
	});

	const onSubmit = (values: any) => {
		console.log("表单提交:", values);
		alert(`表单提交成功！已选择 ${values.selectedItems.length} 项`);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>结合表单</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>名称</FormLabel>
									<FormControl>
										<Input {...field} placeholder="请输入名称" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="selectedItems"
							render={({ field }) => {
								console.log(field.value, "form render");
								return (
									<FormItem>
										<FormLabel>选择项目</FormLabel>
										<FormLabel>选择项目</FormLabel>
										<FormControl>
											<Selector
												dataSource={data}
												value={field.value}
												onChange={(values) => {
													console.log(values, "form change");
													field.onChange(values);
												}}
												height={300}
											>
												{/* <ListSelectorSearch placeholder="搜索选项..." /> */}
												<SelectorSelectAll />
												<SelectorContent>
													{({ item }) => <SelectorContentItem item={item} />}
												</SelectorContent>
												<SelectorEmpty />
											</Selector>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>

						<Button type="submit">提交</Button>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}

function RouteComponent() {
	return (
		<div className="container mx-auto py-8">
			<h1 className="text-3xl font-bold mb-8">Selector 组件示例</h1>

			<div className="space-y-8">
				{/* <BasicUsage />
				<InfiniteScroll />
				<PaginationExample />
				<TreeRendering /> */}
				<FormIntegration />
			</div>
		</div>
	);
}
