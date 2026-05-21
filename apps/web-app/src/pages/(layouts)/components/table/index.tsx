
import { createFileRoute } from "@tanstack/react-router";
import { BasicDataGrid } from "./-basic";

export const Route = createFileRoute("/(layouts)/components/table/")({
	component: TableDemoContainer,
});

function TableDemoContainer() {
	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold mb-6">表格组件演示</h1>
			<BasicDataGrid />
		</div>
	);
}
