import { Icon } from "@rap/components-pro/icon";
import { cn } from "@rap/utils";
import type { MenuItem } from "@/layouts/types";
import { MenuItemBadge } from "./menu-item-badge";
import { MenuItemHighlightText } from "./menu-item-highlight-text";
import type { HighlightPart } from "@/layouts/service/menuService";

interface MenuItemContentProps {
  item: MenuItem;
  searchKeywords?: string[];
  highlightParts?: HighlightPart[];
  showBadge?: boolean;
  className?: string;
  iconSize?: number;
}
export function MenuItemContent({
  item,
  searchKeywords = [],
  highlightParts,
  showBadge = true,
  className,
  iconSize = 16,
}: MenuItemContentProps) {
  return (
    <span className={cn("flex size-full min-w-0 items-center gap-1", className)}>
      {item.icon && (
        <span className="shrink-0">
          <Icon icon={item.icon} size={iconSize} />
        </span>
      )}
      <span className="min-w-0 flex-1 truncate" title={item.title}>
        <MenuItemHighlightText
          key={item.id}
          text={item.title}
          searchKeywords={searchKeywords}
          highlightParts={highlightParts}
        />
      </span>
      {showBadge && item.badge && (
        <span className="shrink-0">
          <MenuItemBadge badge={item.badge} />
        </span>
      )}
    </span>
  );
}
