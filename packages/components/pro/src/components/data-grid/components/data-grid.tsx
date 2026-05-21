import type { ReactNode } from "react";

import { getCoreRowModel, useReactTable, type ColumnDef, type Row, type Table, } from "@tanstack/react-table";
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

import { DataGridHeader } from "./grid-header";
import { DataGridBody } from "./grid-body";
import { useNormalizeColumns } from "../hooks/use-normalize-columns";
import { Grid } from "./grid";
import type { ColumnOrderConfig, ColumnResizingConfig, DataGridConfig } from "../types";
import { useMergedValue } from "../hooks/use-merged-value";
import { defaultColumnOrderConfig, defaultColumnResizingConfig } from "../utils/default-config";


export interface DataGridProps<TData> {
	data: TData[];
	columns: ColumnDef<TData>[];
	rowKey: string | ((row: TData, index: number, parentRow?: Row<TData>) => string);
	border?: boolean;
	scroll?: { x?: number | string; y?: number | string };
	footer?: ReactNode | ((table: Table<TData>, config: DataGridConfig) => ReactNode);
	columnResizing?: ColumnResizingConfig;
	columnOrder?: ColumnOrderConfig;
}

export function DataGrid<TData>({
	data,
	columns: userColumns,
	rowKey,
	border = false,
	scroll,
	footer,
	columnResizing: userColumnResizingConfig,
	columnOrder: userColumnOrderConfig,
}: DataGridProps<TData>) {
	const columns = useNormalizeColumns(userColumns);
	const config = useMergedValue({
		columnResizing: defaultColumnResizingConfig,
		columnOrder: defaultColumnOrderConfig,
	}, {
		columnResizing: userColumnResizingConfig,
		columnOrder: userColumnOrderConfig,
	});
	const { columnResizing, columnOrder } = config;

	const coreRowModel = getCoreRowModel();
	const table = useReactTable({
		data,
		columns: columns,
		columnResizeMode: columnResizing.columnResizeMode,
		getCoreRowModel: coreRowModel,
		enableColumnResizing: columnResizing.enable,
		defaultColumn: {
			minSize: columnResizing.minSize,
			maxSize: columnResizing.maxSize,
		},
	});



	return (
		<Grid>
			<OverlayScrollbarsComponent
				style={{ maxHeight: scroll?.y || 'auto', maxWidth: scroll?.x || 'auto' }}
				options={{ scrollbars: { theme: 'os-theme-dark' } }}
				events={{
					initialized: () => console.log('initialized'),
					destroyed: () => console.log('destroyed'),
					updated: () => console.log('updated'),
					scroll: () => console.log('scroll'),
				}}
				defer
			>
				<div
					className="w-max"
					style={{ width: columnResizing.enable ? table.getTotalSize() : 'max-content' }}
				>
					<DataGridHeader<TData>
						table={table}
						border={border}
						config={config}
					/>
					<DataGridBody<TData>
						table={table}
						border={border}
						rowKey={rowKey}
						config={config}
					/>
					{typeof footer === 'function' ? footer(table, config) : footer}
				</div>

			</OverlayScrollbarsComponent>
		</Grid>

	);
}
