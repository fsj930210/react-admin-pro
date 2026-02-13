import { AppLogo } from "@/components/app/logo";
import { HeaderSkeleton } from "@/layouts/components/skeleton";
import { ContentSkeleton } from "@/layouts/components/skeleton/content-skeleton";
import { SidebarSkeleton } from "@/layouts/components/skeleton/sidebar-skeleton";
import { TabsSkeleton } from "@/layouts/components/skeleton/tabs-skeleton";
import { Sidebar, SidebarContent, SidebarInset, SidebarProvider } from "@rap/components-base/sidebar/index";
import { Skeleton } from "@rap/components-base/skeleton";

export function DoubleColumnLayoutSkeleton() {
	return (
		<SidebarProvider className="h-full">
			<div className="flex">
				<div className="flex flex-col items-center py-2 w-22 h-full border-r border-r-sidebar-border">
					<AppLogo showTitle={false} />
					<ol className="flex flex-col flex-1 w-22 mt-2">
						{Array.from({ length: 5 }).map((_, index) => (
							// eslint-disable-next-line @eslint-react/no-array-index-key
							<li key={index} className="h-15 my-1 mx-2">
								<Skeleton className="h-full rounded-md" />
							</li>
						))}
					</ol>
					<Skeleton className="h-12 w-18 mx-2 rounded-md" />
				</div>
				<Sidebar collapsible="icon" className="h-full left-22 flex-1">
					<SidebarContent className="p-2">
						<SidebarSkeleton />
					</SidebarContent>
				</Sidebar>
			</div>
			<SidebarInset className="overflow-x-hidden min-w-0">
				<HeaderSkeleton />
				<TabsSkeleton />
				<ContentSkeleton />
			</SidebarInset>
		</SidebarProvider>
	)
}
		