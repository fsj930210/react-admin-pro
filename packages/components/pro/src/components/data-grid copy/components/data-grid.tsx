import { useEffect, useImperativeHandle, useRef, useState, type ReactNode, type Ref } from "react";

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
	ColumnVisibilityConfig,
	DataGridConfig,
	DataGridDataResult,
	DataGridFieldPath,
	DataGridLoadParams,
	DataGridRef,
	DataUpdater,
	EditableCellConfig,
	ExpandingConfig,
	FilteringConfig,
	InfiniteConfig,
	PaginationConfig,
	RowOrderConfig,
	RowPinningConfig,
	RowSelectionConfig,
	SortingConfig,
	SubComponentsConfig,
	VirtualConfig,
	ColumnMenuConfig
} from "../types";
import { useMergedValue } from "../hooks/use-merged-value";
import {
	getDefaultColumnResizingConfig,
	getDefaultColumnOrderConfig,
	getDefaultRowOrderConfig,
	getDefaultRowSelectionConfig,
	getDefaultColumnPinningConfig,
	getDefaultRowPinningConfig,
	getDefaultColumnVisibilityConfig,
	getDefaultSortingConfig,
	getDefaultFilteringConfig,
	getDefaultPaginationConfig,
	getDefaultColumnMenuConfig,
	getDefaultVirtualConfig,
	getDefaultInfiniteConfig,
	getDefaultExpandingConfig,
	getDefaultEditableCellConfig
} from "../utils/default-config";
import { useComposeFeatures } from "../features/use-compose-features";
import { DndContainer } from "./dnd-container";
import { useDataGridScrollArea } from "../hooks/use-scroll-area";
import { ColumnDragOverlay } from "./column-drag-overlay";
import { RowDragOverlay } from "./row-drag-overlay";
import { useDataGridData } from "../hooks/use-data-grid-data";
import { useDataGridLoader } from "../hooks/use-data-grid-loader";
import { buildColumnsFromFactories } from "../utils/column-create-factory";
import { createRowSelectionColumnFactory } from "../columns/row-selection-column";
import { createRowOrderHandleColumnFactory } from "../columns/row-order-handle-column";
import { DataGridPagination } from "./data-grid-pagination";
import { dataGridFilter, dataGridGlobalFuzzy } from "../utils/filtering";


export interface DataGridProps<TData, TRaw = unknown> {
	data?: TData[];
	columns: ColumnDef<TData>[];
	rowKey: string | ((row: TData, index: number, parentRow?: Row<TData>) => string);
	border?: boolean;
	scroll?: { x?: number | string; y?: number | string };
	footer?: ReactNode | ((table: Table<TData>, config: DataGridConfig<TData>) => ReactNode);
	dataLoad?: (params: DataGridLoadParams) => Promise<TRaw>;
	transformData?: (raw: TRaw) => DataGridDataResult<TData>;
	dataField?: DataGridFieldPath;
	totalField?: DataGridFieldPath;
	loading?: boolean;
	columnResizing?: ColumnResizingConfig;
	columnOrder?: ColumnOrderConfig;
	rowOrder?: RowOrderConfig;
	rowSelection?: RowSelectionConfig<TData>;
	columnPinning?: ColumnPinningConfig;
	rowPinning?: RowPinningConfig;
	visibility?: ColumnVisibilityConfig;
	sorting?: SortingConfig<TData>;
	filtering?: FilteringConfig<TData>;
	pagination?: PaginationConfig | false;
	columnMenu?: ColumnMenuConfig;
	virtual?: VirtualConfig;
	infinite?: InfiniteConfig;
	expanding?: ExpandingConfig<TData>;
	editable?: EditableCellConfig<TData>;
	subComponents?: SubComponentsConfig<TData>;
	onDataChange?: (updater: DataUpdater<TData>) => void;
	ref?: Ref<DataGridRef>;
}

export function DataGrid<TData, TRaw = unknown>({
	data = [],
	columns: userColumns,
	rowKey,
	border = false,
	scroll,
	footer,
	ref,
	dataLoad,
	transformData,
	dataField,
	totalField,
	loading: userLoading,
	columnResizing: userColumnResizingConfig,
	columnOrder: userColumnOrderConfig,
	rowOrder: userRowOrderConfig,
	rowSelection: userRowSelectionConfig,
	columnPinning: userColumnPinningConfig,
	rowPinning: userRowPinningConfig,
	visibility: userColumnVisibilityConfig,
	sorting: userSortingConfig,
	filtering: userFilteringConfig,
	pagination: userPaginationConfig,
	columnMenu: userColumnMenuConfig,
	virtual: userVirtualConfig,
	infinite: userInfiniteConfig,
	expanding: userExpandingConfig,
	editable: userEditableConfig,
	subComponents: userSubComponentsConfig,
	onDataChange,
}: DataGridProps<TData, TRaw>) {

	const defaultConfig: DataGridConfig<TData> = {
		columnResizing: getDefaultColumnResizingConfig(),
		columnOrder: getDefaultColumnOrderConfig(),
		rowOrder: getDefaultRowOrderConfig(),
		rowSelection: getDefaultRowSelectionConfig<TData>(),
		columnPinning: getDefaultColumnPinningConfig(),
		rowPinning: getDefaultRowPinningConfig(),
		columnVisibility: getDefaultColumnVisibilityConfig(),
		sorting: getDefaultSortingConfig<TData>(),
		filtering: getDefaultFilteringConfig<TData>(),
		pagination: getDefaultPaginationConfig(),
		columnMenu: getDefaultColumnMenuConfig(),
		virtual: getDefaultVirtualConfig(),
		infinite: getDefaultInfiniteConfig(),
		expanding: getDefaultExpandingConfig<TData>(),
		editable: getDefaultEditableCellConfig<TData>(),
		subComponents: {},
	};
	const config = useMergedValue(defaultConfig, {
		columnResizing: userColumnResizingConfig,
		columnOrder: userColumnOrderConfig,
		rowOrder: userRowOrderConfig,
		rowSelection: userRowSelectionConfig,
		columnPinning: userColumnPinningConfig,
		rowPinning: userRowPinningConfig,
		columnVisibility: userColumnVisibilityConfig,
		sorting: userSortingConfig,
		filtering: userFilteringConfig,
		pagination: userPaginationConfig,
		columnMenu: userColumnMenuConfig,
		virtual: userVirtualConfig,
		infinite: userInfiniteConfig,
		expanding: userExpandingConfig,
		editable: userEditableConfig,
		subComponents: userSubComponentsConfig,
	});
	const columnResizing = config.columnResizing ?? getDefaultColumnResizingConfig();
	const scrollRootRef = useRef<{ getElement?: () => HTMLElement | null } | null>(null);
	const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);

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
		api,
		tableOptions,
	} = useComposeFeatures<TData>(columns, config, featureContext);
	const loader = useDataGridLoader<TData, TRaw>({
		columns,
		dataLoad,
		transformData,
		dataField,
		totalField,
		updateData: (nextData) => updateData(nextData),
		sortingState: state?.sorting,
		columnFilters: state?.columnFilters,
		globalFilter: state?.globalFilter,
		columnVisibility: state?.columnVisibility,
		pagination: state?.pagination,
		sortingMode: config.sorting?.mode,
		filteringMode: config.filtering?.mode,
		paginationMode: config.pagination === false ? undefined : config.pagination?.mode,
	});
	const { columnOrderDrag, rowOrderDrag } = fearureReturn ?? {};
	const { enable: enableDrag, callbacks: dndCallbacks } = dndConfig ?? {};
	const coreRowModel = getCoreRowModel();
	const rowSelection = config.rowSelection;
	const loading = userLoading ?? loader.loading;
	const table = useReactTable({
		data: tableData,
		columns,
		columnResizeMode: columnResizing.columnResizeMode,
		getRowId,
		getCoreRowModel: coreRowModel,
		filterFns: {
			dataGridFilter,
			dataGridGlobalFuzzy,
		},
		defaultColumn: {
			minSize: columnResizing.minSize,
			maxSize: columnResizing.maxSize,
			filterFn: "dataGridFilter",
		},
		enableColumnResizing: columnResizing.enable,
		enableColumnPinning: config.columnPinning?.enable,
		enableRowPinning: config.rowPinning?.enable,
		enableRowSelection: rowSelection?.enable
			? rowSelection.enableRowSelection ?? true
			: false,
		enableMultiRowSelection: rowSelection?.enable
			? rowSelection.type !== "radio"
			: false,
		enableSubRowSelection: rowSelection?.enable
			? rowSelection.enableSubRowSelection
			: false,
		enableHiding: config.columnVisibility?.enable,
		state,
		meta: {
			updateData,
			updateCellData,
			reload: loader.reload,
		},
		...(tableOptions ?? {}),
		...callbacks,
	});

	useImperativeHandle(ref, () => ({
		...api,
		reload: loader.reload,
	}));

	useEffect(() => {
		const root = scrollRootRef.current?.getElement?.();
		setScrollElement(root?.querySelector(".os-viewport") as HTMLElement | null);
	}, []);

	useEffect(() => {
		const isDevelopment = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV === "development";
		if (
			isDevelopment &&
			config.infinite?.enable &&
			config.pagination !== false &&
			config.pagination?.enable
		) {
			console.warn("[DataGrid]: `pagination` and `infinite` are both enabled. Pagination takes precedence.");
		}
	}, [config.infinite?.enable, config.pagination]);

	const remoteQueryKeyRef = useRef<string | undefined>(undefined);
	useEffect(() => {
		if (config.pagination === false || config.pagination?.mode !== "remote") return;

		const queryKey = JSON.stringify({
			sorting: state?.sorting ?? [],
			columnFilters: state?.columnFilters ?? [],
			globalFilter: state?.globalFilter,
		});

		if (remoteQueryKeyRef.current === undefined) {
			remoteQueryKeyRef.current = queryKey;
			return;
		}

		if (remoteQueryKeyRef.current !== queryKey) {
			remoteQueryKeyRef.current = queryKey;
			table.setPageIndex(0);
		}
	}, [config.pagination, state?.columnFilters, state?.globalFilter, state?.sorting, table]);

	const {
		headerRef,
		scrollAreaClassName,
		scrollAreaStyle,
	} = useDataGridScrollArea({
		scroll,
		contentWidth: columnResizing.enable ? table.getTotalSize() : undefined,
	});


	const content = (
		<OverlayScrollbarsComponent
			ref={scrollRootRef as never}
			className={scrollAreaClassName}
			style={scrollAreaStyle}
			options={{ scrollbars: { theme: "os-theme-dark" } }}
			events={{
				initialized: () => {
					const root = scrollRootRef.current?.getElement?.();
					setScrollElement(root?.querySelector(".os-viewport") as HTMLElement | null);
				},
				scroll: (_instance, event) => {
					if (config.pagination !== false && config.pagination?.enable) return;
					if (!config.infinite?.enable) return;
					const target = event.target as HTMLElement;
					const threshold = config.infinite.threshold ?? 120;
					if (target.scrollTop + target.clientHeight >= target.scrollHeight - threshold) {
						config.infinite.onLoadMore?.();
					}
				},
			}}
			defer
		>
			<div
				className="w-max"
				style={{ width: columnResizing.enable ? table.getTotalSize() : 'max-content' }}
			>
				<div ref={headerRef} className="bg-muted w-full sticky top-0 z-30">
					<DataGridHeader<TData>
						table={table}
						border={border}
						config={config}
						dragType="column"
						columnOrderDrag={columnOrderDrag}
					/>
				</div>
				<div className="w-full">
					{loading ? (
						<div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
							Loading...
						</div>
					) : table.getRowModel().rows.length ? (
						<DataGridBody<TData>
							table={table}
							border={border}
							config={config}
							dragType="row"
							columnOrderDrag={columnOrderDrag}
							rowOrderDrag={rowOrderDrag}
							scrollElement={scrollElement}
						/>
					) : (
						<div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
							No data
						</div>
					)}
				</div>
				{typeof footer === 'function' ? footer(table, config) : footer}
				<DataGridPagination<TData>
					table={table}
					config={config.pagination}
					total={loader.total}
					loading={loading}
				/>
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
