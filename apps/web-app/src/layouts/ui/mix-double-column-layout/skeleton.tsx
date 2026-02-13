import { AppLogo } from "@/components/app/logo";
import { HeaderSkeleton } from "@/layouts/components/skeleton";
import { Sidebar, SidebarContent, SidebarProvider } from "@rap/components-base/sidebar/index";
import { SidebarSkeleton } from "@/layouts/components/skeleton";
import { Skeleton } from "@rap/components-base/skeleton";
import { SidebarInset } from "@rap/components-base/sidebar/index";
import { TabsSkeleton } from "@/layouts/components/skeleton";
import { ContentSkeleton } from "@/layouts/components/skeleton";

export function MixDoubleColumnLayoutSkeleton() {
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
			<SidebarInset className="flex-row flex flex-1 overflow-hidden min-w-0 min-h-auto">
				<div className="flex h-full">
					<div className="flex flex-col items-center py-2 w-22 h-full border-r border-r-sidebar-border">
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
					<Sidebar collapsible="icon" className="h-[calc(100%-var(--spacing)*11)] top-11 left-22 flex-1">
						<SidebarContent className="p-2">
							<SidebarSkeleton />
						</SidebarContent>
					</Sidebar>
				</div>
				<div className="flex flex-col flex-1">
					<TabsSkeleton />
					<ContentSkeleton />
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}