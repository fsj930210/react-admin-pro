import { useEffect, useRef, useState, type CSSProperties } from "react";

interface UseDataGridScrollAreaOptions {
	scroll?: { x?: number | string; y?: number | string };
	contentWidth?: number;
}

export function useDataGridScrollArea({ scroll, contentWidth }: UseDataGridScrollAreaOptions) {
	const headerRef = useRef<HTMLDivElement>(null);
	const [headerHeight, setHeaderHeight] = useState(0);
	const scrollWidth =
		typeof scroll?.x === "number" && typeof contentWidth === "number"
			? Math.min(scroll.x, contentWidth)
			: scroll?.x;

	useEffect(() => {
		const header = headerRef.current;
		if (!header) return;

		const updateHeaderHeight = () => {
			setHeaderHeight(header.getBoundingClientRect().height);
		};

		updateHeaderHeight();

		const resizeObserver = new ResizeObserver(updateHeaderHeight);
		resizeObserver.observe(header);

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	return {
		headerRef,
		scrollAreaClassName: "[&_.os-scrollbar-vertical]:!top-[var(--rap-data-grid-header-height)] [&_.os-scrollbar-vertical]:!bottom-0",
		scrollAreaStyle: {
			"--rap-data-grid-header-height": `${headerHeight}px`,
			maxHeight: scroll?.y || "auto",
			maxWidth: scrollWidth || "auto",
		} as CSSProperties,
	};
}
