import * as React from "react";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { AnimatedPresence, type AnimatedPresenceProps } from "@rap/components-ui/animator";
import { ProButton } from "../button";
import { cn } from "@rap/utils";

export interface PageProps extends Omit<React.ComponentProps<"section">, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  extra?: React.ReactNode;
  header?: React.ReactNode;
}

export function Page({
  title,
  description,
  extra,
  header,
  children,
  className,
  ...props
}: PageProps) {
  return (
    <section className={cn("flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6", className)} {...props}>
      {header ??
        (title || description || extra ? (
          <PageHeader title={title} description={description} extra={extra} />
        ) : null)}
      {children}
    </section>
  );
}

export interface PageHeaderProps extends Omit<React.ComponentProps<"header">, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  extra?: React.ReactNode;
  back?: boolean;
  onBack?: () => void;
  bordered?: boolean;
}

export function PageHeader({
  title,
  description,
  extra,
  back,
  onBack,
  bordered,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex items-start justify-between gap-4",
        bordered && "border-b pb-4",
        className
      )}
      {...props}
    >
      <div className="flex min-w-0 items-start gap-3">
        {back ? (
          <ProButton
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onBack}
            aria-label="返回"
          >
            <ArrowLeft className="size-4" />
          </ProButton>
        ) : null}
        <div className="min-w-0">
          {title ? (
            <h1 className="truncate font-semibold text-2xl tracking-normal">{title}</h1>
          ) : null}
          {description ? <p className="mt-1 text-muted-foreground text-sm">{description}</p> : null}
        </div>
      </div>
      {extra ? <div className="shrink-0">{extra}</div> : null}
    </header>
  );
}

export function PageFooter({ className, children, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      className={cn("flex justify-end gap-2 border-t bg-background px-4 py-3", className)}
      {...props}
    >
      {children}
    </footer>
  );
}

export function StickyFooter({ className, children, ...props }: React.ComponentProps<"footer">) {
  return (
    <footer
      className={cn(
        "sticky bottom-0 z-20 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur supports-[padding:max(0px)]:pb-[max(0.75rem,env(safe-area-inset-bottom))]",
        className
      )}
      {...props}
    >
      {children}
    </footer>
  );
}

export interface PageOverlayProps extends Omit<React.ComponentProps<"div">, "title"> {
  open?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  extra?: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
  destroyOnClose?: boolean;
  animatorProps?: Partial<AnimatedPresenceProps>;
}

export function PageOverlay({
  open = false,
  title,
  description,
  extra,
  footer,
  onBack,
  destroyOnClose = true,
  animatorProps,
  children,
  className,
  ...props
}: PageOverlayProps) {
  const body = (
    <div
      className={cn("absolute inset-0 z-30 flex min-h-0 flex-col bg-background", className)}
      {...props}
    >
      <PageHeader
        bordered
        back
        title={title}
        description={description}
        extra={extra}
        onBack={onBack}
        className="px-4 py-4 md:px-6"
      />
      <div className="min-h-0 flex-1 overflow-auto p-4 md:p-6">{children}</div>
      {footer ? <PageFooter>{footer}</PageFooter> : null}
    </div>
  );

  if (!destroyOnClose) return open ? body : <div className="hidden">{body}</div>;

  return (
    <AnimatedPresence
      show={open}
      preset="slide-left"
      duration={0.22}
      exitDuration={0.18}
      {...animatorProps}
      className="absolute inset-0 z-30"
    >
      {body}
    </AnimatedPresence>
  );
}

export interface SplitLayoutProps extends React.ComponentProps<"div"> {
  aside?: React.ReactNode;
  asideWidth?: number | string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export function SplitLayout({
  aside,
  asideWidth = 280,
  collapsible,
  defaultCollapsed,
  children,
  className,
  ...props
}: SplitLayoutProps) {
  const [collapsed, setCollapsed] = React.useState(Boolean(defaultCollapsed));
  return (
    <div className={cn("flex min-h-0 flex-1 gap-4", className)} {...props}>
      {aside ? (
        <aside
          className={cn(
            "relative min-h-0 shrink-0 rounded-md border bg-background transition-all",
            collapsed && "w-0 overflow-hidden border-0"
          )}
          style={{ width: collapsed ? 0 : asideWidth }}
        >
          <div className="h-full min-h-0 overflow-auto p-3">{aside}</div>
        </aside>
      ) : null}
      <div className="min-w-0 flex-1">{children}</div>
      {collapsible ? (
        <ProButton
          className="absolute left-2 top-2 z-10"
          size="icon-sm"
          variant="outline"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
        </ProButton>
      ) : null}
    </div>
  );
}

export interface ResponsivePanelProps extends React.ComponentProps<"div"> {
  open?: boolean;
  mode?: "inline" | "overlay";
}

export function ResponsivePanel({
  open = true,
  mode = "inline",
  className,
  children,
  ...props
}: ResponsivePanelProps) {
  if (mode === "overlay") {
    return (
      <AnimatedPresence show={open} preset="fade" className="fixed inset-0 z-40 bg-background p-4">
        <div className={className} {...props}>
          {children}
        </div>
      </AnimatedPresence>
    );
  }
  return open ? (
    <div className={className} {...props}>
      {children}
    </div>
  ) : null;
}
