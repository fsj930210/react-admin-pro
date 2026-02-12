import { cn } from "@rap/utils";
import { X } from "lucide-react";
import type { LayoutTabItemProps } from "../../types";
import Icon from "@rap/components-ui/icon";

export function ClassicTabItem({ tab, active, index, onClose, onItemClick }: LayoutTabItemProps) {
	return (
		<div
			className={cn(
				"relative flex items-center justify-between h-full pl-3 pr-2 py-1 border-r border-r-layout-tabs-border cursor-pointer hover:not-[.active]:bg-layout-tabs-accent",
				"bg-layout-tabs text-layout-tabs-foreground",
				{
					"bg-layout-tabs-primary text-layout-tabs-primary-foreground active": active,
				},
			)}
			tabIndex={index}
			role="tab"
			onClick={() => onItemClick?.(tab)}
		>
			<span className="flex items-center gap-1 flex-1 truncate text-sm text-left pr-4" title={tab.title || ""}>
				{tab.icon && <Icon icon={tab.icon} />}
				{tab.title}
			</span>

			<button
				className="flex-center size-5 hover:bg-layout-tabs-close-accent rounded-xs cursor-pointer transition-all duration-200 ease-in-out group-[.active]:opacity-100 group-hover:opacity-100"
				onClick={(e) => {
					e.stopPropagation();
					onClose?.(tab.id);
				}}
				type="button"
			>
				<X className="size-4" />
			</button>
		</div>
	);
}
