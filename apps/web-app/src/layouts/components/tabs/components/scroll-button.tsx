import { cn } from "@rap/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
	canScroll: boolean;
	direction: "left" | "right";
	className?: string;
	scroll: () => void;
}
const LeftIcon = ({ canScroll }: { canScroll: boolean }) => (
	<div className={cn("relative", { "animate-arrow-left": canScroll })}>
		<ChevronLeft className="size-4" />
	</div>
);

const RightIcon = ({ canScroll }: { canScroll: boolean }) => (
	<div className={cn("relative", { "animate-arrow-right": canScroll })}>
		<ChevronRight className="size-4" />
	</div>
);
export function ScrollButton({ canScroll, direction, scroll, className }: ScrollButtonProps) {
	return (
		<button
			type="button"
			onClick={scroll}
			disabled={!canScroll}
			className={cn(
				"h-full px-2 flex items-center bg-app-tabs/90 hover:bg-app-tabs transition-all duration-200",
				{
					"opacity-50 cursor-not-allowed": !canScroll,
					// "shadow-md hover:shadow-lg": canScroll, // 只有可滚动时才有阴影
					"border-l-app-tabs-border border-l justify-end": direction === "right",
					"border-r-app-tabs-border border-r": direction === "left",
				},
				className,
			)}
		>
			{direction === "left" ? (
				<LeftIcon canScroll={canScroll} />
			) : (
				<RightIcon canScroll={canScroll} />
			)}
		</button>
	);
}
