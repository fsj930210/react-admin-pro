import { RouteKeepAlive, type RouteKeepAliveRef } from "@rap/components-pro/route-keep-alive";
import { useMinimax } from "@rap/hooks/use-minimax";
import { useRef } from "react";
import type { AppEvent } from "@/app-context";
import { useAppContext } from "@/app-context";
import { Footer } from "../footer";
import { ContentSkeleton } from "../skeleton";
import { AppTabs } from "../tabs";

interface AppContentProps {
	className?: string;
	showTabs?: boolean;
}
export const AppContent = ({ className = "", showTabs = true }: AppContentProps) => {
	const { eventBus } = useAppContext();
	const { isMaximized, handleMaximize, handleRestore } = useMinimax();
	const routeKeepAliveRef = useRef<RouteKeepAliveRef>(null);
	eventBus.useSubscription((event: AppEvent<string | string[]>) => {
		if (event.type === "reload-tab") {
			routeKeepAliveRef.current?.refreshTab(event.payload);
		} else if (event.type === "remove-tab") {
			routeKeepAliveRef.current?.removeTabs(event.payload);
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
			className={`flex flex-col flex-1 bg-muted overflow-hidden ${isMaximized ? "fixed top-0 left-0 z-99 w-screen h-screen" : ""} ${className}`}
		>
			{showTabs && <AppTabs isMaximized={isMaximized} />}
			<main className="flex-1 overflow-hidden bg-app-content">
				<RouteKeepAlive fallback={<ContentSkeleton />} ref={routeKeepAliveRef} />
			</main>
			<Footer />
		</div>
	);
};
