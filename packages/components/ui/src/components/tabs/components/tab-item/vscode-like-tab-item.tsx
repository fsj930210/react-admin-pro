import { X } from "lucide-react";
import type { LayoutTabItemProps } from "../../types";
import { cn } from "@rap/utils";

export function VscodeLikeTabItem({ tab, onClick, active }: LayoutTabItemProps) {
  return (
    <div
      key={tab.value}
      data-tab-value={tab.value}
      onClick={() => onClick(tab.value)}
      className={cn('group relative flex-items-center justify-between h-full pl-3 pr-2 py-1 border-r border-r-layout-tabs-border hover:not-[.active]:bg-layout-tabs-accent border-t border-t-layout-tabs-border border-b border-b-layout-tabs-border cursor-pointer', {
        'before:absolute before:top-0 before:left-0 before:w-full before:h-[1px] before:bg-primary before:transition before:druation-200 before:ease-in-out before:scale-x-0 before:origin-left hover:before:scale-x-100': true,
        'active bg-layout-tabs-primary before:scale-x-100 border-b-transparent': active
      })}
    >
      <span className="flex-1 pr-4 truncate text-sm" title={tab.label || ""}>
        {tab.label}
      </span>
      <div className="flex-center size-5 opacity-0 hover:bg-layout-tabs-close-accent rounded-xs cursor-pointer transition-all duration-200 ease-in-out group-[.active]:opacity-100 group-hover:opacity-100">
        <X className="size-4" />
      </div>
    </div>
  );
}