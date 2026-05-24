import { DataGrid } from "@rap/components-pro/data-grid";
import { useMemo } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers } from "./-demo-data";

export function LocalDataGridDemo() {
	const data = useMemo(() => createDemoUsers(80), []);
	const columns = useMemo(() => createUserColumns(), []);

	return (
		<section className="space-y-3">
			<DemoTitle
				title="Local data"
				description="本地排序、筛选和分页显式开启，适合小数据量场景。"
			/>
			<DataGrid
				rowKey="id"
				columns={columns}
				data={data}
				scroll={{ x: 1300, y: 420 }}
				columnSizing={{}}
				sorting={{ mode: "local" }}
				filtering={{ mode: "local" }}
				pagination={{ mode: "local", defaultPageSize: 10, showSizeChanger: true }}
			/>
		</section>
	);
}
