import { RouteKeepAlive, type RouteKeepAliveRef } from "@rap/components-pro/route-keep-alive";
import { useMinimax } from "@rap/hooks/use-minimax";
import { useRef } from "react";
import type { AppEvent } from "@/app-context";
import { useAppContext } from "@/app-context";
import { Footer } from "../footer";
import { ContentSkeleton } from "../skeleton";
import { AppTabs } from "../tabs";
import { useUIPreferences } from "@/store/ui-preferences";

interface AppContentProps {
  className?: string;
  showTabs?: boolean;
}
export const AppContent = ({ className = "", showTabs = true }: AppContentProps) => {
  const { eventBus } = useAppContext();
  const preferences = useUIPreferences("preferences");
  const footerEnabled = preferences.layout.footer.enabled;
  const footerScrolls = footerEnabled && preferences.layout.footer.scrollWithContent;
  const { isMaximized, handleMaximize, handleRestore } = useMinimax();
  const routeKeepAliveRef = useRef<RouteKeepAliveRef>(null);
  eventBus.useSubscription((event: AppEvent<string | string[]>) => {
    if (event.type === "reload-tab") {
      if (typeof event.payload === "string") {
        routeKeepAliveRef.current?.refreshTab(event.payload);
      }
    } else if (event.type === "remove-tab") {
      routeKeepAliveRef.current?.removeTabs(
        Array.isArray(event.payload) ? event.payload : [event.payload]
      );
    } else if (event.type === "maximize-tab") {
      if (isMaximized) {
        handleRestore();
      } else {
        handleMaximize();
      }
    }
  });

  return (
    <div
      className={`flex min-h-0 flex-1 flex-col overflow-hidden bg-muted ${isMaximized ? "fixed top-0 left-0 z-99 h-screen w-screen" : ""} ${className}`}
    >
      {showTabs && preferences.tabs.enabled && (
        <AppTabs
          isMaximized={isMaximized}
          sortable={preferences.tabs.sortable}
          tabType={preferences.tabs.type}
          showContextMenu={preferences.tabs.showContextMenu}
          showMaximize={preferences.tabs.showMaximize}
          showRefresh={preferences.tabs.showRefresh}
        />
      )}
      <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-app-content p-(--app-content-padding)">
        <div
          className={`min-h-full ${preferences.layout.contentWidth === "fixed" ? "mx-auto w-full max-w-(--app-max-content-width)" : ""}`}
        >
          <div className={footerScrolls ? "flex min-h-full flex-col" : "h-full"}>
            <div className={footerScrolls ? "min-h-0 flex-1" : "h-full"}>
              <RouteKeepAlive fallback={<ContentSkeleton />} ref={routeKeepAliveRef} />
            </div>
            {footerScrolls && <Footer />}
          </div>
        </div>
      </main>
      {footerEnabled && !footerScrolls && <Footer />}
    </div>
  );
};
