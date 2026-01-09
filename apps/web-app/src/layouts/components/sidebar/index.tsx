"use client";

import {
  Sidebar as BaseSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
	SidebarTrigger,
	useSidebar as useBaseSidebar,
} from "@rap/components-base/resizable-sidebar";
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
} from "lucide-react";
import type * as React from "react";
import { Logo } from "@rap/components-ui/logo";

import { SidebarMain } from "./sidebar-main";
import { SidebarUser } from "./sidebar-user";
import { LayoutSidebarProvider, useSidebar, type SidebarContextValue } from "./sidebar-context";
import { cn } from "@rap/utils";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/rap-web-app/shadcn.jpg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

export type SidebarProps = React.ComponentProps<typeof BaseSidebar> & {
  logo?: string;
};

export function Sidebar({ ...props }: SidebarProps) {
	const { state } = useBaseSidebar();
  return (
    <BaseSidebar collapsible="icon" {...props}>
      <SidebarHeader className={cn('overflow-hidden', state === 'expanded' ? 'flex-row flex-items-center justify-between' : 'flex-col')}>
				<Logo url={props.logo} />
				<SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMain />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </BaseSidebar>
  );
}

export { LayoutSidebarProvider, useSidebar };
export type { SidebarContextValue };
