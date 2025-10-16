"use client";

import {
	Sidebar as BaseSidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@rap/components-base/sidebar";
import {
	AudioWaveform,
	BookOpen,
	Bot,
	Command,
	CreditCard,
	Folder,
	Frame,
	GalleryVerticalEnd,
	History,
	type LucideIcon,
	Map as MapIcon,
	PieChart,
	Route,
	Settings2,
	SquareTerminal,
	Star,
	Users,
} from "lucide-react";
import type * as React from "react";
import { Logo } from "../../../logo";

import { SidebarMain, type SidebarMainItem } from "./sidebar-main";
import { SidebarUser } from "./sidebar-user";

const data: {
	user: {
		name: string;
		email: string;
		avatar: string;
	};
	teams: {
		name: string;
		logo: LucideIcon;
		plan: string;
	}[];
	navMain: SidebarMainItem[];
	projects: {
		name: string;
		url: string;
		icon: LucideIcon;
	}[];
} = {
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
	navMain: [
		{
			label: "Platform",
			value: "/platform",
			isGroupLabel: true,

			children: [
				{
					label: "Playground",
					value: "/playground",
					icon: SquareTerminal,
					badgeType: "normal",
					badgeText: "new",
					children: [
						{
							label: "History",
							value: "/history",
							icon: History,
						},
						{
							label: "Starred",
							value: "/starred",
							icon: Star,
						},
						{
							label: "Settings",
							value: "/settings",
							icon: Settings2,
						},
					],
				},
				{
					label: "Models",
					value: "/models",
					icon: Bot,
					badgeType: "dot",
					badgeVariants: "error",
					// isActive: true,
					children: [
						{
							label: "DeepSeek",
							value: "/models/deepseek",
							icon: Bot,
							// isActive: true,
							children: [
								{
									label: "DeepSeek Coder",
									value: "/models/deepseek/deepseek-coder",
								},
								{
									label: "DeepSeek Coder Plus",
									value: "/models/deepseek/deepseek-coder-plus",
								},
							],
						},
						{
							label: "ChatGPT",
							value: "/models/chatgpt",
							icon: Bot,
							children: [
								{
									label: "ChatGPT 3.5",
									value: "/models/chatgpt/chatgpt-3.5",
								},
								{
									label: "ChatGPT 4",
									value: "/models/chatgpt/chatgpt-4",
								},
							],
						},
						{
							label: "Claude",
							value: "/models/claude",
							icon: Bot,
							children: [
								{
									label: "Claude 3.5",
									value: "/models/claude/claude-3.5",
								},
								{
									label: "Claude 3.5 Sonnet",
									value: "/models/claude/claude-3.5-sonnet",
								},
							],
						},
						{
							label: "Gemini",
							value: "/models/gemini",
							icon: Bot,
							children: [
								{
									label: "Gemini 1.5",
									value: "/models/gemini/gemini-1.5",
								},
								{
									label: "Gemini 1.5 Pro",
									value: "/models/gemini/gemini-1.5-pro",
								},
							],
						},
					],
				},
				{
					label: "Documentation",
					value: "/documentation",
					icon: BookOpen,
					children: [
						{
							label: "Introduction",
							value: "/documentation/introduction",
							icon: BookOpen,
						},
						{
							label: "Get Started",
							value: "/documentation/get-started",
							icon: BookOpen,
						},
						{
							label: "Tutorials",
							value: "/documentation/tutorials",
							icon: BookOpen,
						},
						{
							label: "Changelog",
							value: "/documentation/changelog",
							icon: BookOpen,
						},
					],
				},
				{
					label: "Settings",
					value: "/settings",
					icon: Settings2,
					children: [
						{
							label: "General",
							value: "/settings/general",
							icon: Settings2,
						},
						{
							label: "Team",
							value: "/settings/team",
							icon: Users,
						},
						{
							label: "Billing",
							value: "/settings/billing",
							icon: CreditCard,
						},
						{
							label: "Limits",
							value: "/settings/limits",
							icon: CreditCard,
						},
					],
				},
			],
		},
		{
			label: "Projects",
			value: "/projects",
			icon: Folder,
			isGroupLabel: true,
			children: [
				{
					label: "Design Engineering",
					value: "/projects/design-engineering",
					icon: Frame,
				},
				{
					label: "Sales & Marketing",
					value: "/projects/sales-marketing",
					icon: PieChart,
					badgeType: "dot",
					badgeVariants: "default",
				},
				{
					label: "Travel",
					value: "/projects/travel",
					icon: MapIcon,
					badgeType: "normal",
					badgeText: "new",
				},
			],
		},
		{
			label: "Links",
			value: "/links",
			isGroupLabel: true,
			children: [
				{
					label: "React Admin Pro",
					value: "/links/react-admin-pro",
					icon: BookOpen,
					linkProps: {
						href: "https://github.com/fsj930210/react-admin-pro",
					},
				},
				{
					label: "Route Demo",
					value: "/links/route-demo",
					icon: Route,
					linkProps: {
						href: "https://tanstack.com/router/latest",
					},
				},
			],
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
			icon: MapIcon,
		},
	],
};

export type SidebarProps = React.ComponentProps<typeof BaseSidebar> & {
	logo?: string;
};
export function Sidebar({ ...props }: SidebarProps) {
	return (
		<BaseSidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<Logo url={props.logo} />
			</SidebarHeader>
			<SidebarContent className="gap-0">
				<SidebarMain data={data.navMain} />
			</SidebarContent>
			<SidebarFooter>
				<SidebarUser user={data.user} />
			</SidebarFooter>
			<SidebarRail />
		</BaseSidebar>
	);
}
