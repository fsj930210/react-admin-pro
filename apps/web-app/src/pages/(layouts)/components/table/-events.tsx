import { DataGrid } from "@rap/components-pro/data-grid";
import { useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers } from "./-demo-data";

export function EventsDataGridDemo() {
	const data = useMemo(() => createDemoUsers(32), []);
	const columns = useMemo(() => createUserColumns(), []);
	const [message, setMessage] = useState("Interact with rows, cells, headers, or scroll.");

	return (
		<section className="space-y-3">
			<DemoTitle
				title="Events"
				description="onRow、onCell、onHeaderRow、onHeaderCell 和 onScroll 的使用方式。"
			/>
			<p className="rounded border bg-muted px-3 py-2 text-sm">{message}</p>
			<DataGrid
				rowKey="id"
				columns={columns}
				data={data}
				scroll={{ x: 1300, y: 320 }}
				onScroll={(_, info) =>
					setMessage(
						`scrollTop=${Math.round(info.scrollTop)}, scrollLeft=${Math.round(info.scrollLeft)}`,
					)
				}
				onRow={(record) => ({ onDoubleClick: () => setMessage(`double click row ${record.id}`) })}
				onCell={(record, _index, ctx) => ({
					onClick: () => setMessage(`click ${record.id}.${ctx.column.id}`),
				})}
				onHeaderCell={(column) => ({
					onDoubleClick: () => setMessage(`double click header ${column.id}`),
				})}
				onHeaderRow={(_columns, index) => ({
					onMouseEnter: () => setMessage(`enter header row ${index}`),
				})}
			/>
		</section>
	);
}
