import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button, type buttonVariants } from "@rap/components-ui/button";
import { cn } from "@rap/utils";
import type { VariantProps } from "class-variance-authority";

export interface ProButtonProps extends React.ComponentPropsWithoutRef<typeof Button> {
  loading?: boolean;
  loadingText?: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  disabledOnLoading?: boolean;
}

export function ProButton({
  loading,
  loadingText,
  icon,
  iconPosition = "start",
  disabledOnLoading = true,
  disabled,
  children,
  className,
  ...props
}: ProButtonProps) {
  const finalDisabled = disabled || (disabledOnLoading && loading);
  const loadingIcon = <Loader2 className="size-4 animate-spin" />;
  const startIcon = loading ? loadingIcon : iconPosition === "start" ? icon : null;
  const endIcon = !loading && iconPosition === "end" ? icon : null;

  return (
    <Button className={className} disabled={finalDisabled} {...props}>
      {startIcon}
      {loading && loadingText ? loadingText : children}
      {endIcon}
    </Button>
  );
}

export interface ProButtonGroupProps extends React.ComponentProps<"div"> {
  attached?: boolean;
  wrap?: boolean;
  size?: VariantProps<typeof buttonVariants>["size"];
}

export function ProButtonGroup({
  attached,
  wrap = true,
  className,
  children,
  ...props
}: ProButtonGroupProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2",
        wrap && "flex-wrap",
        attached &&
          "gap-0 [&>*:not(:first-child)]:rounded-l-none [&>*:not(:first-child)]:border-l-0 [&>*:not(:last-child)]:rounded-r-none",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export type ToolbarButtonProps = ProButtonProps & { key: React.Key };
