import { useState } from "react";
import { Button } from "@rap/components-ui/button";
import { createFileRoute } from "@tanstack/react-router";
import { BasicTable } from "./-basic";
import { RadioRowSelectionTable } from "./-radio-row-selection-table";

export const Route = createFileRoute("/(layouts)/components/table/")({
	component: TableDemoContainer,
});

type TableDemoType = "basic" | "radio-selection";

function TableDemoContainer() {
	const [activeDemo, setActiveDemo] = useState<TableDemoType>("basic");

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">表格组件演示</h1>

			<div className="flex items-center gap-2 mb-6">
				<Button
					variant={activeDemo === "basic" ? "default" : "outline"}
					onClick={() => setActiveDemo("basic")}
				>
					基础表格 (Checkbox 选择)
				</Button>
				<Button
					variant={activeDemo === "radio-selection" ? "default" : "outline"}
					onClick={() => setActiveDemo("radio-selection")}
				>
					筛选功能 (Radio 选择)
				</Button>
			</div>

			{activeDemo === "basic" && <BasicTable />}
			{activeDemo === "radio-selection" && <RadioRowSelectionTable />}
		</div>
	);
}
