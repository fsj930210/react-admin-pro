import { SidebarInset } from "@rap/components-ui/sidebar/index";

import { Skeleton } from "@rap/components-ui/skeleton";
import { AppLogo } from "@/components/app/logo";
import { ContentSkeleton, HeaderSkeleton, TabsSkeleton } from "@/layouts/components/skeleton";

export function HorizontalLayoutSkeleton() {
	return (
		<SidebarInset className="overflow-x-hidden min-w-0">
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
			<TabsSkeleton />
			<ContentSkeleton />
		</SidebarInset>
	);
}
