import { Icon } from "@rap/components-ui/icon";
import { cn } from "@rap/utils";
import { X } from "lucide-react";
import type { AppTabItemProps } from "../../types";

export function TrapezoidTabItem({ tab, active, index, onItemClick, onClose }: AppTabItemProps) {
	return (
		<div className="h-full pt-2" onClick={() => onItemClick?.(tab)} tabIndex={index}>
			<div
				className={cn(
					"relative flex-center h-full w-40 hover:not-[.active]:after:border-b-app-tabs-accent",
					{
						"after:absolute after:top-0 after:left-0 after:w-full after:h-0 after:z-1 after:border-l-16 after:border-l-transparent after:transition-all after:duration-200 after:ease-in-out": true,
						"after:border-r-16 after:border-r-transparent after:border-b-35 after:border-b-app-tabs-border": true,
						"active after:border-b-app-tabs-primary": active,
					},
				)}
			>
				<span
					className="flex items-center justify-center gap-1 relative w-30 z-2 truncate text-sm cursor-pointer"
					title={tab.title || ""}
				>
					{tab.icon && <Icon icon={tab.icon} />}
					{tab.title}
				</span>
				<div
					className="relative flex-center size-4 z-2 opacity-0 hover:bg-app-tabs-close-accent rounded-full cursor-pointer transition-all duration-200 ease-in-out group-hover:opacity-100"
					onClick={(e) => {
						e.stopPropagation();
						onClose?.(tab.id);
					}}
				>
					<X className="size-3.5" />
				</div>
			</div>
		</div>
	);
}
