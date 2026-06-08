import { Button } from "@rap/components-ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@rap/components-ui/dropdown-menu";
import { cn } from "@rap/utils";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { DropdownSubmenu } from "@/layouts/components/menu/dropdown-submenu";
import { MenuItemContent } from "@/layouts/components/menu/menu-item-content";
import type { MenuItem } from "@/layouts/types";
import { getVisibleMenus } from "./menu-utils";

interface NavigationHorizontalProps {
  menus: MenuItem[];
  activeItem?: MenuItem | null;
  onSelect?: (item: MenuItem) => void;
  className?: string;
}

export function NavigationHorizontal({
  menus,
  activeItem,
  onSelect,
  className,
}: NavigationHorizontalProps) {
  const visibleMenus = getVisibleMenus(menus);

  return (
    <div className={cn("flex min-w-0 flex-1 items-center gap-1 overflow-hidden", className)}>
      <nav className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overflow-y-hidden whitespace-nowrap no-scrollbar">
        {visibleMenus.map((item) => (
          <NavigationHorizontalItem
            key={item.id}
            item={item}
            active={activeItem?.id === item.id}
            onSelect={onSelect}
          />
        ))}
      </nav>
      {visibleMenus.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" title="More menus">
              <MoreHorizontal className="size-4" />
              <span className="sr-only">More menus</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-56">
            {visibleMenus.map((item) => (
              <DropdownSubmenu
                key={item.id}
                item={item}
                side="right"
                align="start"
                onItemClick={onSelect}
                showBadge={false}
              >
                <button
                  type="button"
                  className="flex h-9 w-full min-w-0 cursor-pointer items-center px-2 text-left text-sm hover:bg-accent"
                >
                  <MenuItemContent item={item} showBadge={false} />
                </button>
              </DropdownSubmenu>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

interface NavigationHorizontalItemProps {
  item: MenuItem;
  active: boolean;
  onSelect?: (item: MenuItem) => void;
}

function NavigationHorizontalItem({ item, active, onSelect }: NavigationHorizontalItemProps) {
  const [open, setOpen] = useState(false);
  const hasChildren = !!item.children?.some((child) => !child.hidden && child.status === "enabled");

  return (
    <div className="relative min-w-0 shrink-0">
      <DropdownSubmenu
        item={item}
        side="bottom"
        align="start"
        open={open}
        onOpenChange={(nextOpen) => setOpen(nextOpen)}
        onItemClick={onSelect}
        showBadge={false}
        sideOffset={2}
      >
        <button
          type="button"
          title={item.title}
          className={cn(
            "flex h-9 max-w-40 min-w-0 cursor-pointer items-center gap-1 rounded-md px-3 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground",
            active ? "bg-accent text-foreground" : ""
          )}
        >
          <MenuItemContent item={item} showBadge={false} />
          {hasChildren && (
            <ChevronDown
              className={cn(
                "size-4 shrink-0 transition-transform duration-200",
                open ? "rotate-180" : ""
              )}
            />
          )}
        </button>
      </DropdownSubmenu>
    </div>
  );
}
