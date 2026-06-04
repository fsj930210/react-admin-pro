import { useIsomorphicLayoutEffect } from "@rap/hooks/use-isomorphic-layout-effect";
import type { PartialOptions } from "overlayscrollbars";
import { type CSSProperties, type RefObject, useCallback, useMemo, useState } from "react";

type ScrollRootRef = RefObject<{ getElement?: () => HTMLElement | null } | null>;

const DATA_GRID_SCROLLBAR_CLASS = "rap-data-grid-scrollbar";

export function useDataGridScrollbars({
  headerRef,
  scrollRootRef,
}: {
  headerRef: RefObject<HTMLElement | null>;
  scrollRootRef: ScrollRootRef;
}) {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [theme, setTheme] = useState("os-theme-dark");

  const updateScrollbarTheme = useCallback(() => {
    const root = scrollRootRef.current?.getElement?.() ?? document.documentElement;
    const computedStyle = getComputedStyle(root);
    const colorScheme =
      computedStyle.colorScheme || getComputedStyle(document.documentElement).colorScheme;

    setTheme(getIsDarkColorScheme(colorScheme) ? "os-theme-light" : "os-theme-dark");
  }, [scrollRootRef]);

  useIsomorphicLayoutEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const updateHeaderHeight = () => setHeaderHeight(header.getBoundingClientRect().height);
    updateHeaderHeight();

    const observer = new ResizeObserver(updateHeaderHeight);
    observer.observe(header);

    return () => observer.disconnect();
  }, [headerRef]);

  useIsomorphicLayoutEffect(() => {
    updateScrollbarTheme();

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", updateScrollbarTheme);

    const observer = new MutationObserver(updateScrollbarTheme);
    observer.observe(document.documentElement, {
      attributeFilter: ["class", "style", "data-theme", "data-color-scheme"],
      attributes: true,
    });

    return () => {
      media.removeEventListener("change", updateScrollbarTheme);
      observer.disconnect();
    };
  }, [updateScrollbarTheme]);

  const options = useMemo<PartialOptions>(
    () => ({
      scrollbars: { theme: `${DATA_GRID_SCROLLBAR_CLASS} ${theme}` },
    }),
    [theme]
  );

  return {
    headerHeight,
    options,
    updateScrollbarTheme,
    className:
      "[&_.os-scrollbar-vertical]:!top-[var(--rap-data-grid-scrollbar-top)] [&_.os-scrollbar-vertical]:!bottom-0",
    style: {
      "--rap-data-grid-scrollbar-top": `${headerHeight}px`,
      "--rap-data-grid-os-handle-bg": "var(--scrollbar-thumb)",
      "--rap-data-grid-os-handle-bg-hover":
        "color-mix(in oklab, var(--scrollbar-thumb) 82%, var(--foreground))",
      "--rap-data-grid-os-handle-bg-active":
        "color-mix(in oklab, var(--scrollbar-thumb) 68%, var(--foreground))",
    } as CSSProperties,
  };
}

function getIsDarkColorScheme(colorScheme: string) {
  const normalized = colorScheme.trim().toLowerCase();

  if (normalized.startsWith("dark")) return true;
  if (normalized.startsWith("light")) return false;

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
