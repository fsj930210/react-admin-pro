import { SidebarInset } from "@rap/components-ui/sidebar/index";
import { AppContent } from "@/layouts/components/content";

export function FullscreenLayout() {
	return (
		<SidebarInset>
			<AppContent showTabs={false} />
		</SidebarInset>
	);
}
