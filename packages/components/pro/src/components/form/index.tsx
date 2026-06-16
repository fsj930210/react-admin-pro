import * as React from "react";
import { useCallback, useMemo, useState, type ComponentProps, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@rap/components-ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@rap/components-ui/sheet";
import { Label } from "@rap/components-ui/label";
import { ProButton } from "../button";
import { cn } from "@rap/utils";

export type ProFormErrors<TValues> = Partial<Record<keyof TValues | string, React.ReactNode>>;

export interface UseProFormOptions<TValues extends Record<string, any>> {
  values?: TValues;
  defaultValues?: TValues;
  validate?: (
    values: TValues
  ) => ProFormErrors<TValues> | undefined | Promise<ProFormErrors<TValues> | undefined>;
  onSubmit?: (values: TValues) => void | Promise<void>;
  transform?: (values: TValues) => TValues | unknown;
}

export function useProForm<TValues extends Record<string, any> = Record<string, any>>({
  values,
  defaultValues,
  validate,
  transform,
  onSubmit,
}: UseProFormOptions<TValues> = {}) {
  const initial = React.useMemo(() => defaultValues ?? ({} as TValues), [defaultValues]);
  const isControlled = values !== undefined;
  const [innerValues, setInnerValues] = React.useState(initial);
  const [errors, setErrors] = React.useState<ProFormErrors<TValues>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const currentValues = isControlled ? values : innerValues;

  const setValues = React.useCallback(
    (next: Partial<TValues>) => {
      if (!isControlled) setInnerValues((current) => ({ ...current, ...next }));
    },
    [isControlled]
  );

  const setValue = React.useCallback(
    <K extends keyof TValues>(key: K, value: TValues[K]) => {
      setValues({ [key]: value } as unknown as Partial<TValues>);
    },
    [setValues]
  );

  const runValidate = React.useCallback(async () => {
    const next = (await validate?.(currentValues)) ?? {};
    setErrors(next);
    return next;
  }, [currentValues, validate]);

  const submit = React.useCallback(async () => {
    setSubmitting(true);
    try {
      const nextErrors = await runValidate();
      if (Object.values(nextErrors).some(Boolean)) return false;
      await onSubmit?.((transform ? transform(currentValues) : currentValues) as TValues);
      return true;
    } finally {
      setSubmitting(false);
    }
  }, [currentValues, onSubmit, runValidate, transform]);

  const reset = React.useCallback(() => {
    if (!isControlled) setInnerValues(initial);
    setErrors({});
  }, [initial, isControlled]);

  return React.useMemo(
    () => ({
      values: currentValues,
      errors,
      submitting,
      dirty: JSON.stringify(currentValues) !== JSON.stringify(initial),
      setValue,
      setValues,
      setErrors,
      validate: runValidate,
      submit,
      reset,
    }),
    [currentValues, errors, initial, reset, runValidate, setValue, setValues, submit, submitting]
  );
}

export interface ProFormProps extends React.ComponentProps<"form"> {
  form?: ReturnType<typeof useProForm<any>>;
}

export function ProForm({ form, onSubmit, className, ...props }: ProFormProps) {
  return (
    <form
      className={cn("space-y-4", className)}
      onSubmit={(event) => {
        event.preventDefault();
        void form?.submit();
        onSubmit?.(event);
      }}
      {...props}
    />
  );
}

export interface FormItemProps extends Omit<React.ComponentProps<"div">, "title"> {
  name?: string;
  label?: React.ReactNode;
  required?: boolean;
  error?: React.ReactNode;
  help?: React.ReactNode;
  extra?: React.ReactNode;
}

function FormItem({
  label,
  required,
  error,
  help,
  extra,
  children,
  className,
  ...props
}: FormItemProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {label ? (
        <Label>
          {label}
          {required ? <span className="text-destructive">*</span> : null}
        </Label>
      ) : null}
      {children}
      {error ? (
        <div className="text-destructive text-xs">{error}</div>
      ) : help ? (
        <div className="text-muted-foreground text-xs">{help}</div>
      ) : null}
      {extra ? <div className="text-muted-foreground text-xs">{extra}</div> : null}
    </div>
  );
}

ProForm.Item = FormItem;

export interface ModalFormProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  form: ReturnType<typeof useProForm<any>>;
  children?: React.ReactNode;
}

export function ModalForm({ open, onOpenChange, title, form, children }: ModalFormProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ProForm form={form}>{children}</ProForm>
        <DialogFooter>
          <ProButton variant="outline" onClick={() => onOpenChange?.(false)}>
            取消
          </ProButton>
          <ProButton
            loading={form.submitting}
            onClick={() => void form.submit().then((ok) => ok && onOpenChange?.(false))}
          >
            保存
          </ProButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DrawerForm({ open, onOpenChange, title, form, children }: ModalFormProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-auto px-4">
          <ProForm form={form}>{children}</ProForm>
        </div>
        <SheetFooter>
          <ProButton variant="outline" onClick={() => onOpenChange?.(false)}>
            取消
          </ProButton>
          <ProButton
            loading={form.submitting}
            onClick={() => void form.submit().then((ok) => ok && onOpenChange?.(false))}
          >
            保存
          </ProButton>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

interface PageOverlayProps {
  open?: boolean;
  title?: React.ReactNode;
  onBack?: () => void;
  footer?: React.ReactNode;
  children?: React.ReactNode;
}

function PageOverlay({ open, title, onBack, footer, children }: PageOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <div className="font-medium">{title}</div>
        <ProButton variant="ghost" onClick={onBack}>
          返回
        </ProButton>
      </header>
      <main className="min-h-0 flex-1 overflow-auto p-4">{children}</main>
      {footer ? (
        <footer className="flex shrink-0 justify-end gap-2 border-t p-4">{footer}</footer>
      ) : null}
    </div>
  );
}

export function PageOverlayForm({ open, onOpenChange, title, form, children }: ModalFormProps) {
  return (
    <PageOverlay
      open={open}
      title={title}
      onBack={() => onOpenChange?.(false)}
      footer={
        <>
          <ProButton variant="outline" onClick={() => onOpenChange?.(false)}>
            取消
          </ProButton>
          <ProButton
            loading={form.submitting}
            onClick={() => void form.submit().then((ok) => ok && onOpenChange?.(false))}
          >
            保存
          </ProButton>
        </>
      }
    >
      <ProForm form={form}>{children}</ProForm>
    </PageOverlay>
  );
}
