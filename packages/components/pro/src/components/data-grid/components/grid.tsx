import { cn } from "@rap/utils";

export const gridRowClassName =
	"group/row grid items-center transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted";

export function Grid({ className, ...props }: React.ComponentProps<"div">) {
	return <div role="grid" {...props} className={cn("w-full overflow-hidden", className)} />;
}

export function GridRow({ className, style, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			role="gridrow"
			{...props}
			className={cn(gridRowClassName, className)}
			style={{
				gridTemplateColumns: "var(--rap-data-grid-template-columns)",
				...style,
			}}
		/>
	);
}

export function GridCell({
	className,
	rowSpan = 1,
	colSpan = 1,
	style,
	...props
}: React.ComponentProps<"div"> & { rowSpan?: number; colSpan?: number }) {
	return (
		<div
			role="gridcell"
			{...props}
			className={cn(
				"h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0",
				className,
			)}
			style={{
				gridColumnEnd: `span ${colSpan}`,
				gridRowEnd: `span ${rowSpan}`,
				...style,
			}}
		/>
	);
}
