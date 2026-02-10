import { cn } from "@rap/utils";
import { X } from "lucide-react";
import type { LayoutTabItemProps } from "../../types";

export function VscodeLikeTabItem({
	tab,
	active,
	index,
	onClose,
	onItemClick,
}: LayoutTabItemProps) {
	return (
		<div
			className={cn(
				" relative flex items-center justify-between h-full pl-3 pr-2 py-1 border-r border-r-layout-tabs-border hover:not-[.active]:bg-layout-tabs-accent cursor-pointer",
				{
					"before:absolute before:top-0 before:left-0 before:w-full before:h-px before:bg-primary before:transition before:druation-200 before:ease-in-out before:scale-x-0 before:origin-left hover:before:scale-x-100": true,
					"active bg-layout-tabs-primary before:scale-x-100": active,
				},
			)}
			tabIndex={index}
			onClick={() => onItemClick?.(tab)}
		>
			<span className="flex-1 pr-4 truncate text-sm" title={tab.title || ""}>
				{tab.title}
			</span>
			<div
				className="flex-center size-5 opacity-0 hover:bg-layout-tabs-close-accent rounded-xs cursor-pointer transition-all duration-200 ease-in-out group-[.active]:opacity-100 group-hover:opacity-100"
				onClick={(e) => {
					e.stopPropagation();
					onClose?.(tab.id);
				}}
			>
				<X className="size-4" />
			</div>
		</div>
	);
}
