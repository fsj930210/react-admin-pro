import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@rap/components-ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@rap/components-ui/popover";
import { ProButton, type ProButtonProps } from "../button";

export interface ConfirmActionProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  type?: "dialog" | "popover";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  closeOnConfirm?: boolean;
  children: React.ReactNode | ((ctx: { open: () => void }) => React.ReactNode);
}

export function ConfirmAction({
  title = "确认操作？",
  description,
  okText = "确定",
  cancelText = "取消",
  type = "popover",
  open,
  defaultOpen,
  onOpenChange,
  onConfirm,
  onCancel,
  closeOnConfirm = true,
  children,
}: ConfirmActionProps) {
  const isControlled = open !== undefined;
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen ?? false);
  const [loading, setLoading] = React.useState(false);
  const currentOpen = isControlled ? open : innerOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInnerOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm?.();
      if (closeOnConfirm) setOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const trigger =
    typeof children === "function" ? children({ open: () => setOpen(true) }) : children;

  if (type === "dialog") {
    return (
      <Dialog open={currentOpen} onOpenChange={setOpen}>
        {typeof children === "function" ? (
          trigger
        ) : (
          <button type="button" onClick={() => setOpen(true)} className="contents">
            {trigger}
          </button>
        )}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description ? <DialogDescription>{description}</DialogDescription> : null}
          </DialogHeader>
          <DialogFooter>
            <ProButton
              variant="outline"
              onClick={() => {
                onCancel?.();
                setOpen(false);
              }}
            >
              {cancelText}
            </ProButton>
            <ProButton loading={loading} onClick={handleConfirm}>
              {okText}
            </ProButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Popover open={currentOpen} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger as React.ReactElement}</PopoverTrigger>
      <PopoverContent className="w-72">
        <div className="space-y-3">
          <div>
            <div className="font-medium text-sm">{title}</div>
            {description ? (
              <div className="mt-1 text-muted-foreground text-xs">{description}</div>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <ProButton
              size="sm"
              variant="outline"
              onClick={() => {
                onCancel?.();
                setOpen(false);
              }}
            >
              {cancelText}
            </ProButton>
            <ProButton size="sm" loading={loading} onClick={handleConfirm}>
              {okText}
            </ProButton>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export interface ConfirmButtonProps extends Omit<ProButtonProps, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  confirmType?: "dialog" | "popover";
  onConfirm?: () => void | Promise<void>;
}

export function ConfirmButton({
  title,
  description,
  okText,
  cancelText,
  confirmType,
  onConfirm,
  ...buttonProps
}: ConfirmButtonProps) {
  return (
    <ConfirmAction
      title={title}
      description={description}
      okText={okText}
      cancelText={cancelText}
      type={confirmType}
      onConfirm={onConfirm}
    >
      <ProButton {...buttonProps} />
    </ConfirmAction>
  );
}

export interface BatchActionBarProps extends React.ComponentProps<"div"> {
  selectedCount?: number;
  children?: React.ReactNode;
}

export function BatchActionBar({
  selectedCount = 0,
  children,
  className,
  ...props
}: BatchActionBarProps) {
  if (selectedCount <= 0) return null;
  return (
    <div
      className={[
        "flex items-center justify-between gap-3 rounded-md border bg-muted/40 px-3 py-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <span className="text-muted-foreground text-sm">已选择 {selectedCount} 项</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
