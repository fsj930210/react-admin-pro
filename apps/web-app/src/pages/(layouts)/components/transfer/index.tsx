import { Button } from "@rap/components-base/button";
import type { SelectorItem } from "@rap/components-base/selector";
import {
	Selector,
	SelectorContent,
	SelectorContentItem,
	SelectorSearch,
	SelectorSelectAll,
} from "@rap/components-base/selector";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/(layouts)/components/transfer/")({
	component: TransferDemo,
});

// 生成更多数据
const generateUserData = (count: number): SelectorItem[] => {
	const users: SelectorItem[] = [];
	for (let i = 1; i <= count; i++) {
		let label: string;
		if (i % 5 === 0) {
			// 长标签
			label = `用户 ${i} - 这是一个非常长的用户名，用于测试文本省略功能 This is a very long username to test text ellipsis`;
		} else {
			label = `用户 ${i}`;
		}
		users.push({ label, value: `user-${i}` });
	}
	// 添加禁用项
	users.push(
		{ label: "管理员 - 系统管理员账号，具有最高权限", value: "admin", disabled: true },
		{ label: "访客 - 只读权限用户", value: "guest", disabled: true },
	);
	return users;
};

const leftDataSource: SelectorItem[] = generateUserData(50);

const rightDataSource: SelectorItem[] = [
	{ label: "已选用户 1", value: "selected-1" },
	{ label: "已选用户 2 - 这是一个已选中的用户，标签也很长", value: "selected-2" },
];

function TransferDemo() {
	const [leftSelected, setLeftSelected] = useState<string[]>([]);
	const [rightSelected, setRightSelected] = useState<string[]>([]);
	const [rightData, setRightData] = useState<SelectorItem[]>(rightDataSource);
	const [leftData, setLeftData] = useState<SelectorItem[]>(leftDataSource);

	const handleLeftChange = (values: string[], items: SelectorItem[]) => {
		setLeftSelected(values);
	};

	const handleRightChange = (values: string[], items: SelectorItem[]) => {
		setRightSelected(values);
	};

	const handleToRight = () => {
		if (leftSelected.length === 0) return;
		const itemsToMove = leftData.filter((item) => leftSelected.includes(item.value));
		setRightData([...rightData, ...itemsToMove]);
		setLeftData(leftData.filter((item) => !leftSelected.includes(item.value)));
		setLeftSelected([]);
	};

	const handleToLeft = () => {
		if (rightSelected.length === 0) return;
		const itemsToMove = rightData.filter((item) => rightSelected.includes(item.value));
		setLeftData([...leftData, ...itemsToMove]);
		setRightData(rightData.filter((item) => !rightSelected.includes(item.value)));
		setRightSelected([]);
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">穿梭框组件演示</h1>

			<div className="flex gap-4 items-start">
				<div className="flex-1 border rounded-lg overflow-hidden">
					<div className="p-4 border-b">
						<span className="font-medium">
							可选用户 ({leftSelected.length}/{leftData.length})
						</span>
					</div>
					<Selector
						dataSource={leftData}
						value={leftSelected}
						onChange={handleLeftChange}
						height={400}
					>
						<div className="p-2">
							<SelectorSearch placeholder="搜索用户..." />
						</div>
						<SelectorSelectAll />
						<SelectorContent>{({ item }) => <SelectorContentItem item={item} />}</SelectorContent>
					</Selector>
				</div>

				<div className="flex flex-col gap-2 pt-20">
					<Button
						variant="outline"
						size="icon"
						onClick={handleToRight}
						disabled={leftSelected.length === 0}
					>
						<ArrowRight className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						onClick={handleToLeft}
						disabled={rightSelected.length === 0}
					>
						<ArrowLeft className="size-4" />
					</Button>
				</div>

				<div className="flex-1 border rounded-lg overflow-hidden">
					<div className="p-4 border-b">
						<span className="font-medium">
							已选用户 ({rightSelected.length}/{rightData.length})
						</span>
					</div>
					<Selector
						dataSource={rightData}
						value={rightSelected}
						onChange={handleRightChange}
						height={400}
					>
						<div className="p-2">
							<SelectorSearch placeholder="搜索已选用户..." />
						</div>
						<SelectorSelectAll />
						<SelectorContent>{({ item }) => <SelectorContentItem item={item} />}</SelectorContent>
					</Selector>
				</div>
			</div>
		</div>
	);
}
