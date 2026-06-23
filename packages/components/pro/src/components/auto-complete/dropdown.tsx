import { PopoverContent } from "@rap/components-ui/popover";
import { cn } from "@rap/utils";
import type { SelectPlacement } from "@rap/components-pro/select";
import type { ReactNode } from "react";
import { resolvePlacement } from "../select/utils";

interface AutoCompleteDropdownProps {
  children: ReactNode;
  popupClassName?: string;
  placement?: SelectPlacement;
}

export function AutoCompleteDropdown({
  children,
  popupClassName,
  placement = "bottomLeft",
}: AutoCompleteDropdownProps) {
  const { side, align } = resolvePlacement(placement);

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
      {children}
    </PopoverContent>
  );
}
