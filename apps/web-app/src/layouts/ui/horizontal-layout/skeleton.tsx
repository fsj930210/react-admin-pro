import { SidebarInset } from "@rap/components-base/sidebar/index";


import { Skeleton } from "@rap/components-base/skeleton";


import { HeaderSkeleton } from "@/layouts/components/skeleton";

import { TabsSkeleton } from "@/layouts/components/skeleton";

import { ContentSkeleton } from "@/layouts/components/skeleton";
import { AppLogo } from "@/components/app/logo";

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
	)
}
