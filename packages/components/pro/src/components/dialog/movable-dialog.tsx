import { Button } from "@rap/components-ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@rap/components-ui/dialog";
import { useMove, type MoveOptions } from "@rap/hooks/use-move";
import { cn } from "@rap/utils";
import type { ComponentProps } from "react";
import { renderDialogTrigger, useBasicDialog } from "./basic-dialog";

export interface MovableDialogProps {
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
  moveOptions?: MoveOptions<HTMLDivElement>;
  contentProps?: React.ComponentProps<typeof DialogContent>;
  headerProps?: React.ComponentProps<typeof DialogHeader>;
  footerProps?: React.ComponentProps<typeof DialogFooter>;
}

export function MovableDialog({
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
  moveOptions,
  contentProps,
  headerProps,
  footerProps,
}: MovableDialogProps) {
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
  const { targetRef, handleRef, transform, isMoving, reset } = useMove<
    HTMLDivElement,
    HTMLDivElement
  >({
    bounds: "viewport",
    boundaryMode: "keep-handle-visible",
    ...moveOptions,
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
        className={cn(isMoving && "transition-none! duration-0!", contentProps?.className)}
        style={{
          ...contentProps?.style,
          width: contentProps?.style?.width ?? width,
          maxWidth: contentProps?.style?.maxWidth ?? (width ? "none" : undefined),
          translate: "none",
          transform: `translate(-50%, -50%) ${transform}`,
          willChange: isMoving ? "transform" : contentProps?.style?.willChange,
        }}
      >
        <DialogHeader
          {...headerProps}
          ref={handleRef}
          className={cn(
            "-mx-6 -mt-6 border-b px-6 py-4 select-none cursor-move touch-none",
            headerProps?.className
          )}
        >
          {header}
        </DialogHeader>
        {children}
        {dialog.renderFooter()}
      </DialogContent>
    </Dialog>
  );
}
