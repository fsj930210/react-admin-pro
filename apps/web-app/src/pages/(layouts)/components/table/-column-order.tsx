import { DataGrid } from "@rap/components-pro/data-grid";
import { Button } from "@rap/components-ui/button";
import { useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers } from "./-demo-data";

const reversedColumnOrder = [
	"name",
	"score",
	"status",
	"salary",
	"joinDate",
	"position",
	"department",
	"age",
	"email",
];

export function ColumnOrderDataGridDemo() {
	const data = useMemo(() => createDemoUsers(20), []);
	const columns = useMemo(() => createUserColumns(), []);
	const [reversed, setReversed] = useState(false);

	return (
		<section className="space-y-3">
			<DemoTitle
				title="Column order"
				description="Column order is controlled by DataGrid state, while pinned columns stay in their own area."
			/>
			<Button variant="outline" onClick={() => setReversed((value) => !value)}>
				Toggle column order
			</Button>
			<DataGrid
				rowKey="id"
				columns={columns}
				data={data}
				scroll={{ x: 1300, y: 360 }}
				columnOrdering={{ value: reversed ? reversedColumnOrder : [] }}
			/>
		</section>
	);
}
