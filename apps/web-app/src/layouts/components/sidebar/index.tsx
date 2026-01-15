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
import {
  AudioWaveform,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
} from "lucide-react";
import type React from "react";
import { Logo } from "@rap/components-ui/logo";

import { SidebarMain } from "./sidebar-main";
import { SidebarUser } from "./sidebar-user";
import { cn } from "@rap/utils";
import { SidebarSkeleton } from "./sidebar-skeleton";

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
        <SidebarUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </BaseSidebar>
  );
}

