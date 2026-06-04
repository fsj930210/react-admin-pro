import { Button } from "@rap/components-ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@rap/components-ui/dialog";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@rap/components-ui/hover-card";
import { useMinimax, type MinimaxOptions, MinimaxState } from "@rap/hooks/use-minimax";
import { useMove, type MoveOptions } from "@rap/hooks/use-move";
import { cn } from "@rap/utils";
import { Maximize2, Minimize2, Minus, Square, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";

export interface MinimaxDialogProps {
  children: React.ReactNode;
  triggerChildren?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  dialogProps?: React.ComponentProps<typeof Dialog>;
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

function MinimizedBar({
  draggable,
  render,
  className,
  style,
  moveOptions,
  onRestore,
  onMaximize,
  onClose,
  initialPosition,
  title,
  preview,
}: {
  draggable: boolean;
  render?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  moveOptions?: MoveOptions<HTMLDivElement>;
  initialPosition?: { right: number; bottom: number };
  onRestore?: () => void;
  onMaximize?: () => void;
  onClose?: () => void;
  title?: React.ReactNode;
  preview?: React.ReactNode;
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

export function MinimaxDialog({
  children,
  triggerChildren,
  header,
  footer,
  dialogProps,
  minimaxOptions,
  contentProps,
  headerProps,
  footerProps,
  actions,
  minimizedBar,
}: MinimaxDialogProps) {
  const [open, setOpen] = useState(false);
  const [isMinimizing, setIsMinimizing] = useState(false);
  const minimizeTimerRef = useRef<number | null>(null);

  const {
    close: showClose = true,
    minimize: showMinimize = true,
    maximize: showMaximize = true,
    render: actionRender = {},
  } = actions || {};

  const {
    draggable: minimizeBarDraggable = true,
    render: minimizeBarRender,
    className: minimizeBarClassName = "",
    style: minimizeBarStyle,
    moveOptions: minimizeBarMoveOptions,
    initialPosition: minimizeBarInitialPosition,
  } = minimizedBar || {};

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
  } = useMinimax({
    ...minimaxOptions,
    onStateChange: (next, previous) => {
      minimaxOptions?.onStateChange?.(next, previous);
    },
  });

  const handleCloseClick = () => {
    if (minimizeTimerRef.current !== null) {
      window.clearTimeout(minimizeTimerRef.current);
      minimizeTimerRef.current = null;
    }
    setIsMinimizing(false);
    setOpen(false);
    if (state !== MinimaxState.NORMAL) restore();
    close();
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (minimizeTimerRef.current !== null) {
      window.clearTimeout(minimizeTimerRef.current);
      minimizeTimerRef.current = null;
    }
    setIsMinimizing(false);
    setOpen(nextOpen);
    if (!nextOpen && state !== MinimaxState.NORMAL) restore();
    dialogProps?.onOpenChange?.(nextOpen);
  };

  const handleMinimize = () => {
    setIsMinimizing(true);
    minimizeTimerRef.current = window.setTimeout(() => {
      minimizeTimerRef.current = null;
      setIsMinimizing(false);
      minimize();
    }, 160);
  };

  const handleMinimizedRestore = () => {
    setIsMinimizing(false);
    if (previousState === MinimaxState.MAXIMIZED) {
      void maximize();
    } else {
      restore();
    }
  };

  const handleMinimizedMaximize = () => {
    setIsMinimizing(false);
    void maximize();
  };

  useEffect(() => {
    return () => {
      if (minimizeTimerRef.current !== null) {
        window.clearTimeout(minimizeTimerRef.current);
      }
    };
  }, []);

  const hasActions = showClose || showMinimize || showMaximize;

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

  const previewContent = <div className="w-[480px] p-4 text-sm leading-relaxed">{children}</div>;

  return (
    <>
      <Dialog modal={false} {...dialogProps} open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>{triggerChildren}</DialogTrigger>
        {!isMinimized && (
          <DialogContent
            {...contentProps}
            overlay={false}
            className={cn(
              "w-[min(720px,calc(100vw-2rem))]! max-w-none! max-h-none! duration-0! data-[state=open]:fade-in-100! data-[state=open]:zoom-in-100! data-[state=closed]:fade-out-100! data-[state=closed]:zoom-out-100! transition-[width,height,top,left,transform,border-radius,opacity] ease-out",
              isMaximized &&
                "top-0 left-0 h-screen! w-screen! translate-x-0! translate-y-0! rounded-none",
              isMaximized ? "duration-300" : "duration-200",
              isMinimizing && "scale-90 opacity-0 pointer-events-none",
              contentProps?.className
            )}
            style={{
              ...contentProps?.style,
              maxWidth: contentProps?.style?.maxWidth ?? "none",
              maxHeight: contentProps?.style?.maxHeight ?? "none",
            }}
          >
            <DialogHeader {...headerProps}>{header}</DialogHeader>
            {children}
            {footer && <DialogFooter {...footerProps}>{footer}</DialogFooter>}
            {renderActions()}
          </DialogContent>
        )}
      </Dialog>
      {isMinimized &&
        ReactDOM.createPortal(
          <MinimizedBar
            draggable={minimizeBarDraggable}
            render={minimizeBarRender}
            className={minimizeBarClassName}
            style={minimizeBarStyle}
            moveOptions={minimizeBarMoveOptions}
            initialPosition={minimizeBarInitialPosition}
            title={typeof header === "string" ? header : "Dialog"}
            preview={previewContent}
            onRestore={handleMinimizedRestore}
            onMaximize={handleMinimizedMaximize}
            onClose={handleCloseClick}
          />,
          document.body
        )}
    </>
  );
}
