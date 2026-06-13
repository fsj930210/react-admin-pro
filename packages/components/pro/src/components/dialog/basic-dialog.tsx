import { Button } from "@rap/components-ui/button";
import {
  Dialog as BaseDialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@rap/components-ui/dialog";
import { useControllableState } from "@rap/hooks/use-controllable-state";
import { cn } from "@rap/utils";
import {
  isValidElement,
  useState,
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
} from "react";

export interface BasicDialogProps {
  children: ReactNode;
  triggerChildren?: ReactNode;
  header?: ReactNode;
  footer?: ReactNode | null;
  width?: CSSProperties["width"];
  okText?: ReactNode;
  cancelText?: ReactNode;
  okButtonProps?: ComponentProps<typeof Button>;
  cancelButtonProps?: ComponentProps<typeof Button>;
  confirmLoading?: boolean;
  onOk?: () => boolean | void | Promise<boolean | void>;
  onCancel?: () => void;
  dialogProps?: ComponentProps<typeof BaseDialog>;
  contentProps?: ComponentProps<typeof DialogContent>;
  headerProps?: ComponentProps<typeof DialogHeader>;
  footerProps?: ComponentProps<typeof DialogFooter>;
}

export interface UseBasicDialogOptions
  extends Pick<
    BasicDialogProps,
    | "dialogProps"
    | "footer"
    | "okText"
    | "cancelText"
    | "okButtonProps"
    | "cancelButtonProps"
    | "confirmLoading"
    | "onOk"
    | "onCancel"
    | "footerProps"
  > {
  afterClose?: () => void;
}

export function renderDialogTrigger(triggerChildren?: ReactNode) {
  if (isValidElement(triggerChildren)) {
    return <DialogTrigger asChild>{triggerChildren}</DialogTrigger>;
  }

  return (
    <DialogTrigger asChild>
      <Button type="button">{triggerChildren || "Open Dialog"}</Button>
    </DialogTrigger>
  );
}

export function useBasicDialog({
  dialogProps,
  footer,
  okText = "确定",
  cancelText = "取消",
  okButtonProps,
  cancelButtonProps,
  confirmLoading,
  onOk,
  onCancel,
  footerProps,
  afterClose,
}: UseBasicDialogOptions) {
  const [open, setOpen] = useControllableState<boolean>(dialogProps, {
    defaultValue: false,
    valuePropName: "open",
    defaultValuePropName: "defaultOpen",
    trigger: "onOpenChange",
  });
  const [innerConfirmLoading, setInnerConfirmLoading] = useState(false);
  const loading = confirmLoading ?? innerConfirmLoading;

  const close = () => {
    setOpen(false);
    afterClose?.();
  };

  const handleCancel = () => {
    onCancel?.();
    close();
  };

  const handleOk = async () => {
    const result = onOk?.();
    if (result instanceof Promise) {
      setInnerConfirmLoading(true);
      try {
        if ((await result) === false) return;
      } finally {
        setInnerConfirmLoading(false);
      }
    } else if (result === false) {
      return;
    }
    close();
  };

  const renderFooter = () => {
    if (footer === null) return null;
    if (footer !== undefined) {
      return (
        <DialogFooter
          {...footerProps}
          className={cn("-mx-6 -mb-6 border-t px-6 py-4", footerProps?.className)}
        >
          {footer}
        </DialogFooter>
      );
    }

    return (
      <DialogFooter
        {...footerProps}
        className={cn("-mx-6 -mb-6 border-t px-6 py-4", footerProps?.className)}
      >
        <Button type="button" variant="outline" {...cancelButtonProps} onClick={handleCancel}>
          {cancelText}
        </Button>
        <Button
          type="button"
          {...okButtonProps}
          disabled={loading || okButtonProps?.disabled}
          onClick={handleOk}
        >
          {loading ? "确认中..." : okText}
        </Button>
      </DialogFooter>
    );
  };

  return {
    open,
    setOpen,
    close,
    handleCancel,
    handleOk,
    renderFooter,
  };
}

export function BasicDialog({
  children,
  triggerChildren,
  header,
  footer,
  width,
  okText,
  cancelText,
  okButtonProps,
  cancelButtonProps,
  confirmLoading,
  onOk,
  onCancel,
  dialogProps,
  contentProps,
  headerProps,
  footerProps,
}: BasicDialogProps) {
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

  return (
    <BaseDialog {...dialogProps} open={dialog.open} onOpenChange={dialog.setOpen}>
      {renderDialogTrigger(triggerChildren)}
      <DialogContent
        {...contentProps}
        style={{
          ...contentProps?.style,
          width: contentProps?.style?.width ?? width,
          maxWidth: contentProps?.style?.maxWidth ?? (width ? "none" : undefined),
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
      </DialogContent>
    </BaseDialog>
  );
}
