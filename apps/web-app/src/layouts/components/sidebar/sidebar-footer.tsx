import { SidebarFooter as BaseSidebarFooter } from "@rap/components-base/resizable-sidebar";
import { SidebarUser } from "./sidebar-user";

export function SidebarFooter({ className }: { className?: string }) {
	return (
		<BaseSidebarFooter className={className}>
			<SidebarUser  />
		</BaseSidebarFooter>
	);
}