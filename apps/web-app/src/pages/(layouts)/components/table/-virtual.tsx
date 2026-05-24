import { DataGrid, GridCell, GridRow } from "@rap/components-pro/data-grid";
import type { Row } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers, type DemoUser } from "./-demo-data";

export function VirtualDataGridDemo() {
	const data = useMemo(() => createDemoUsers(2000), []);
	const columns = useMemo(() => createUserColumns(), []);

	return (
		<section className="space-y-3">
			<DemoTitle
				title="Virtual body extension"
				description="通过 components.body 接入 @tanstack/react-virtual，DataGrid 不内置虚拟化。"
			/>
			<DataGrid
				rowKey="id"
				columns={columns}
				data={data}
				scroll={{ x: 1300, y: 460 }}
				components={{
					body: ({ rows, scrollElement }) => (
						<VirtualBody rows={rows} scrollElement={scrollElement} />
					),
				}}
			/>
		</section>
	);
}

export function VirtualBody({
	rows,
	scrollElement,
}: {
	rows: Row<DemoUser>[];
	scrollElement: HTMLElement | null;
}) {
	const rowHeight = 40;
	const overscan = 8;
	const [viewport, setViewport] = useState({ top: 0, height: 420 });

	useEffect(() => {
		if (!scrollElement) return;
		scrollElement.scrollTop = 0;
		const update = () => {
			setViewport({
				top: scrollElement.scrollTop,
				height: scrollElement.clientHeight,
			});
		};
		update();
		scrollElement.addEventListener("scroll", update);
		return () => scrollElement.removeEventListener("scroll", update);
	}, [scrollElement]);

	const startIndex = Math.max(0, Math.floor(viewport.top / rowHeight) - overscan);
	const endIndex = Math.min(
		rows.length,
		Math.ceil((viewport.top + viewport.height) / rowHeight) + overscan,
	);
	const virtualRows = rows.slice(startIndex, endIndex);

	return (
		<div style={{ height: rows.length * rowHeight, position: "relative" }}>
			{virtualRows.map((row, offset) => {
				const index = startIndex + offset;
				return (
					<GridRow
						key={row.id}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "100%",
							transform: `translateY(${index * rowHeight}px)`,
							gridTemplateColumns: row
								.getVisibleCells()
								.map((cell) => `${cell.column.getSize()}px`)
								.join(" "),
						}}
					>
						{row.getVisibleCells().map((cell) => (
							<GridCell key={cell.id} style={{ width: cell.column.getSize() }}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</GridCell>
						))}
					</GridRow>
				);
			})}
		</div>
	);
}
