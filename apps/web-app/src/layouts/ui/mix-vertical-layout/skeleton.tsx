import { AppLogo } from "@/components/app/logo";
import { ContentSkeleton, HeaderSkeleton, SidebarSkeleton, TabsSkeleton } from "@/layouts/components/skeleton";
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider } from "@rap/components-base/sidebar/index";
import { Skeleton } from "@rap/components-base/skeleton";

export function MixVerticalLayoutSkeleton() {
	return (
		<SidebarProvider className="flex flex-col h-full min-h-auto overflow-hidden">
			<HeaderSkeleton>
				<div className="flex items-center gap-4">
					<AppLogo showTitle={false} />
					<div className="flex items-center space-x-4">
						<Skeleton className="h-8 w-25 rounded-md" />
						<Skeleton className="h-8 w-25 rounded-md" />
						<Skeleton className="h-8 w-25 rounded-md" />
						<Skeleton className="h-8 w-25 rounded-md" />
						<Skeleton className="h-8 w-25 rounded-md" />
					</div>
				</div>
			</HeaderSkeleton>
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