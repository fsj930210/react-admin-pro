import { SidebarInset, SidebarProvider } from "@rap/components-base/sidebar";
import { Footer, Header, Sidebar } from "@rap/components-ui/layout";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_layouts")({
  component: Layout,
});

function Layout() {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min">
            <Outlet />
          </div>
        </div>
        <Footer />
      </SidebarInset>
    </SidebarProvider>
  );
}
