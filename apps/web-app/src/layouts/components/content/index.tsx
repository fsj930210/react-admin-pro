import { useRouterState } from '@tanstack/react-router';
import { Outlet } from "@tanstack/react-router";
import { KeepAliveRoute } from "@rap/components-ui/keep-alive";
import { Footer } from "../footer";
import { AppTabs } from "../tabs";

interface AppContentProps {
	className?: string;
	showTabs?: boolean;
}
export const AppContent = ({ className = "", showTabs = true }: AppContentProps) => {
	const cacheKey = useRouterState({
		select: (state) => state.location.pathname + state.location.searchStr,
	});
	return (
		<div className={`flex flex-col flex-1 bg-layout-content overflow-hidden ${className}`}>
			{showTabs && <AppTabs />}
			<main className="flex-1 overflow-hidden">
				<KeepAliveRoute
					className="overflow-y-auto"
					cacheKey={cacheKey}
					excludes={["/overview"]}
				>
					<Outlet />
				</KeepAliveRoute>
			</main>
			<Footer />
		</div>
	);
};
