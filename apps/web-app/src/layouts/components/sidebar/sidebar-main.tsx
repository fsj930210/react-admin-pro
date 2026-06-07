import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@rap/components-ui/collapsible";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  useSidebar,
} from "@rap/components-ui/sidebar";
import { cn } from "@rap/utils";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useLayout } from "@/layouts/context/layout-context";
import { useMenu } from "@/layouts/hooks/useMenu";
import type { HighlightPart } from "@/layouts/service/menuService";
import type { MenuItem } from "@/layouts/types";
import { DropdownSubmenu } from "../menu/dropdown-submenu";
import { MenuItemContent } from "../menu/menu-item-content";
import { SidebarSearch } from "./sidebar-search";

interface SidebarMainProps {
  showSearch?: boolean;
  menus: MenuItem[];
  disableCollapsedDropdown?: boolean;
  collapsedDropdownTrigger?: ("hover" | "click")[];
}
export function SidebarMain({
  showSearch = true,
  menus = [],
  disableCollapsedDropdown = false,
}: SidebarMainProps) {
  const { menuService } = useLayout();
  const { openKeys, selectedMenu, updateOpenKeys, handleMenuItemClick, toggleMenuOpen } = useMenu({
    menuService,
  });
  const [searchState, setSearchState] = useState<{
    keyword: string;
    visibleIds: Set<string> | null;
    searchKeywords: string[];
    highlightsById: Map<string, HighlightPart[]>;
  }>({
    keyword: "",
    visibleIds: null,
    searchKeywords: [],
    highlightsById: new Map(),
  });

  const handleInputChange = (value: string) => {
    const keyword = value.trim();
    if (!keyword) {
      setSearchState({
        keyword: "",
        visibleIds: null,
        searchKeywords: [],
        highlightsById: new Map(),
      });
      return;
    }

    const result = menuService.searchSidebar(keyword);
    updateOpenKeys(result.expandedIds);
    setSearchState({
      keyword,
      visibleIds: result.visibleIds,
      searchKeywords: result.searchKeywords,
      highlightsById: result.highlightsById,
    });
  };

  return (
    <SidebarMenu className="overflow-x-hidden h-full">
      {showSearch && <SidebarSearch onChange={handleInputChange} />}
      {menus.map((item: MenuItem) => (
        <SidebarMenuItemContent
          key={item.id}
          item={item}
          searchKeywords={searchState.searchKeywords}
          visibleIds={searchState.visibleIds}
          highlightsById={searchState.highlightsById}
          openKeys={openKeys}
          selectedMenu={selectedMenu}
          toggleMenuOpen={toggleMenuOpen}
          onItemClick={handleMenuItemClick}
          level={0}
          disableCollapsedDropdown={disableCollapsedDropdown}
        />
      ))}
    </SidebarMenu>
  );
}

interface SidebarMenuItemContentProps {
  item: MenuItem;
  searchKeywords?: string[];
  visibleIds?: Set<string> | null;
  highlightsById?: Map<string, HighlightPart[]>;
  selectedMenu: MenuItem | null;
  openKeys: string[];
  level: number;
  disableCollapsedDropdown?: boolean;
  toggleMenuOpen: (id: string) => void;
  onItemClick?: (item: MenuItem) => void;
}

function SidebarMenuItemContent(props: SidebarMenuItemContentProps) {
  const {
    item,
    selectedMenu,
    searchKeywords,
    visibleIds,
    highlightsById,
    openKeys,
    level = 0,
    onItemClick,
    toggleMenuOpen,
    disableCollapsedDropdown = false,
  } = props;
  const { children } = item;
  const { state: sidebarState } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";

  if (visibleIds && !visibleIds.has(item.id)) return null;
  if (item.hidden || item.status !== "enabled" || item.type === "button") return null;
  if (!children || !children.length) {
    return (
      <SidebarMenuItem className={cn("px-0 my-1 mx-2", { "mx-0": level > 0 })}>
        <SidebarMenuButton
          isActive={selectedMenu?.id === item.id}
          onClick={() => onItemClick?.(item)}
          className="flex items-center justify-between p-0 pr-1 cursor-pointer whitespace-nowrap"
          style={{
            paddingLeft: `calc(var(--spacing) * 4 + var(--spacing) * 4 * ${level})`,
          }}
        >
          <MenuItemContent
            item={item}
            searchKeywords={searchKeywords}
            highlightParts={highlightsById?.get(item.id)}
          />
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (isCollapsed && !disableCollapsedDropdown) {
    return (
      <SidebarMenuItem className="px-0 my-1 mx-2">
        <DropdownSubmenu item={item} searchKeywords={searchKeywords} onItemClick={onItemClick}>
          <SidebarMenuButton
            isActive={selectedMenu?.id === item.id}
            className="flex items-center justify-center p-0"
          >
            <MenuItemContent
              item={item}
              searchKeywords={searchKeywords}
              highlightParts={highlightsById?.get(item.id)}
            />
          </SidebarMenuButton>
        </DropdownSubmenu>
      </SidebarMenuItem>
    );
  }

  return (
    <SidebarMenuItem className={cn("px-0 my-1 mx-2", { "mx-0": level > 0 })}>
      <Collapsible
        className="group/collapsible [&[data-state=open]>button>svg:last-child]:rotate-90"
        onOpenChange={() => toggleMenuOpen(item.id)}
        open={openKeys.includes(item.id)}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton
            className="flex items-center justify-between p-0 pr-1 cursor-pointer whitespace-nowrap"
            style={{
              paddingLeft: `calc(var(--spacing) * 4 + var(--spacing) * 4 * ${level})`,
            }}
          >
            <MenuItemContent
              item={item}
              searchKeywords={searchKeywords}
              highlightParts={highlightsById?.get(item.id)}
            />
            <ChevronRight className="size-4 transition-transform duration-200 ease-in-out" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="border-none mx-0 px-0">
            {children.map((subItem) => (
              <SidebarMenuItemContent
                key={subItem.id}
                {...props}
                level={level + 1}
                item={subItem}
                disableCollapsedDropdown={disableCollapsedDropdown}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
}
