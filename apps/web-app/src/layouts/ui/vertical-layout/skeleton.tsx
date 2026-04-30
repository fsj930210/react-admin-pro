import {
	Sidebar,
	SidebarContent,
	SidebarInset,
	SidebarProvider,
} from "@rap/components-ui/sidebar/index";
import { Skeleton } from "@rap/components-ui/skeleton";
import { SidebarHeader } from "@/layouts/components/sidebar/sidebar-header";
import {
	ContentSkeleton,
	HeaderSkeleton,
	SidebarSkeleton,
	TabsSkeleton,
} from "@/layouts/components/skeleton";

export function VerticalLayoutSkeleton() {
	return (
		<SidebarProvider className="h-full">
			<Sidebar collapsible="icon" className="p-2">
				<SidebarHeader showTrigger={false} />
				<SidebarContent className="p-2">
					<SidebarSkeleton />
				</SidebarContent>
				<Skeleton className="h-12 w-full rounded-md" />
			</Sidebar>
			<SidebarInset className="overflow-x-hidden min-w-0">
				<HeaderSkeleton />
				<TabsSkeleton />
				<ContentSkeleton />
			</SidebarInset>
		</SidebarProvider>
	);
}
