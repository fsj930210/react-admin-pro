import { AppContent } from "@/layouts/components/content";
import { SidebarInset } from "@rap/components-base/sidebar/index";

export function FullscreenLayout  ()  {
	return (
		<SidebarInset>
			<AppContent showTabs={false} />
		</SidebarInset>
	);
};

