"use client";
import {
  Sidebar as BaseSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
	SidebarTrigger,
	useSidebar,
} from "@rap/components-base/resizable-sidebar";

import type React from "react";
import { Logo } from "@rap/components-ui/logo";

import { SidebarMain } from "./sidebar-main";
import { SidebarUser } from "./sidebar-user";
import { cn } from "@rap/utils";
import { SidebarSkeleton } from "./sidebar-skeleton";

export type SidebarProps = React.ComponentProps<typeof BaseSidebar> & {
  logo?: string;
  isLoading?: boolean;
};

export function Sidebar({ isLoading = false, ...props }: SidebarProps) {
	const { state } = useSidebar();
  return (
    <BaseSidebar collapsible="icon" {...props}>
      <SidebarHeader className={cn('overflow-hidden', state === 'expanded' ? 'flex-row flex-items-center justify-between' : 'flex-col')}>
			<Logo url={props.logo} />
			<div className="flex-center">
				<SidebarTrigger className="size-5" />
			</div>
      </SidebarHeader>
      <SidebarContent>
        {isLoading ? <SidebarSkeleton /> : <SidebarMain />}
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser  />
      </SidebarFooter>
      <SidebarRail />
    </BaseSidebar>
  );
}

