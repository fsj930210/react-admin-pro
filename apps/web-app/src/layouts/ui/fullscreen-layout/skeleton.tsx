import { SidebarInset } from "@rap/components-ui/sidebar/index";
import { ContentSkeleton } from "@/layouts/components/skeleton/content-skeleton";

export function FullscreenLayoutSkeleton() {
	return (
		<SidebarInset className="overflow-x-hidden min-w-0">
			<ContentSkeleton />
		</SidebarInset>
	);
}
