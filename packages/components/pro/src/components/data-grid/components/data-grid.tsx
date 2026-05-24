import { Loading } from "@rap/components-ui/loading";
import { Choose, Otherwise, When } from "@rap/components-ui/when";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useDataGrid } from "../hooks/use-data-grid";
import type { DataGridProps } from "../types";
import { DataGridPagination } from "./data-grid-pagination";
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
	const contextMenuRender = props.contextMenu === false ? undefined : props.contextMenu?.render;
	const pagination = props.pagination === false ? undefined : props.pagination;
	const total = pagination?.total ?? table.getFilteredRowModel().rows.length;

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
	const leftPinnedWidth = table.getLeftLeafColumns().reduce((total, column) => total + column.getSize(), 0);
	const rightPinnedWidth = table.getRightLeafColumns().reduce((total, column) => total + column.getSize(), 0);
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
			<div
				className="relative data-grid-pinned-shadow"
				data-left-shadow={leftPinnedWidth > 0 ? "true" : undefined}
				data-right-shadow={rightPinnedWidth > 0 ? "true" : undefined}
				style={{
					"--data-grid-pinned-left-width": `${leftPinnedWidth}px`,
					"--data-grid-pinned-right-width": `${rightPinnedWidth}px`,
					maxWidth: scrollWidth ?? "auto",
				} as CSSProperties}
			>
				<OverlayScrollbarsComponent
					ref={scrollRootRef as never}
					className="[&_.os-scrollbar-vertical]:!top-[var(--rap-data-grid-header-height)] [&_.os-scrollbar-vertical]:!bottom-0"
					style={{ maxHeight: props.scroll?.y ?? "auto" }}
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
									scrollElement={scrollElement}
								/>
							</When>
							<Otherwise>
								<Empty {...props.empty} />
							</Otherwise>
						</Choose>
					</div>
				</OverlayScrollbarsComponent>
			</div>
			<DataGridPagination
				table={table}
				config={pagination}
				total={total}
				loading={props.loading}
			/>
			<When condition={Boolean(headerMenu)}>
				<GridContextMenu
					table={table}
					menu={headerMenu as HeaderContextMenuState<TData>}
					render={contextMenuRender}
					onClose={() => setHeaderMenu(null)}
				/>
			</When>
		</Grid>
	);
}
