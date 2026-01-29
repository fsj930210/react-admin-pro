import { 
	DropdownMenu, 
	DropdownMenuContent, 
	DropdownMenuItem, 
	DropdownMenuTrigger, 
	DropdownMenuSub, 
	DropdownMenuSubTrigger, 
	DropdownMenuSubContent, 
	DropdownMenuPortal 
} from "@rap/components-base/dropdown-menu";
import { SidebarMenuButton } from "@rap/components-base/resizable-sidebar";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { MenuItem } from "@/layouts/hooks/useMenuService";
import { SidebarHighlightText } from "./sidebar-highlight-text";
import { SidebarBadge } from "./sidebar-badge";
import { cn } from "@rap/utils";
import { useState } from "react";

interface SidebarHoverSubmenuProps {
  item: MenuItem;
  level?: number;
  searchKeywords?: string[];
  orientation?: 'horizontal' | 'vertical';
	selectedMenu: MenuItem | null;
	onItemClick?: (item: MenuItem) => void;
}

function RecursiveDropdownMenuItem({ 
  item, 
  level = 0, 
  searchKeywords = [],
  isNested = false,
  orientation = 'vertical',
	selectedMenu,
	onItemClick,
}: SidebarHoverSubmenuProps & { isNested?: boolean; orientation?: 'horizontal' | 'vertical' }) {
  const hasChildren = (item.children?.length ?? 0) > 0;
  const isActive = selectedMenu?.id === item.id;

  if (hasChildren) {
    if (isNested) {
      const [open, setOpen] = useState(false);
      
      return (
        <DropdownMenuSub open={open} onOpenChange={setOpen}>
          <DropdownMenuSubTrigger
            className={cn(
              "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer",
              isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent",
              "[&>svg:last-child]:hidden"
            )}
          >
            {item.icon && <item.icon  />}
            <span className="truncate flex-1">
              <SidebarHighlightText
                text={item.title}
                searchKeywords={searchKeywords}
              />
            </span>
            {item.badge && <SidebarBadge badge={item.badge} />}
            <ChevronRight className={`transition-transform size-4 duration-200 ease-in-out  ${open ? 'rotate-180' : ''}`} />
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent 
              className="z-500 w-48 border bg-popover p-1 text-popover-foreground shadow-md ml-2"
            >
              {item.children?.map((child) => (
                <RecursiveDropdownMenuItem
                  key={child.id}
                  item={child}
                  level={level + 1}
                  searchKeywords={searchKeywords}
                  isNested={true}
                />
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      );
    } else {
      const [open, setOpen] = useState(false);
      const isHorizontal = orientation === 'horizontal';
      
      return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              isActive={isActive}
              className="cursor-pointer flex items-center whitespace-nowrap"
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              {item.icon && <item.icon />}
              <span className="truncate">
                <SidebarHighlightText
                  text={item.title}
                  searchKeywords={searchKeywords}
                />
              </span>
              {item.badge && <SidebarBadge badge={item.badge} />}
              {isHorizontal ? (
                <ChevronDown className={`ml-auto transition-transform size-4 duration-200 ease-in-out  ${open ? 'rotate-180' : ''}`} />
              ) : (
                <ChevronRight className={`ml-auto transition-transform size-4 duration-200 ease-in-out  ${open ? 'rotate-180' : ''}`} />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent 
              side={isHorizontal ? "bottom" : "right"} 
              align={isHorizontal ? "start" : "start"} 
              className={`z-400 w-48 border bg-popover p-1 text-popover-foreground shadow-md ${isHorizontal ? 'mt-0.5' : 'ml-2'}`}
              onMouseEnter={() => setOpen(true)}
              onMouseLeave={() => setOpen(false)}
            >
              {item.children?.map((child) => (
                <RecursiveDropdownMenuItem
                  key={child.id}
                  item={child}
                  level={level + 1}
                  searchKeywords={searchKeywords}
                  isNested={true}
                  orientation={orientation}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>
      );
    }
  } else {
    return (
      <DropdownMenuItem 
        className={cn(
          "flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer",
          isActive ? "bg-sidebar-accent" : "hover:bg-sidebar-accent"
        )}
        onClick={() => onItemClick?.(item)}
      >
        {item.icon && <item.icon  />}
        <span className="truncate flex-1">
          <SidebarHighlightText
            text={item.title}
            searchKeywords={searchKeywords}
          />
        </span>
        {item.badge && <SidebarBadge badge={item.badge} />}
      </DropdownMenuItem>
    );
  }
}

export function SidebarHoverSubmenu({ 
  item, 
  level = 0, 
  searchKeywords = [],
  orientation = 'vertical'
}: SidebarHoverSubmenuProps) {
  const hasChildren = (item.children?.length ?? 0) > 0;

  if (!hasChildren) {
    return null;
  }

  return (
    <RecursiveDropdownMenuItem 
      item={item} 
      level={level} 
      searchKeywords={searchKeywords}
      isNested={false}
      orientation={orientation}
    />
  );
}