import { useImperativeHandle, type ReactNode, type Ref } from "react";

import {
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
	type Row,
	type Table,
} from "@tanstack/react-table";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { DataGridHeader } from "./grid-header";
import { DataGridBody } from "./grid-body";
import { useNormalizeColumns } from "../hooks/use-normalize-columns";
import { Grid } from "./grid";
import type { ColumnOrderConfig, ColumnResizingConfig, DataGridConfig, DataGridRef, DataUpdater, RowOrderConfig } from "../types";
import { useMergedValue } from "../hooks/use-merged-value";
import { defaultColumnOrderConfig, defaultColumnResizingConfig, defaultRowOrderConfig } from "../utils/default-config";
import { useComposeFeatures } from "../features/use-compose-features";
import { DndContainer } from "./dnd-container";
import { useDataGridScrollArea } from "../hooks/use-scroll-area";
import { ColumnDragOverlay } from "./column-drag-overlay";
import { RowDragOverlay } from "./row-drag-overlay";
import { useDataGridData } from "../hooks/use-data-grid-data";


export interface DataGridProps<TData> {
	data: TData[];
	columns: ColumnDef<TData>[];
	rowKey: string | ((row: TData, index: number, parentRow?: Row<TData>) => string);
	border?: boolean;
	scroll?: { x?: number | string; y?: number | string };
	footer?: ReactNode | ((table: Table<TData>, config: DataGridConfig) => ReactNode);
	columnResizing?: ColumnResizingConfig;
	columnOrder?: ColumnOrderConfig;
	rowOrder?: RowOrderConfig;
	onDataChange?: (updater: DataUpdater<TData>) => void;
	ref?: Ref<DataGridRef>;
}

export function DataGrid<TData>({
	data,
	columns: userColumns,
	rowKey,
	border = false,
	scroll,
	footer,
	ref,
	columnResizing: userColumnResizingConfig,
	columnOrder: userColumnOrderConfig,
	rowOrder: userRowOrderConfig,
	onDataChange,
}: DataGridProps<TData>) {
	const columns = useNormalizeColumns(userColumns);
	const config = useMergedValue({
		columnResizing: defaultColumnResizingConfig,
		columnOrder: defaultColumnOrderConfig,
		rowOrder: defaultRowOrderConfig,
	}, {
		columnResizing: userColumnResizingConfig,
		columnOrder: userColumnOrderConfig,
		rowOrder: userRowOrderConfig,
	});
	const { columnResizing } = config;
	const enableColumnDrag = (config.columnOrder?.enable ?? false) && (config.columnOrder?.enableDrag ?? false);
	const enableRowDrag = (config.rowOrder?.enable ?? false) && (config.rowOrder?.enableDrag ?? false);
	const {
		data: tableData,
		getRowId,
		updateData,
		updateCellData,
		featureContext,
	} = useDataGridData({
		data,
		rowKey,
		onDataChange,
	});

	const {
		state,
		callbacks,
		dndCallbacks,
		enableDrag,
		columnOrderDrag,
		rowOrderDrag,
		api
	} = useComposeFeatures(columns, config, featureContext);


	const coreRowModel = getCoreRowModel();
	const table = useReactTable({
		data: tableData,
		columns: columns,
		columnResizeMode: columnResizing.columnResizeMode,
		getRowId,
		getCoreRowModel: coreRowModel,
		enableColumnResizing: columnResizing.enable,
		defaultColumn: {
			minSize: columnResizing.minSize,
			maxSize: columnResizing.maxSize,
		},
		state,
		meta: {
			updateData,
			updateCellData,
		},
		...callbacks,
	});

	useImperativeHandle(ref, () => ({
		...api,
	}));

	const {
		headerRef,
		scrollAreaClassName,
		scrollAreaStyle,
	} = useDataGridScrollArea({ scroll });

	const content = (
		<OverlayScrollbarsComponent
			className={scrollAreaClassName}
			style={scrollAreaStyle}
			options={{ scrollbars: { theme: "os-theme-dark" } }}
			events={{
				initialized: () => console.log("initialized"),
				destroyed: () => console.log("destroyed"),
				updated: () => console.log("updated"),
				scroll: () => console.log("scroll"),
			}}
			defer
		>
			<div
				className="w-max"
				style={{ width: columnResizing.enable ? table.getTotalSize() : 'max-content' }}
			>
				<div ref={headerRef} className="bg-muted w-full sticky top-0">
					<DataGridHeader<TData>
						table={table}
						border={border}
						config={config}
						dragType="column"
						enableDrag={enableColumnDrag}
						columnOrderDrag={columnOrderDrag}
					/>
				</div>
				<div className="w-full">
					<DataGridBody<TData>
						table={table}
						border={border}
						rowKey={rowKey}
						config={config}
						dragType="row"
						enableDrag={enableRowDrag}
						columnOrderDrag={columnOrderDrag}
						rowOrderDrag={rowOrderDrag}
					/>
				</div>
				{typeof footer === 'function' ? footer(table, config) : footer}
			</div>
		</OverlayScrollbarsComponent>
	)
	return (
		<Grid>
			{
				enableDrag ? (
					<DndContainer
						{...dndCallbacks}
						overlay={rowOrderDrag?.activeRowId ? (
							<RowDragOverlay<TData>
								table={table}
								config={config}
								rowOrderDrag={rowOrderDrag}
								border={border}
							/>
						) : columnOrderDrag?.activeColumnId ? (
							<ColumnDragOverlay<TData>
								table={table}
								config={config}
								columnOrderDrag={columnOrderDrag}
							/>
						) : null}
					>
						{content}
					</DndContainer>
				) : content
			}
		</Grid>

	);
}
