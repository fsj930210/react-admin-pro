import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { Loading } from "@rap/components-ui/loading";
import { Choose, Otherwise, When } from "@rap/components-ui/when";
import { cn } from "@rap/utils";
import { GripVertical } from "lucide-react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useColumnOrderingDnd } from "../hooks/use-column-ordering-dnd";
import { useDataGrid } from "../hooks/use-data-grid";
import { useDataGridView } from "../hooks/use-data-grid-view";
import type { DataGridProps } from "../types";
import { DataGridPagination } from "./data-grid-pagination";
import { Empty } from "./empty";
import { GridBody } from "./grid-body";
import { GridContextMenu, type HeaderContextMenuState } from "./grid-context-menu";
import { GridHeader } from "./grid-header";

export function DataGrid<TData>(props: DataGridProps<TData>) {
	const { table } = useDataGrid<TData>(props);
	const view = useDataGridView(props, table);
	const columnOrderingDrag = useColumnOrderingDnd(
		table,
		props.columnOrdering !== false &&
			props.columnOrdering?.enabled !== false &&
			Boolean(props.columnOrdering?.drag),
	);
	const rows = table.getRowModel().rows;
	const contextMenuRender = props.contextMenu === false ? undefined : props.contextMenu?.render;
	const contextMenuEnableDefault =
		props.contextMenu !== false && props.contextMenu?.enable === true && !contextMenuRender;
	const pagination = props.pagination === false ? undefined : props.pagination;
	const total = pagination?.total ?? table.getFilteredRowModel().rows.length;

	const content = (
		<div
			className={cn("w-full overflow-hidden", props.border && "border-t border-l")}
			style={view.rootStyle}
		>
			<OverlayScrollbarsComponent
				ref={view.scrollRootRef as never}
				{...view.scrollAreaProps}
				options={{ scrollbars: { theme: "os-theme-dark" } }}
				events={{
					initialized: view.onScrollInitialized,
					scroll: (_instance, event) => {
						const target = event.target as HTMLElement;
						view.onScroll(event);
						props.onScroll?.(event, {
							scrollLeft: target.scrollLeft,
							scrollTop: target.scrollTop,
						});
					},
				}}
				defer
			>
				<div style={{ width: view.contentWidth }}>
					<GridHeader
						props={props}
						table={table}
						headerRef={view.headerRef}
						onHeaderContextMenu={view.onHeaderContextMenu}
						columnOrderingDrag={columnOrderingDrag}
					/>
					<Choose>
						<When condition={props.loading}>
							<div className="flex h-32 items-center justify-center">
								<Loading />
							</div>
						</When>
						<When condition={rows.length > 0}>
							<GridBody
								props={props}
								table={table}
								rows={rows}
								scrollElement={view.scrollElement}
							/>
						</When>
						<Otherwise>
							<Empty {...props.empty} />
						</Otherwise>
					</Choose>
				</div>
			</OverlayScrollbarsComponent>
			<DataGridPagination table={table} config={pagination} total={total} loading={props.loading} />
			<When condition={Boolean(view.headerMenu)}>
				<GridContextMenu
					table={table}
					menu={view.headerMenu as HeaderContextMenuState<TData>}
					enableDefault={contextMenuEnableDefault}
					render={contextMenuRender}
					onClose={() => view.setHeaderMenu(null)}
				/>
			</When>
		</div>
	);

	if (!columnOrderingDrag) {
		return content;
	}

	return (
		<DragDropProvider
			onDragStart={columnOrderingDrag.onDragStart}
			onDragOver={columnOrderingDrag.onDragOver}
			onDragEnd={columnOrderingDrag.onDragEnd}
		>
			{content}
			<DragOverlay dropAnimation={null}>
				{columnOrderingDrag.activeColumnId ? (
					<div className="pointer-events-none flex h-12 min-w-28 items-center gap-2 rounded-md border bg-popover px-3 text-sm font-medium text-popover-foreground shadow-lg">
						<GripVertical className="size-4 text-muted-foreground" />
						<span className="truncate">{columnOrderingDrag.activeColumnTitle}</span>
					</div>
				) : null}
			</DragOverlay>
		</DragDropProvider>
	);
}
