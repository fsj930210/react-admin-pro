"use client";

import * as React from "react";

import { cn } from "@rap/utils";

type WatermarkContent = string | string[];

interface WatermarkFont {
  color?: string;
  fontFamily?: string;
  fontSize?: number;
  fontStyle?: React.CSSProperties["fontStyle"];
  fontWeight?: React.CSSProperties["fontWeight"];
}

type WatermarkTamperType = "removed" | "style";

interface WatermarkTamperEvent {
  type: WatermarkTamperType;
  target: HTMLElement;
}

interface WatermarkGuardOptions {
  enabled?: boolean;
  observeRemoval?: boolean;
  observeStyle?: boolean;
  restore?: boolean;
  interval?: number;
  maxRestoreCount?: number;
  onTamper?: (event: WatermarkTamperEvent) => void;
}

interface WatermarkProps extends Omit<React.ComponentProps<"div">, "content"> {
  content?: WatermarkContent;
  image?: string;
  imageCrossOrigin?: HTMLImageElement["crossOrigin"];
  font?: WatermarkFont;
  width?: number;
  height?: number;
  rotate?: number;
  zIndex?: number;
  gap?: [number, number];
  offset?: [number, number];
  opacity?: number;
  fullscreen?: boolean;
  guard?: boolean | WatermarkGuardOptions;
  pointerEvents?: React.CSSProperties["pointerEvents"];
}

const DEFAULT_CONTENT = "";
const DEFAULT_FONT: Required<WatermarkFont> = {
  color: "rgba(0, 0, 0, 0.15)",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  fontSize: 16,
  fontStyle: "normal",
  fontWeight: "normal",
};
const DEFAULT_GAP: [number, number] = [100, 100];
const DEFAULT_OFFSET: [number, number] = [0, 0];

function getGuardOptions(guard: WatermarkProps["guard"]): Required<WatermarkGuardOptions> {
  if (guard === false) {
    return {
      enabled: false,
      observeRemoval: false,
      observeStyle: false,
      restore: false,
      interval: 0,
      maxRestoreCount: 0,
      onTamper: () => {},
    };
  }

  const options = typeof guard === "object" ? guard : {};

  return {
    enabled: options.enabled ?? true,
    observeRemoval: options.observeRemoval ?? true,
    observeStyle: options.observeStyle ?? true,
    restore: options.restore ?? true,
    interval: options.interval ?? 1000,
    maxRestoreCount: options.maxRestoreCount ?? 20,
    onTamper: options.onTamper ?? (() => {}),
  };
}

function getContentLines(content: WatermarkContent | undefined) {
  if (Array.isArray(content)) return content.filter(Boolean);
  return content ? [content] : [];
}

function loadImage(src: string, crossOrigin?: HTMLImageElement["crossOrigin"]) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();

    if (crossOrigin !== undefined) {
      img.crossOrigin = crossOrigin;
    }

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load watermark image: ${src}`));
    img.src = src;
  });
}

async function createWatermarkDataUrl(options: {
  content?: WatermarkContent;
  image?: string;
  imageCrossOrigin?: HTMLImageElement["crossOrigin"];
  font?: WatermarkFont;
  width: number;
  height: number;
  rotate: number;
  gap: [number, number];
  opacity: number;
}) {
  const {
    content = DEFAULT_CONTENT,
    image,
    imageCrossOrigin,
    font,
    width,
    height,
    rotate,
    gap,
    opacity,
  } = options;

  const canvas = document.createElement("canvas");
  const ratio = window.devicePixelRatio || 1;
  const tileWidth = width + gap[0];
  const tileHeight = height + gap[1];

  canvas.width = tileWidth * ratio;
  canvas.height = tileHeight * ratio;
  canvas.style.width = `${tileWidth}px`;
  canvas.style.height = `${tileHeight}px`;

  const ctx = canvas.getContext("2d");

  if (!ctx) return "";

  ctx.scale(ratio, ratio);
  ctx.clearRect(0, 0, tileWidth, tileHeight);
  ctx.globalAlpha = opacity;
  ctx.translate(width / 2, height / 2);
  ctx.rotate((Math.PI / 180) * rotate);

  if (image) {
    const img = await loadImage(image, imageCrossOrigin);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);
  } else {
    const mergedFont = { ...DEFAULT_FONT, ...font };
    const lines = getContentLines(content);
    const lineHeight = Math.round(mergedFont.fontSize * 1.5);
    const startY = -((lines.length - 1) * lineHeight) / 2;

    ctx.fillStyle = mergedFont.color;
    ctx.font = `${mergedFont.fontStyle} ${mergedFont.fontWeight} ${mergedFont.fontSize}px ${mergedFont.fontFamily}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    lines.forEach((line, index) => {
      ctx.fillText(line, 0, startY + index * lineHeight);
    });
  }

  return canvas.toDataURL("image/png");
}

function isWatermarkStyleChanged(
  element: HTMLElement,
  expectedZIndex: number,
  expectedPointerEvents: React.CSSProperties["pointerEvents"]
) {
  const style = window.getComputedStyle(element);

  return (
    style.display === "none" ||
    style.visibility === "hidden" ||
    Number(style.opacity) === 0 ||
    style.backgroundImage === "none" ||
    style.pointerEvents !== expectedPointerEvents ||
    Number(style.zIndex) !== expectedZIndex
  );
}

function Watermark(props: WatermarkProps) {
  const {
    children,
    className,
    style,
    content,
    image,
    imageCrossOrigin,
    font,
    width = 120,
    height = 64,
    rotate = -22,
    zIndex = 9999,
    gap = DEFAULT_GAP,
    offset = DEFAULT_OFFSET,
    opacity = 1,
    fullscreen = false,
    guard = true,
    pointerEvents = "none",
    ref,
    ...rootProps
  } = props;

  const rootRef = React.useRef<HTMLDivElement>(null);
  const watermarkRef = React.useRef<HTMLDivElement>(null);
  const restoreCountRef = React.useRef(0);
  const [backgroundImage, setBackgroundImage] = React.useState("");
  const guardOptions = React.useMemo(() => getGuardOptions(guard), [guard]);

  React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

  React.useEffect(() => {
    let cancelled = false;

    createWatermarkDataUrl({
      content,
      image,
      imageCrossOrigin,
      font,
      width,
      height,
      rotate,
      gap,
      opacity,
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setBackgroundImage(dataUrl ? `url("${dataUrl}")` : "");
        }
      })
      .catch(() => {
        if (!cancelled) setBackgroundImage("");
      });

    return () => {
      cancelled = true;
    };
  }, [content, image, imageCrossOrigin, font, width, height, rotate, gap, opacity]);

  const watermarkStyle = React.useMemo<React.CSSProperties>(
    () => ({
      position: fullscreen ? "fixed" : "absolute",
      inset: 0,
      zIndex,
      pointerEvents,
      backgroundImage,
      backgroundRepeat: "repeat",
      backgroundSize: `${width + gap[0]}px ${height + gap[1]}px`,
      backgroundPosition: `${offset[0]}px ${offset[1]}px`,
    }),
    [backgroundImage, fullscreen, gap, height, offset, pointerEvents, width, zIndex]
  );

  const restoreWatermarkStyle = React.useCallback(
    (element: HTMLElement) => {
      Object.assign(element.style, watermarkStyle);
    },
    [watermarkStyle]
  );

  const repairWatermark = React.useCallback(
    (type: WatermarkTamperType, target: HTMLElement) => {
      guardOptions.onTamper({ type, target });

      if (!guardOptions.restore) return;
      if (restoreCountRef.current >= guardOptions.maxRestoreCount) return;

      const root = rootRef.current;
      const watermark = watermarkRef.current;

      if (!root || !watermark) return;

      restoreCountRef.current += 1;

      if (!root.contains(watermark)) {
        root.appendChild(watermark);
      }

      restoreWatermarkStyle(watermark);
    },
    [guardOptions, restoreWatermarkStyle]
  );

  React.useEffect(() => {
    if (!guardOptions.enabled || typeof MutationObserver === "undefined") return;

    const root = rootRef.current;
    const watermark = watermarkRef.current;
    const parent = root?.parentElement;

    if (!root || !watermark) return;

    const removalTarget = fullscreen && parent ? parent : root;
    const removalObserver = new MutationObserver(() => {
      if (!guardOptions.observeRemoval) return;
      if (!removalTarget.contains(watermark)) {
        repairWatermark("removed", removalTarget);
      }
    });

    const styleObserver = new MutationObserver(() => {
      if (!guardOptions.observeStyle) return;
      if (isWatermarkStyleChanged(watermark, zIndex, pointerEvents)) {
        repairWatermark("style", watermark);
      }
    });

    removalObserver.observe(removalTarget, { childList: true, subtree: true });
    styleObserver.observe(watermark, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    return () => {
      removalObserver.disconnect();
      styleObserver.disconnect();
    };
  }, [fullscreen, guardOptions, pointerEvents, repairWatermark, zIndex]);

  React.useEffect(() => {
    if (!guardOptions.enabled || !guardOptions.interval) return;

    const intervalId = window.setInterval(() => {
      const root = rootRef.current;
      const watermark = watermarkRef.current;

      if (!root || !watermark) return;

      if (!root.contains(watermark)) {
        repairWatermark("removed", root);
        return;
      }

      if (guardOptions.observeStyle && isWatermarkStyleChanged(watermark, zIndex, pointerEvents)) {
        repairWatermark("style", watermark);
      }
    }, guardOptions.interval);

    return () => window.clearInterval(intervalId);
  }, [guardOptions, pointerEvents, repairWatermark, zIndex]);

  return (
    <div
      data-slot="watermark"
      {...rootProps}
      ref={rootRef}
      className={cn(!fullscreen && "relative", className)}
      style={style}
    >
      {children}
      <div
        ref={watermarkRef}
        aria-hidden="true"
        data-slot="watermark-layer"
        style={watermarkStyle}
      />
    </div>
  );
}

export {
  type WatermarkFont,
  type WatermarkGuardOptions,
  type WatermarkProps,
  type WatermarkTamperEvent,
  Watermark,
};
