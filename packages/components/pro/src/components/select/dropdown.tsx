import { type ReactNode } from "react";
import { PopoverContent } from "@rap/components-ui/popover";
import { cn } from "@rap/utils";
import { resolvePlacement } from "./utils";
import type { SelectPlacement } from "./types";
import * as React from "react";

interface SelectDropdownProps {
  children: React.ReactNode;
  loading?: boolean;
  notFound?: boolean;
  notFoundContent?: React.ReactNode;
  loadingContent?: React.ReactNode;
  popupClassName?: string;
  placement?: SelectPlacement;
  dropdownRender?: (menu: React.ReactNode) => React.ReactNode;
}

export function SelectDropdown({
  children,
  loading,
  notFound,
  notFoundContent,
  loadingContent = "加载中...",
  popupClassName,
  placement = "bottomLeft",
  dropdownRender,
}: SelectDropdownProps) {
  const { side, align } = resolvePlacement(placement);

  let menu = children;
  if (loading) {
    menu = <div className="px-3 py-5 text-sm text-muted-foreground">{loadingContent}</div>;
  } else if (notFound) {
    menu = <div className="px-3 py-5 text-sm text-muted-foreground">{notFoundContent}</div>;
  }

  return (
    <PopoverContent
      side={side}
      align={align}
      sideOffset={6}
      className={cn(
        "w-[var(--radix-popover-trigger-width)] rounded-2xl border border-border bg-popover p-2 shadow-xl",
        popupClassName
      )}
      onOpenAutoFocus={(event) => event.preventDefault()}
      onCloseAutoFocus={(event) => event.preventDefault()}
    >
      {dropdownRender ? dropdownRender(menu) : menu}
    </PopoverContent>
  );
}
