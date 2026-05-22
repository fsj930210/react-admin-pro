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
import type {
	ColumnOrderConfig,
	ColumnPinningConfig,
	ColumnResizingConfig,
	DataGridConfig,
	DataGridRef,
	DataUpdater,
	RowOrderConfig,
	RowPinningConfig,
	RowSelectionConfig
} from "../types";
import { useMergedValue } from "../hooks/use-merged-value";
import {
	getDefaultColumnResizingConfig,
	getDefaultColumnOrderConfig,
	getDefaultRowOrderConfig,
	getDefaultRowSelectionConfig,
	getDefaultColumnPinningConfig,
	getDefaultRowPinningConfig
} from "../utils/default-config";
import { useComposeFeatures } from "../features/use-compose-features";
import { DndContainer } from "./dnd-container";
import { useDataGridScrollArea } from "../hooks/use-scroll-area";
import { ColumnDragOverlay } from "./column-drag-overlay";
import { RowDragOverlay } from "./row-drag-overlay";
import { useDataGridData } from "../hooks/use-data-grid-data";
import { buildColumnsFromFactories } from "../utils/column-create-factory";
import { createRowSelectionColumnFactory } from "../columns/row-selection-column";
import { createRowOrderHandleColumnFactory } from "../columns/row-order-handle-column";


export interface DataGridProps<TData> {
	data: TData[];
	columns: ColumnDef<TData>[];
	rowKey: string | ((row: TData, index: number, parentRow?: Row<TData>) => string);
	border?: boolean;
	scroll?: { x?: number | string; y?: number | string };
	footer?: ReactNode | ((table: Table<TData>, config: DataGridConfig<TData>) => ReactNode);
	columnResizing?: ColumnResizingConfig;
	columnOrder?: ColumnOrderConfig;
	rowOrder?: RowOrderConfig;
	rowSelection?: RowSelectionConfig<TData>;
	columnPinning?: ColumnPinningConfig;
	rowPinning?: RowPinningConfig;
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
	rowSelection: userRowSelectionConfig,
	columnPinning: userColumnPinningConfig,
	rowPinning: userRowPinningConfig,
	onDataChange,
}: DataGridProps<TData>) {

	const config = useMergedValue({
		columnResizing: getDefaultColumnResizingConfig(),
		columnOrder: getDefaultColumnOrderConfig(),
		rowOrder: getDefaultRowOrderConfig(),
		rowSelection: getDefaultRowSelectionConfig<TData>(),
		columnPinning: getDefaultColumnPinningConfig(),
		rowPinning: getDefaultRowPinningConfig(),
	}, {
		columnResizing: userColumnResizingConfig,
		columnOrder: userColumnOrderConfig,
		rowOrder: userRowOrderConfig,
		rowSelection: userRowSelectionConfig,
		columnPinning: userColumnPinningConfig,
		rowPinning: userRowPinningConfig,
	});
	const { columnResizing } = config;

	const { prependColumns, appendColumns } = buildColumnsFromFactories<TData>(config,
		[
			createRowOrderHandleColumnFactory<TData>(),
			createRowSelectionColumnFactory<TData>()
		]
	);

	const columns = useNormalizeColumns([...prependColumns, ...userColumns, ...appendColumns]);
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
		dndConfig,
		fearureReturn,
		api
	} = useComposeFeatures<TData>(columns, config, featureContext);
	const { columnOrderDrag, rowOrderDrag } = fearureReturn ?? {};
	const { enable: enableDrag, callbacks: dndCallbacks } = dndConfig ?? {};
	const coreRowModel = getCoreRowModel();
	const table = useReactTable({
		data: tableData,
		columns,
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
