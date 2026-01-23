import {
	SidebarHeader as BaseSidebarHeader,
	SidebarTrigger,
	useSidebar,
} from "@rap/components-base/resizable-sidebar";
import { Logo } from "@rap/components-ui/logo";
import { cn } from "@rap/utils";

export function SidebarHeader({ className, logo }: { className?: string; logo?: string }) {
	const { state } = useSidebar();
	return (
		<BaseSidebarHeader className={cn('overflow-hidden', state === 'expanded' ? 'flex-row flex items-center justify-between' : 'flex-col', className)}>
			<Logo url={logo} />
			<div className="flex-center">
				<SidebarTrigger className="size-5" />
			</div>
		</BaseSidebarHeader>
	);
}
