import { Tabs, TabsContent, TabsList, TabsTrigger } from "@rap/components-ui/tabs";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { BasicDataGrid } from "./-basic";
import { ColumnDndDataGridDemo } from "./-column-dnd";
import { ColumnMenuDataGridDemo } from "./-column-menu";
import { ColumnOrderDataGridDemo } from "./-column-order";
import { EditableCellDataGridDemo } from "./-editable-cell";
import { EditableRowDataGridDemo } from "./-editable-row";
import { EventsDataGridDemo } from "./-events";
import { ExpandingDataGridDemo } from "./-expanding";
import { InfiniteDataGridDemo } from "./-infinite";
import { LocalDataGridDemo } from "./-local-data";
import { RemoteDataGridDemo } from "./-remote-data";
import { RowDndDataGridDemo } from "./-row-dnd";
import { RowOrderDataGridDemo } from "./-row-order";
import { RowSelectionDataGridDemo } from "./-row-selection";
import { TreeTableDataGridDemo } from "./-tree-table";
import { VirtualDataGridDemo } from "./-virtual";

export const Route = createFileRoute("/(layouts)/components/table/")({
	component: TableDemoContainer,
});

const groups = {
	core: [
		["basic", "Basic", BasicDataGrid],
		["remote", "Remote", RemoteDataGridDemo],
		["local", "Local", LocalDataGridDemo],
		["selection", "Selection", RowSelectionDataGridDemo],
		["expand", "Expand", ExpandingDataGridDemo],
		["menu", "Context menu", ColumnMenuDataGridDemo],
		["events", "Events", EventsDataGridDemo],
	],
	extensions: [
		["virtual", "Virtual", VirtualDataGridDemo],
		["row-order", "Row order", RowOrderDataGridDemo],
		["column-order", "Column order", ColumnOrderDataGridDemo],
		["row-dnd", "Row DnD", RowDndDataGridDemo],
		["column-dnd", "Column DnD", ColumnDndDataGridDemo],
		["editable-cell", "Editable cell", EditableCellDataGridDemo],
		["editable-row", "Editable row", EditableRowDataGridDemo],
		["tree", "Tree table", TreeTableDataGridDemo],
		["infinite", "Infinite", InfiniteDataGridDemo],
	],
} as const;

function TableDemoContainer() {
	const [group, setGroup] = useState<"core" | "extensions">("core");
	const [demo, setDemo] = useState("basic");
	const demos = groups[group];
	const ActiveDemo = demos.find(([key]) => key === demo)?.[2] ?? demos[0][2];

	return (
		<div className="space-y-6 p-6">
			<div>
				<h1 className="text-2xl font-bold">DataGrid</h1>
				<p className="text-sm text-muted-foreground">
					核心能力内置，低频能力通过插槽和外部状态扩展。Demo 按需渲染，避免大表格互相拖慢交互。
				</p>
			</div>
			<Tabs
				value={group}
				onValueChange={(value) => {
					const nextGroup = value as "core" | "extensions";
					setGroup(nextGroup);
					setDemo(groups[nextGroup][0][0]);
				}}
			>
				<TabsList>
					<TabsTrigger value="core">Core</TabsTrigger>
					<TabsTrigger value="extensions">Extensions</TabsTrigger>
				</TabsList>
				<TabsContent value={group} className="space-y-4">
					<div className="flex flex-wrap gap-2">
						{demos.map(([key, label]) => (
							<button
								key={key}
								type="button"
								className={
									key === demo
										? "rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
										: "rounded-md border px-3 py-1.5 text-sm"
								}
								onClick={() => setDemo(key)}
							>
								{label}
							</button>
						))}
					</div>
					<ActiveDemo />
				</TabsContent>
			</Tabs>
		</div>
	);
}
