import { AppLogo } from "@/components/app/logo";
import {
	SidebarHeader as BaseSidebarHeader,
	SidebarTrigger,
	useSidebar,
} from "@rap/components-base/sidebar";
import {  type LogoProps } from "@rap/components-ui/logo";
import { cn } from "@rap/utils";

interface SidebarHeaderProps {
	className?: string;
	logoProps?: LogoProps;
	showTrigger?: boolean;
}
export function SidebarHeader({ className, logoProps, showTrigger = true }: SidebarHeaderProps) {
	const { state } = useSidebar();
	return (
		<BaseSidebarHeader className={cn('overflow-hidden', state === 'expanded' ? 'flex-row flex items-center justify-between' : 'flex-col', className)}>
			<AppLogo {...logoProps} />
			{showTrigger && (
				<div className="flex-center">
					<SidebarTrigger className="size-5" />
				</div>
			)}
		</BaseSidebarHeader>
	);
}
