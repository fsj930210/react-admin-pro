"use client";

import * as React from "react";
import { Slot as SlotPrimitive } from "radix-ui";

import { useIsomorphicLayoutEffect } from "@rap/hooks/use-isomorphic-layout-effect";
import { cn, useComposedRefs } from "@rap/utils";

type GapValue = number | { column?: number; row?: number };

interface ImageCardGridLayout {
  columns: number;
  itemWidth: number;
}

interface ImageCardGridProps extends React.ComponentProps<"div"> {
  itemWidth?: number;
  minItemWidth?: number;
  maxItemWidth?: number;
  maxColumns?: number;
  gap?: GapValue;
  contentHeight?: number;
  imageRatio?: number;
  imageFit?: React.CSSProperties["objectFit"];
  asChild?: boolean;
}

interface ImageCardGridItemProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

interface ImageCardGridImageProps extends Omit<React.ComponentProps<"img">, "children"> {
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  fit?: React.CSSProperties["objectFit"];
  ratio?: number;
}

interface ImageCardGridContentProps extends React.ComponentProps<"div"> {
  asChild?: boolean;
}

type ImageCardGridStyle = React.CSSProperties & {
  "--image-card-grid-column-gap"?: string;
  "--image-card-grid-row-gap"?: string;
  "--image-card-grid-item-width"?: string;
  "--image-card-grid-min-item-width"?: string;
  "--image-card-grid-max-item-width"?: string;
  "--image-card-grid-content-height"?: string;
  "--image-card-grid-image-ratio"?: number;
  "--image-card-grid-image-fit"?: React.CSSProperties["objectFit"];
};

const DEFAULT_ITEM_WIDTH = 240;
const DEFAULT_GAP = 16;
const DEFAULT_CONTENT_HEIGHT = 72;
const DEFAULT_IMAGE_RATIO = 4 / 3;
const DEFAULT_IMAGE_FIT: React.CSSProperties["objectFit"] = "contain";
const MAX_AUTO_ITEM_WIDTH = 360;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function roundPixel(value: number) {
  return Math.round(value * 1000) / 1000;
}

function normalizePositiveNumber(value: number | undefined, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function normalizeGap(gap: GapValue | undefined) {
  if (typeof gap === "number") {
    const value = Math.max(0, gap);
    return { column: value, row: value };
  }

  return {
    column: Math.max(0, gap?.column ?? DEFAULT_GAP),
    row: Math.max(0, gap?.row ?? gap?.column ?? DEFAULT_GAP),
  };
}

function getAutoItemRange(itemWidth: number) {
  const minRatio = itemWidth <= 120 ? 0.85 : itemWidth <= 240 ? 0.85 : 0.9;
  const maxRatio = itemWidth <= 120 ? 1.35 : itemWidth <= 240 ? 1.25 : 1.18;

  return {
    min: clamp(Math.round(itemWidth * minRatio), 80, itemWidth),
    max: Math.min(Math.max(itemWidth, Math.round(itemWidth * maxRatio)), MAX_AUTO_ITEM_WIDTH),
  };
}

function getItemRange(itemWidth: number, minItemWidth?: number, maxItemWidth?: number) {
  const autoRange = getAutoItemRange(itemWidth);
  const min = normalizePositiveNumber(minItemWidth, autoRange.min);
  const max = Math.max(min, normalizePositiveNumber(maxItemWidth, autoRange.max));

  return { min, max };
}

function computeGridLayout(
  containerWidth: number,
  preferredWidth: number,
  minWidth: number,
  maxWidth: number,
  columnGap: number,
  maxColumns?: number
): ImageCardGridLayout {
  if (containerWidth <= 0) {
    return { columns: 1, itemWidth: preferredWidth };
  }

  const maxPossibleColumns = Math.max(
    1,
    Math.floor((containerWidth + columnGap) / (minWidth + columnGap))
  );
  const cappedMaxColumns =
    typeof maxColumns === "number" && maxColumns > 0
      ? Math.min(maxPossibleColumns, Math.floor(maxColumns))
      : maxPossibleColumns;
  const minPossibleColumns = Math.max(
    1,
    Math.ceil((containerWidth + columnGap) / (maxWidth + columnGap))
  );

  if (minPossibleColumns > cappedMaxColumns) {
    const itemWidth = (containerWidth - columnGap * (cappedMaxColumns - 1)) / cappedMaxColumns;
    return {
      columns: cappedMaxColumns,
      itemWidth: roundPixel(Math.max(0, itemWidth)),
    };
  }

  const from = Math.min(minPossibleColumns, cappedMaxColumns);
  const to = Math.max(minPossibleColumns, cappedMaxColumns);
  let bestColumns = from;
  let bestWidth = (containerWidth - columnGap * (bestColumns - 1)) / bestColumns;
  let bestDistance = Math.abs(bestWidth - preferredWidth);

  for (let columns = from + 1; columns <= to; columns++) {
    const itemWidth = (containerWidth - columnGap * (columns - 1)) / columns;
    const distance = Math.abs(itemWidth - preferredWidth);

    if (distance < bestDistance || (distance === bestDistance && itemWidth <= preferredWidth)) {
      bestColumns = columns;
      bestWidth = itemWidth;
      bestDistance = distance;
    }
  }

  return {
    columns: bestColumns,
    itemWidth: roundPixel(Math.max(0, bestWidth)),
  };
}

function useElementWidth<T extends HTMLElement>() {
  const [node, setNode] = React.useState<T | null>(null);
  const [width, setWidth] = React.useState(0);

  useIsomorphicLayoutEffect(() => {
    if (!node) return;

    let frameId: number | null = null;
    const updateWidth = (nextWidth: number) => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        setWidth((currentWidth) =>
          Math.abs(currentWidth - nextWidth) > 0.5 ? nextWidth : currentWidth
        );
      });
    };

    updateWidth(node.getBoundingClientRect().width);

    if (typeof ResizeObserver === "undefined") {
      return () => {
        if (frameId !== null) cancelAnimationFrame(frameId);
      };
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      updateWidth(entry.contentRect.width);
    });

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [node]);

  return [setNode, width] as const;
}

function ImageCardGrid(props: ImageCardGridProps) {
  const {
    itemWidth: itemWidthProp = DEFAULT_ITEM_WIDTH,
    minItemWidth,
    maxItemWidth,
    maxColumns,
    gap,
    contentHeight = DEFAULT_CONTENT_HEIGHT,
    imageRatio = DEFAULT_IMAGE_RATIO,
    imageFit = DEFAULT_IMAGE_FIT,
    asChild,
    className,
    style,
    ref,
    ...rootProps
  } = props;

  const itemWidth = normalizePositiveNumber(itemWidthProp, DEFAULT_ITEM_WIDTH);
  const { min, max } = getItemRange(itemWidth, minItemWidth, maxItemWidth);
  const gapValue = normalizeGap(gap);
  const [measureRef, containerWidth] = useElementWidth<HTMLDivElement>();
  const composedRef = useComposedRefs(ref, measureRef);
  const layout = React.useMemo(
    () => computeGridLayout(containerWidth, itemWidth, min, max, gapValue.column, maxColumns),
    [containerWidth, itemWidth, min, max, gapValue.column, maxColumns]
  );

  const gridStyle: ImageCardGridStyle = {
    "--image-card-grid-column-gap": `${gapValue.column}px`,
    "--image-card-grid-row-gap": `${gapValue.row}px`,
    "--image-card-grid-item-width": `${layout.itemWidth}px`,
    "--image-card-grid-min-item-width": `${min}px`,
    "--image-card-grid-max-item-width": `${max}px`,
    "--image-card-grid-content-height": `${Math.max(0, contentHeight)}px`,
    "--image-card-grid-image-ratio": normalizePositiveNumber(imageRatio, DEFAULT_IMAGE_RATIO),
    "--image-card-grid-image-fit": imageFit,
    gridTemplateColumns: containerWidth
      ? `repeat(${layout.columns}, minmax(0, var(--image-card-grid-item-width)))`
      : `repeat(auto-fill, minmax(var(--image-card-grid-min-item-width), 1fr))`,
    columnGap: "var(--image-card-grid-column-gap)",
    rowGap: "var(--image-card-grid-row-gap)",
    ...style,
  };

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <RootPrimitive
      data-slot="image-card-grid"
      className={cn("grid w-full", className)}
      style={gridStyle}
      ref={composedRef}
      {...rootProps}
    />
  );
}

function ImageCardGridItem(props: ImageCardGridItemProps) {
  const { asChild, className, ...itemProps } = props;
  const ItemPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ItemPrimitive
      data-slot="image-card-grid-item"
      className={cn(
        "grid min-w-0 overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm",
        "grid-rows-[auto_var(--image-card-grid-content-height)]",
        className
      )}
      {...itemProps}
    />
  );
}

function ImageCardGridImage(props: ImageCardGridImageProps) {
  const {
    wrapperClassName,
    wrapperStyle,
    className,
    fit,
    ratio,
    alt = "",
    style,
    ...imageProps
  } = props;

  const imageWrapperStyle: ImageCardGridStyle = {
    "--image-card-grid-image-ratio": ratio,
    "--image-card-grid-image-fit": fit,
    aspectRatio: "var(--image-card-grid-image-ratio)",
    ...wrapperStyle,
  };

  return (
    <div
      data-slot="image-card-grid-image-wrapper"
      className={cn("min-w-0 overflow-hidden bg-muted", wrapperClassName)}
      style={imageWrapperStyle}
    >
      <img
        data-slot="image-card-grid-image"
        className={cn("h-full w-full", className)}
        style={{
          objectFit: "var(--image-card-grid-image-fit)" as React.CSSProperties["objectFit"],
          ...style,
        }}
        alt={alt}
        {...imageProps}
      />
    </div>
  );
}

function ImageCardGridContent(props: ImageCardGridContentProps) {
  const { asChild, className, ...contentProps } = props;
  const ContentPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <ContentPrimitive
      data-slot="image-card-grid-content"
      className={cn("min-w-0 overflow-hidden p-3 text-sm", className)}
      {...contentProps}
    />
  );
}

export {
  ImageCardGrid,
  ImageCardGridItem,
  ImageCardGridImage,
  ImageCardGridContent,
  type ImageCardGridProps,
  type ImageCardGridItemProps,
  type ImageCardGridImageProps,
  type ImageCardGridContentProps,
};
