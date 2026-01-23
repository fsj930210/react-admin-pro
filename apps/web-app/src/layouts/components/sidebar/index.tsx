"use client";
import {
  Sidebar as BaseSidebar,
  SidebarContent,
  SidebarRail,
} from "@rap/components-base/resizable-sidebar";
import type React from "react";
import { SidebarMain } from "./sidebar-main";
import type { MenuItem } from "@/layouts/hooks/useMenuService";
import { SidebarHeader } from "./sidebar-header";
import { SidebarFooter } from "./sidebar-footer";

export type SidebarProps = React.ComponentProps<typeof BaseSidebar> & {
  logo?: string;
	onMenuItemClick?: (item: MenuItem | null) => void;
};

export function Sidebar({ onMenuItemClick, ...props }: SidebarProps) {
  return (
    <BaseSidebar collapsible="icon" {...props}>
     	<SidebarHeader logo={props.logo} />
      <SidebarContent>
        <SidebarMain />
      </SidebarContent>
      <SidebarFooter />
      <SidebarRail />
    </BaseSidebar>
  );
}
