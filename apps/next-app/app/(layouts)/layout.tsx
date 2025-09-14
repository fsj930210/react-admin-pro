import { SidebarInset, SidebarProvider } from "@rap/components-base/sidebar";
import { Footer, Sidebar } from "@rap/components-ui/layouts";
import { LayoutTabs } from "@rap/components-ui/tabs";
import type { ReactNode } from "react";
import { APP_BASE_PATH } from "@/config";

interface LayoutProps {
	children: ReactNode;
}
function Layout({ children }: LayoutProps) {
	return (
		<SidebarProvider>
			<Sidebar logo={`${APP_BASE_PATH}/logo.svg`} />
			<SidebarInset className="overflow-x-hidden min-w-0">
				<LayoutTabs />
				<div className="h-9 bg-background">{/* <Header /> */}</div>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-muted">
					<div className="min-h-[100vh] flex-1 rounded-xl md:min-h-min">{children}</div>
				</div>
				<Footer />
			</SidebarInset>
		</SidebarProvider>
	);
}

export default Layout;
