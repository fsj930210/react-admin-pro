import type { Column, Header, Table } from "@tanstack/react-table";
import { type CSSProperties, type MouseEvent, useEffect, useRef, useState } from "react";
import type { HeaderContextMenuState } from "../components/grid-context-menu";
import type { DataGridProps } from "../types";

const ROW_HEIGHT = 40;
const SCROLL_EDGE_OFFSET = 1;

function hasExplicitColumnWidth<TData>(column: Column<TData, unknown>) {
	return Boolean(column.columnDef.meta?.__rapDataGridExplicitSize);
}

function getOverlayScrollViewport(root: HTMLElement | null) {
	return root?.querySelector(
		"[data-overlayscrollbars-viewport], .os-viewport",
	) as HTMLElement | null;
}

export function useDataGridView<TData>(props: DataGridProps<TData>, table: Table<TData>) {
	const scrollRootRef = useRef<{ getElement?: () => HTMLElement | null } | null>(null);
	const headerRef = useRef<HTMLDivElement>(null);
	const [headerHeight, setHeaderHeight] = useState(0);
	const [scrollElement, setScrollElement] = useState<HTMLElement | null>(null);
	const [scrollLeft, setScrollLeft] = useState(0);
	const [maxScrollLeft, setMaxScrollLeft] = useState(0);
	const [headerMenu, setHeaderMenu] = useState<HeaderContextMenuState<TData> | null>(null);

	useEffect(() => {
		const header = headerRef.current;
		if (!header) return;

		const updateHeaderHeight = () => setHeaderHeight(header.getBoundingClientRect().height);
		updateHeaderHeight();

		const observer = new ResizeObserver(updateHeaderHeight);
		observer.observe(header);

		return () => observer.disconnect();
	}, []);

	const measuredContentWidth = table.getTotalSize();
	const contentWidth = `max(100%, ${measuredContentWidth}px)`;
	const columnSizing = table.getState().columnSizing;
	const visibleColumns = [
		...table.getLeftLeafColumns(),
		...table.getCenterLeafColumns(),
		...table.getRightLeafColumns(),
	];
	const gridTemplateColumns = visibleColumns
		.map((column) => {
			const hasExplicitSize =
				hasExplicitColumnWidth(column) ||
				columnSizing[column.id] != null ||
				Boolean(column.getIsPinned());

			return hasExplicitSize ? `${column.getSize()}px` : "minmax(0, 1fr)";
		})
		.join(" ");
	const leftPinnedWidth = table
		.getLeftLeafColumns()
		.reduce((total, column) => total + column.getSize(), 0);
	const rightPinnedWidth = table
		.getRightLeafColumns()
		.reduce((total, column) => total + column.getSize(), 0);
	const scrollWidth =
		typeof props.scroll?.x === "number"
			? Math.min(props.scroll.x, measuredContentWidth)
			: props.scroll?.x;
	const hasLeftShadow = leftPinnedWidth > 0 && scrollLeft > SCROLL_EDGE_OFFSET;
	const hasRightShadow = rightPinnedWidth > 0 && maxScrollLeft - scrollLeft > SCROLL_EDGE_OFFSET;

	const updateScrollState = (target: HTMLElement | null) => {
		if (!target) {
			setScrollLeft(0);
			setMaxScrollLeft(0);
			return;
		}

		setScrollLeft(target.scrollLeft);
		setMaxScrollLeft(Math.max(target.scrollWidth - target.clientWidth, 0));
	};

	const onScrollInitialized = () => {
		const root = scrollRootRef.current?.getElement?.();
		const viewport = getOverlayScrollViewport(root ?? null);
		setScrollElement(viewport);
		updateScrollState(viewport);
	};

	const onScroll = (event: Event) => {
		updateScrollState(event.target as HTMLElement | null);
	};

	const onHeaderContextMenu = (event: MouseEvent, header: Header<TData, unknown>) => {
		const contextMenuEnabled =
			props.contextMenu !== false && (props.contextMenu?.enable === true || !!props.contextMenu?.render);
		if (!contextMenuEnabled || header.isPlaceholder) return;
		event.preventDefault();
		setHeaderMenu({ x: event.clientX, y: event.clientY, column: header.column });
	};

	return {
		contentWidth,
		headerMenu,
		headerRef,
		onHeaderContextMenu,
		onScrollInitialized,
		rootStyle: {
			"--rap-data-grid-header-height": `${headerHeight}px`,
			"--rap-data-grid-row-height": `${ROW_HEIGHT}px`,
			"--rap-data-grid-template-columns": gridTemplateColumns,
		} as CSSProperties,
		scrollElement,
		scrollRootRef,
		scrollAreaProps: {
			className:
				"relative min-h-0 data-grid-pinned-shadow data-[fill-height=true]:flex-1 [&[data-allow-horizontal=false]_.os-scrollbar-horizontal]:!hidden [&_.os-scrollbar-vertical]:!top-[var(--rap-data-grid-header-height)] [&_.os-scrollbar-vertical]:!bottom-0",
			"data-allow-horizontal": props.scroll?.x != null ? "true" : "false",
			"data-fill-height": props.scroll?.y != null ? "true" : undefined,
			"data-left-shadow": hasLeftShadow ? "true" : undefined,
			"data-right-shadow": hasRightShadow ? "true" : undefined,
			style: {
				"--data-grid-pinned-left-width": `${leftPinnedWidth}px`,
				"--data-grid-pinned-right-width": `${rightPinnedWidth}px`,
				maxHeight: props.scroll?.y ?? "auto",
				height: props.scroll?.y === "100%" ? "100%" : undefined,
				maxWidth: scrollWidth ?? "auto",
			} as CSSProperties,
		},
		onScroll,
		setHeaderMenu,
	};
}
