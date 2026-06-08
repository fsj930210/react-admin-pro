import { useResponsive } from "@rap/hooks/use-media-query";
import type { MenuItem } from "@/layouts/types";
import { NavigationSidebar } from "./navigation-sidebar";

interface MobileNavigationSidebarProps {
  menus: MenuItem[];
}

export function MobileNavigationSidebar({ menus }: MobileNavigationSidebarProps) {
  const { isMobile } = useResponsive();

  if (!isMobile) return null;

  return <NavigationSidebar menus={menus} showHeader showFooter showSearch />;
}
