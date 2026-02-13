import { ContentSkeleton } from "@/layouts/components/skeleton/content-skeleton";
import { SidebarInset } from "@rap/components-base/sidebar/index";

export function FullscreenLayoutSkeleton() {
	return (
		<SidebarInset className="overflow-x-hidden min-w-0">
			<ContentSkeleton />
		</SidebarInset>
	)
}
