import { Outlet } from "@tanstack/react-router";
import { Footer } from "../footer";

interface AppContentProps {
	className?: string;
}
export const AppContent = ({ className = "" }: AppContentProps) => {
	return (
		<div className={`flex flex-col flex-1 bg-muted overflow-y-auto overflow-x-hidden ${className}`}>
			<div className="flex-1">
				<Outlet />
			</div>
			<Footer />
		</div>
	);
};
