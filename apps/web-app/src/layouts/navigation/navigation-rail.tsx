import { Icon } from "@rap/components-pro/icon";
import { cn } from "@rap/utils";
import type { MenuItem } from "@/layouts/types";
import { getVisibleMenus } from "./menu-utils";

interface NavigationRailProps {
  menus: MenuItem[];
  activeItem?: MenuItem | null;
  onSelect?: (item: MenuItem) => void;
  className?: string;
  itemHeight?: string;
}

export function NavigationRail({
  menus,
  activeItem,
  onSelect,
  className,
  itemHeight = "h-16",
}: NavigationRailProps) {
  return (
    <div className={cn("flex h-full w-22 shrink-0 flex-col items-center border-r py-2", className)}>
      <ol className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto overflow-x-hidden">
        {getVisibleMenus(menus).map((item) => (
          <li key={item.id} className="mx-2 my-1">
            <button
              type="button"
              title={item.title}
              className={cn(
                "flex w-full cursor-pointer flex-col items-center justify-center gap-1 overflow-hidden rounded-md p-1 text-center text-xs leading-tight hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                itemHeight,
                activeItem?.id === item.id ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""
              )}
              onClick={() => onSelect?.(item)}
            >
              {item.icon && <Icon icon={item.icon} size={20} />}
              <span className="w-full truncate">{item.title}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
