import type { SelectorItem } from "@rap/components-base/selector";
import {
	Transfer,
	TransferPanel,
	MoveToTargetAction,
	MoveToSourceAction,
	MoveAllToSourceAction,
	MoveAllToTargetAction,
} from "@rap/components-base/transfer";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/(layouts)/components/transfer/")({
	component: TransferDemo,
});

const generateUserData = (count: number): SelectorItem[] => {
	const users: SelectorItem[] = [];
	for (let i = 1; i <= count; i++) {
		let label: string;
		if (i % 5 === 0) {
			label = `用户 ${i} - 这是一个非常长的用户名，用于测试文本省略功能 This is a very long username to test text ellipsis`;
		} else {
			label = `用户 ${i}`;
		}
		users.push({ label, value: `user-${i}` });
	}
	users.push(
		{ label: "管理员 - 系统管理员账号，具有最高权限", value: "admin", disabled: true },
		{ label: "访客 - 只读权限用户", value: "guest", disabled: true },
	);
	return users;
};

const allDataSource: SelectorItem[] = [
	...generateUserData(50),
	{ label: "已选用户 1", value: "selected-1" },
	{ label: "已选用户 2 - 这是一个已选中的用户，标签也很长", value: "selected-2" },
];

const initialSelectedValues = ["selected-1", "selected-2"];

function TransferDemo() {
	const [selectedValues, setSelectedValues] = useState<string[]>(initialSelectedValues);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">穿梭框组件演示</h1>

			<Transfer
				dataSource={allDataSource}
				value={selectedValues}
				onChange={setSelectedValues}
			>
				<div className="flex gap-4">
					<TransferPanel
						type="source"
						className="flex-1 border rounded-lg overflow-hidden"
					/>
					<div className="flex flex-col gap-2 pt-20">
						<MoveToTargetAction />

						<MoveToSourceAction />

						<MoveAllToSourceAction />
						<MoveAllToTargetAction />

					</div>
					<TransferPanel
						type="target"
						className="flex-1 border rounded-lg overflow-hidden"
					/>
				</div>
			</Transfer>
		</div>
	);
}
