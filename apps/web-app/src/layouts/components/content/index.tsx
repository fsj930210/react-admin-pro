import { Outlet } from "@tanstack/react-router";
import { Footer } from "../footer";
import { AppTabs } from "../tabs";

interface AppContentProps {
	className?: string;
	showTabs?: boolean;
}
export const AppContent = ({ className = "", showTabs = true }: AppContentProps) => {
	return (
		<div className={`flex flex-col flex-1 bg-white overflow-hidden ${className}`}>
			{showTabs && <AppTabs />}
			<div className="flex-1 overflow-y-auto">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
};
