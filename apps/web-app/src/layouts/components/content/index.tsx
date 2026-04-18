import { KeepAliveOutlet, type KeepAliveRef } from "@rap/components-ui/keep-alive";
import { useMinimax } from "@rap/hooks/use-minimax";
import { useLocation } from "@tanstack/react-router";
import { useRef } from "react";
import type { AppEvent } from "@/app-context";
import { useAppContext } from "@/app-context";
import { Footer } from "../footer";
import { AppTabs } from "../tabs";

interface AppContentProps {
	className?: string;
	showTabs?: boolean;
}
export const AppContent = ({ className = "", showTabs = true }: AppContentProps) => {
	const { eventBus } = useAppContext();
	const { isMaximized, handleMaximize, handleRestore } = useMinimax();
	const keepAliveRef = useRef<KeepAliveRef>(null);
	const cacheKey = useLocation({
		select: (location) => location.pathname,
	});
	eventBus.useSubscription((event: AppEvent<string | string[]>) => {
		if (event.type === "reload-tab") {
			keepAliveRef.current?.handleRefreshCache(event.payload as string);
		} else if (event.type === "remove-tab") {
			keepAliveRef.current?.handleRemoveCache(event.payload as string[]);
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
				<KeepAliveOutlet className="overflow-y-auto" cacheKey={cacheKey} ref={keepAliveRef} />
			</main>
			<Footer />
		</div>
	);
};
