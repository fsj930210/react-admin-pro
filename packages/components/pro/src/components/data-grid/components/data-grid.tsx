import { Loading } from "@rap/components-ui/loading";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Pagination } from "../../pagination";
import { useDataGrid } from "../hooks/use-data-grid";
import type { DataGridProps } from "../types";
import { Empty } from "./empty";
import { Grid } from "./grid";
import { GridBody } from "./grid-body";
import { GridContextMenu, type HeaderContextMenuState } from "./grid-context-menu";
import { GridHeader } from "./grid-header";

const ROW_HEIGHT = 40;

function getOverlayScrollViewport(root: HTMLElement | null) {
	return root?.querySelector("[data-overlayscrollbars-viewport], .os-viewport") as HTMLElement | null;
}

export function DataGrid<TData>(props: DataGridProps<TData>) {
	const { table } = useDataGrid<TData>(props);
	const scrollRootRef = useRef<{ getElement?: () => HTMLElement | null } | null>(null);
	const headerRef = useRef<HTMLDivElement>(null);
	const [headerHeight, setHeaderHeight] = useState(0);
	const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
	const [headerMenu, setHeaderMenu] = useState<HeaderContextMenuState<TData> | null>(null);
	const rows = table.getRowModel().rows;
	const pagination = props.pagination === false ? undefined : props.pagination;
	const total = pagination?.total ?? table.getFilteredRowModel().rows.length;
	const gridTemplateColumns = useMemo(
		() => table.getVisibleLeafColumns().map((column) => `${column.getSize()}px`).join(" "),
		[table],
	);

	useEffect(() => {
		const header = headerRef.current;
		if (!header) return;
		const updateHeaderHeight = () => setHeaderHeight(header.getBoundingClientRect().height);
		updateHeaderHeight();
		const observer = new ResizeObserver(updateHeaderHeight);
		observer.observe(header);
		return () => observer.disconnect();
	}, []);

	const contentWidth = table.getTotalSize();
	const scrollWidth =
		typeof props.scroll?.x === "number" && typeof contentWidth === "number"
			? Math.min(props.scroll.x, contentWidth)
			: props.scroll?.x;

	return (
		<Grid
			className={props.border ? undefined : "border-0"}
			style={{
				"--rap-data-grid-header-height": `${headerHeight}px`,
				"--rap-data-grid-row-height": `${ROW_HEIGHT}px`,
			} as CSSProperties}
		>
			<OverlayScrollbarsComponent
				ref={scrollRootRef as never}
				className="[&_.os-scrollbar-vertical]:!top-[var(--rap-data-grid-header-height)] [&_.os-scrollbar-vertical]:!bottom-0"
				style={{ maxHeight: props.scroll?.y ?? "auto", maxWidth: scrollWidth ?? "auto" }}
				options={{ scrollbars: { theme: "os-theme-dark" } }}
				events={{
					initialized: () => {
						const root = scrollRootRef.current?.getElement?.();
						setScrollElement(getOverlayScrollViewport(root ?? null));
					},
					scroll: (_instance, event) => {
						const target = event.target as HTMLElement;
						props.onScroll?.(event, {
							scrollLeft: target.scrollLeft,
							scrollTop: target.scrollTop,
						});
					},
				}}
				defer
			>
				<div style={{ width: contentWidth }}>
					<GridHeader
						props={props}
						table={table}
						headerRef={headerRef}
						onHeaderContextMenu={(event, header) => {
							if (props.contextMenu === false || header.isPlaceholder || header.colSpan !== 1) return;
							event.preventDefault();
							setHeaderMenu({ x: event.clientX, y: event.clientY, column: header.column });
						}}
					/>
					{props.loading ? (
						<div className="flex h-32 items-center justify-center">
							<Loading />
						</div>
					) : rows.length ? (
						<GridBody
							props={props}
							table={table}
							rows={rows}
							scrollElement={scrollElement}
						/>
					) : (
						<Empty {...props.empty} />
					)}
				</div>
			</OverlayScrollbarsComponent>
			{pagination ? (
				<Pagination
					className="border-t p-2"
					total={total}
					page={table.getState().pagination.pageIndex + 1}
					pageSize={table.getState().pagination.pageSize}
					defaultPage={pagination.defaultPage}
					defaultPageSize={pagination.defaultPageSize}
					showSizeChanger={pagination.showSizeChanger ?? true}
					showQuickJumper={pagination.showQuickJumper}
					pageSizeOptions={pagination.pageSizeOptions}
					showTotal={pagination.showTotal}
					onChange={(page, pageSize) => {
						table.setPageIndex(page - 1);
						table.setPageSize(pageSize);
					}}
					onShowSizeChange={pagination.onShowSizeChange}
				/>
			) : null}
			{headerMenu ? (
				<GridContextMenu
					table={table}
					menu={headerMenu}
					render={props.contextMenu && props.contextMenu.render ? props.contextMenu.render : undefined}
					onClose={() => setHeaderMenu(null)}
				/>
			) : null}
		</Grid>
	);
}
