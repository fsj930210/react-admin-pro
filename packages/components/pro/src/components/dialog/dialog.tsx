import { Button } from "@rap/components-ui/button";
import {
  Dialog as BaseDialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@rap/components-ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@rap/components-ui/hover-card";
import { useMinimax, type MinimaxOptions, MinimaxState } from "@rap/hooks/use-minimax";
import { useMove, type MoveOptions } from "@rap/hooks/use-move";
import { useResize, type ResizeDirection, type ResizeOptions } from "@rap/hooks/use-resize";
import { cn } from "@rap/utils";
import { useComposedRefs } from "@rap/utils/compose-refs";
import { Maximize2, Minimize2, Minus, Square, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ComponentProps,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { renderDialogTrigger, useBasicDialog } from "./basic-dialog";
import * as React from "react";

export interface DialogFeatures {
  movable?: boolean;
  resizable?: boolean;
  minimizable?: boolean;
  maximizable?: boolean;
}

export interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  triggerChildren?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode | null;
  width?: React.CSSProperties["width"];
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  okButtonProps?: ComponentProps<typeof Button>;
  cancelButtonProps?: ComponentProps<typeof Button>;
  confirmLoading?: boolean;
  onOk?: () => boolean | void | Promise<boolean | void>;
  onCancel?: () => void;
  features?: DialogFeatures;
  dialogProps?: React.ComponentProps<typeof BaseDialog>;
  moveOptions?: MoveOptions<HTMLDivElement>;
  resizeOptions?: ResizeOptions<HTMLDivElement>;
  minimaxOptions?: MinimaxOptions;
  contentProps?: React.ComponentProps<typeof DialogContent>;
  headerProps?: React.ComponentProps<typeof DialogHeader>;
  footerProps?: React.ComponentProps<typeof DialogFooter>;
  actions?: {
    close?: boolean;
    minimize?: boolean;
    maximize?: boolean;
    render?: {
      close?: React.ReactNode;
      minimize?: React.ReactNode;
      maximize?: React.ReactNode;
      restore?: React.ReactNode;
    };
  };
  minimizedBar?: {
    draggable?: boolean;
    render?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    moveOptions?: MoveOptions<HTMLDivElement>;
    initialPosition?: { right: number; bottom: number };
  };
}

const resizeDirections: ResizeDirection[] = ["n", "s", "w", "e", "nw", "ne", "sw", "se"];

function getResizeHandleClassName(direction: ResizeDirection) {
  const vertical = direction === "n" || direction === "s";
  const horizontal = direction === "w" || direction === "e";

  return cn(
    "absolute z-10 touch-none select-none bg-transparent",
    direction.includes("n") && "-top-2",
    direction.includes("s") && "-bottom-2",
    direction.includes("w") && "-left-2",
    direction.includes("e") && "-right-2",
    vertical && "left-6 right-6 h-4",
    horizontal && "top-6 bottom-6 w-4",
    direction.length === 2 && "h-8 w-8"
  );
}

function MinimizedBar({
  draggable,
  render,
  className,
  style,
  moveOptions,
  initialPosition,
  title,
  preview,
  maximizable,
  onRestore,
  onMaximize,
  onClose,
}: {
  draggable: boolean;
  render?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  moveOptions?: MoveOptions<HTMLDivElement>;
  initialPosition?: { right: number; bottom: number };
  title?: React.ReactNode;
  preview?: React.ReactNode;
  maximizable: boolean;
  onRestore?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
}) {
  const { targetRef, transform, isDragged } = useMove<HTMLDivElement>({
    bounds: "viewport",
    boundaryMode: "contain",
    ...moveOptions,
    disabled: !draggable,
  });

  const handleRestore = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (isDragged) return;
    onRestore?.();
  };

  return (
    <HoverCard openDelay={150} closeDelay={120}>
      <HoverCardTrigger asChild>
        <div
          ref={targetRef}
          onDoubleClick={handleRestore}
          className={cn(
            "fixed z-999 flex h-10 items-center gap-1 rounded-md border bg-background px-2 shadow-lg animate-in fade-in-0 slide-in-from-bottom-2",
            draggable && "cursor-move touch-none",
            className
          )}
          style={{
            right: initialPosition?.right ?? 40,
            bottom: initialPosition?.bottom ?? 40,
            ...style,
            transform,
          }}
        >
          {render || (
            <>
              <button
                type="button"
                className="max-w-28 truncate px-1 text-left text-xs text-muted-foreground"
                onClick={handleRestore}
              >
                {title || "Dialog"}
              </button>
              <Button
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer"
                onClick={handleRestore}
              >
                <Square />
              </Button>
              {maximizable && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMaximize?.();
                  }}
                >
                  <Maximize2 />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                className="cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation();
                  onClose?.();
                }}
              >
                <X />
              </Button>
            </>
          )}
        </div>
      </HoverCardTrigger>
      {!render && (
        <HoverCardContent
          side="top"
          align="center"
          sideOffset={6}
          className="w-auto overflow-hidden p-0"
        >
          <button
            type="button"
            className="max-h-28 min-h-12 max-w-72 overflow-hidden bg-background"
            onClick={() => onRestore?.()}
          >
            <div className="origin-top-left scale-[0.56] blur-[0.35px]">
              {preview || <div className="h-56 bg-background" />}
            </div>
          </button>
        </HoverCardContent>
      )}
    </HoverCard>
  );
}

export function Dialog({
  children,
  open,
  onOpenChange,
  trigger,
  triggerChildren,
  header,
  footer,
  features,
  dialogProps,
  moveOptions,
  resizeOptions,
  minimaxOptions,
  contentProps,
  headerProps,
  footerProps,
  actions,
  minimizedBar,
  width,
  okText = "确定",
  cancelText = "取消",
  okButtonProps,
  cancelButtonProps,
  confirmLoading,
  onOk,
  onCancel,
}: DialogProps) {
  const {
    movable = true,
    resizable = true,
    minimizable = true,
    maximizable = true,
  } = features || {};
  const [isMinimizing, setIsMinimizing] = useState(false);
  const minimizeTimerRef = useRef<number | null>(null);

  const {
    state,
    previousState,
    isMinimized,
    isMaximized,
    minimize,
    maximize,
    restore,
    close,
    toggleMaximize,
  } = useMinimax(minimaxOptions);

  const mergedDialogProps = { ...dialogProps, open, onOpenChange };
  const dialog = useBasicDialog({
    dialogProps: mergedDialogProps,
    footer,
    okText,
    cancelText,
    okButtonProps,
    cancelButtonProps,
    confirmLoading,
    onOk,
    onCancel,
    footerProps,
    afterClose: close,
  });

  const move = useMove<HTMLDivElement, HTMLDivElement>({
    bounds: "viewport",
    boundaryMode: "keep-handle-visible",
    ...moveOptions,
    disabled: !movable || !header || isMaximized || moveOptions?.disabled,
  });

  const resize = useResize<HTMLDivElement>({
    bounds: "viewport",
    edgeResize: false,
    minSize: { width: 320, height: 180 },
    ...resizeOptions,
    disabled: !resizable || isMaximized || resizeOptions?.disabled,
    freezeSizeOnStart: true,
    resizeOrigin: "center",
  });

  const contentRef = useComposedRefs(contentProps?.ref, move.targetRef, resize.targetRef);
  const headerRef = useComposedRefs(headerProps?.ref, move.handleRef);

  const clearMinimizeTimer = () => {
    if (minimizeTimerRef.current === null) return;
    window.clearTimeout(minimizeTimerRef.current);
    minimizeTimerRef.current = null;
  };

  const resetInteraction = () => {
    clearMinimizeTimer();
    setIsMinimizing(false);
    move.reset();
    resize.reset();
    if (state !== MinimaxState.NORMAL) restore();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) clearMinimizeTimer();
    dialog.setOpen(nextOpen);
  };

  const handleCloseClick = () => {
    dialog.close();
  };

  const handleMinimize = () => {
    if (!minimizable) return;
    setIsMinimizing(true);
    minimizeTimerRef.current = window.setTimeout(() => {
      minimizeTimerRef.current = null;
      setIsMinimizing(false);
      minimize();
    }, 160);
  };

  const handleMinimizedRestore = () => {
    setIsMinimizing(false);
    if (previousState === MinimaxState.MAXIMIZED && maximizable) {
      void maximize();
      return;
    }
    restore();
  };

  const handleMinimizedMaximize = () => {
    if (!maximizable) return;
    setIsMinimizing(false);
    void maximize();
  };

  // 只在卸载时清理最小化延时；依赖来自稳定 ref，不需要跟随渲染更新重复绑定。
  useEffect(
    () => () => {
      clearMinimizeTimer();
    },
    []
  );

  const showClose = actions?.close ?? true;
  const showMinimize = minimizable && (actions?.minimize ?? true);
  const showMaximize = maximizable && (actions?.maximize ?? true);
  const actionRender = actions?.render || {};
  const hasActions = showClose || showMinimize || showMaximize;
  const transform = isMaximized
    ? undefined
    : `translate(-50%, -50%) ${move.transform} ${resize.transform}`;
  const previewContent = <div className="w-[480px] p-4 text-sm leading-relaxed">{children}</div>;

  const renderActions = () => {
    if (!hasActions) return null;
    return (
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {showMinimize && (
          <Button variant="ghost" size="icon-sm" onClick={handleMinimize}>
            {actionRender.minimize || <Minus />}
          </Button>
        )}
        {showMaximize && (
          <Button variant="ghost" size="icon-sm" onClick={toggleMaximize}>
            {isMaximized
              ? actionRender.restore || <Minimize2 />
              : actionRender.maximize || <Maximize2 />}
          </Button>
        )}
        {showClose && (
          <Button variant="ghost" size="icon-sm" onClick={handleCloseClick}>
            {actionRender.close || <X />}
          </Button>
        )}
      </div>
    );
  };

  const handleContentAnimationEnd: React.AnimationEventHandler<HTMLDivElement> = (event) => {
    contentProps?.onAnimationEnd?.(event);
    if (event.currentTarget.getAttribute("data-state") === "closed") {
      resetInteraction();
    }
  };

  return (
    <>
      <BaseDialog modal={false} {...dialogProps} open={dialog.open} onOpenChange={handleOpenChange}>
        {renderDialogTrigger(trigger ?? triggerChildren)}
        {!isMinimized && (
          <DialogContent
            {...contentProps}
            ref={contentRef}
            overlay={false}
            closable={false}
            onAnimationEnd={handleContentAnimationEnd}
            className={cn(
              "max-h-none! duration-0! data-[state=open]:fade-in-100! data-[state=open]:zoom-in-100! data-[state=closed]:fade-out-100! data-[state=closed]:zoom-out-100! transition-[width,height,top,left,transform,border-radius,opacity] ease-out",
              isMaximized &&
                "top-0 left-0 h-screen! w-screen! translate-x-0! translate-y-0! rounded-none",
              isMaximized ? "duration-300" : "duration-200",
              (resize.isResizing || move.isMoving) && "select-none transition-none! duration-0!",
              isMinimizing && "scale-90 opacity-0 pointer-events-none",
              contentProps?.className
            )}
            style={{
              ...contentProps?.style,
              translate: isMaximized ? contentProps?.style?.translate : "none",
              width: isMaximized
                ? undefined
                : (resize.style.width ?? contentProps?.style?.width ?? width),
              height: isMaximized
                ? undefined
                : (resize.style.height ?? contentProps?.style?.height),
              boxSizing: "border-box",
              maxWidth: isMaximized
                ? undefined
                : resizeOptions?.maxSize?.width
                  ? `${resizeOptions.maxSize.width}px`
                  : (contentProps?.style?.maxWidth ?? (resizable || width ? "none" : undefined)),
              maxHeight: isMaximized
                ? undefined
                : resizeOptions?.maxSize?.height
                  ? `${resizeOptions.maxSize.height}px`
                  : (contentProps?.style?.maxHeight ?? "none"),
              transform,
              willChange:
                resize.isResizing || move.isMoving
                  ? "width, height, transform"
                  : contentProps?.style?.willChange,
            }}
          >
            {header && (
              <DialogHeader
                {...headerProps}
                ref={headerRef}
                className={cn(
                  "-mx-6 -mt-6 border-b px-6 py-4",
                  movable && !isMaximized && "select-none cursor-move touch-none",
                  headerProps?.className
                )}
              >
                {header}
              </DialogHeader>
            )}
            {children}
            {dialog.renderFooter()}
            {renderActions()}
            {resizable &&
              !isMaximized &&
              resizeDirections.map((direction) => (
                <div
                  key={direction}
                  {...resize.getHandleProps(direction)}
                  className={getResizeHandleClassName(direction)}
                />
              ))}
          </DialogContent>
        )}
      </BaseDialog>
      {isMinimized &&
        createPortal(
          <MinimizedBar
            draggable={minimizedBar?.draggable ?? true}
            render={minimizedBar?.render}
            className={minimizedBar?.className}
            style={minimizedBar?.style}
            moveOptions={minimizedBar?.moveOptions}
            initialPosition={minimizedBar?.initialPosition}
            title={typeof header === "string" ? header : "Dialog"}
            preview={previewContent}
            maximizable={maximizable}
            onRestore={handleMinimizedRestore}
            onMaximize={handleMinimizedMaximize}
            onClose={handleCloseClick}
          />,
          document.body
        )}
    </>
  );
}
