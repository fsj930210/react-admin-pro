import { Button } from "@rap/components-ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@rap/components-ui/dialog";
import { useResize, type ResizeDirection, type ResizeOptions } from "@rap/hooks/use-resize";
import { cn } from "@rap/utils";
import type { ComponentProps } from "react";
import { renderDialogTrigger, useBasicDialog } from "./basic-dialog";

export interface ResizableDialogProps {
  children: React.ReactNode;
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
  dialogProps?: React.ComponentProps<typeof Dialog>;
  resizeOptions?: ResizeOptions<HTMLDivElement>;
  contentProps?: React.ComponentProps<typeof DialogContent>;
  headerProps?: React.ComponentProps<typeof DialogHeader>;
  footerProps?: React.ComponentProps<typeof DialogFooter>;
}

const resizeDirections: ResizeDirection[] = ["n", "s", "w", "e", "nw", "ne", "sw", "se"];

function getHandleClassName(direction: ResizeDirection) {
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

export function ResizableDialog({
  children,
  triggerChildren,
  header,
  footer,
  width,
  okText = "确定",
  cancelText = "取消",
  okButtonProps,
  cancelButtonProps,
  confirmLoading,
  onOk,
  onCancel,
  dialogProps,
  resizeOptions,
  contentProps,
  headerProps,
  footerProps,
}: ResizableDialogProps) {
  const dialog = useBasicDialog({
    dialogProps,
    footer,
    okText,
    cancelText,
    okButtonProps,
    cancelButtonProps,
    confirmLoading,
    onOk,
    onCancel,
    footerProps,
  });
  const {
    targetRef,
    getHandleProps,
    style: resizeStyle,
    isResizing,
    reset,
  } = useResize<HTMLDivElement>({
    bounds: "viewport",
    edgeResize: false,
    minSize: { width: 320, height: 180 },
    ...resizeOptions,
    freezeSizeOnStart: true,
    resizeOrigin: "center",
  });

  const handleContentAnimationEnd: React.AnimationEventHandler<HTMLDivElement> = (event) => {
    contentProps?.onAnimationEnd?.(event);
    if (event.currentTarget.getAttribute("data-state") === "closed") reset();
  };

  return (
    <Dialog {...dialogProps} open={dialog.open} onOpenChange={dialog.setOpen}>
      {renderDialogTrigger(triggerChildren)}
      <DialogContent
        {...contentProps}
        ref={targetRef}
        onAnimationEnd={handleContentAnimationEnd}
        className={cn(
          "max-w-none! max-h-none! duration-0! data-[state=open]:zoom-in-100! data-[state=closed]:zoom-out-100!",
          isResizing && "select-none transition-none! duration-0!",
          contentProps?.className
        )}
        style={{
          ...contentProps?.style,
          translate: "none",
          width: resizeStyle.width ?? contentProps?.style?.width ?? width,
          height: resizeStyle.height ?? contentProps?.style?.height,
          boxSizing: "border-box",
          maxWidth: resizeOptions?.maxSize?.width
            ? `${resizeOptions.maxSize.width}px`
            : (contentProps?.style?.maxWidth ?? (width ? "none" : undefined)),
          maxHeight: resizeOptions?.maxSize?.height
            ? `${resizeOptions.maxSize.height}px`
            : (contentProps?.style?.maxHeight ?? "none"),
          transform: `translate(-50%, -50%) ${resizeStyle.transform}`,
          willChange: isResizing ? "width, height, transform" : contentProps?.style?.willChange,
        }}
      >
        {header && (
          <DialogHeader
            {...headerProps}
            className={cn("-mx-6 -mt-6 border-b px-6 py-4", headerProps?.className)}
          >
            {header}
          </DialogHeader>
        )}
        {children}
        {dialog.renderFooter()}
        {resizeDirections.map((direction) => (
          <div
            key={direction}
            {...getHandleProps(direction)}
            className={getHandleClassName(direction)}
          />
        ))}
      </DialogContent>
    </Dialog>
  );
}
