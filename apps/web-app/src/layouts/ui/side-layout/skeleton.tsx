import { AppLogo } from "@/components/app/logo";
import { ContentSkeleton } from "@/layouts/components/skeleton/content-skeleton";
import { HeaderSkeleton } from "@/layouts/components/skeleton/header-skeleton";
import { SidebarSkeleton } from "@/layouts/components/skeleton/sidebar-skeleton";
import { TabsSkeleton } from "@/layouts/components/skeleton/tabs-skeleton";
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider } from "@rap/components-base/sidebar/index";
import { Skeleton } from "@rap/components-base/skeleton";

export function SideLayoutSkeleton() {
	return (
		<SidebarProvider className="flex flex-col h-full min-h-auto overflow-hidden">
			<div className="flex items-center gap-2 h-11 p-2 bg-background border-b border-b-border">
				<AppLogo showTitle={false} />
				<HeaderSkeleton className="flex-1" />
			</div>
			<div className="flex flex-1 overflow-hidden h-[calc(100%-var(--spacing)*11)]">
				<Sidebar collapsible="icon" className="p-2 top-11 h-[calc(100%-var(--spacing)*11)]">
					<SidebarContent>
						<SidebarSkeleton />
					</SidebarContent>
					<Skeleton className="h-12 w-full rounded-md" />
				</Sidebar>
				<SidebarInset className="overflow-x-hidden min-w-0">
					<TabsSkeleton />
					<ContentSkeleton />
				</SidebarInset>
			</div>
		</SidebarProvider>
	)
}