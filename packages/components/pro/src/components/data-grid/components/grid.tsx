import { cn } from "@rap/utils";

export function Grid({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div role="grid" {...props} className={cn('w-full overflow-hidden', className)} />
	)
}

export function GridRow({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div role="gridrow" {...props} className={cn('grid items-center auto-cols-[1fr] grid-flow-col border-b transition-colors hover:bg-muted/50 has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted', className)} />
	)
}

export function GridCell({ className, rowSpan = 1, colSpan = 1, ...props }: React.ComponentProps<'div'> & { rowSpan?: number; colSpan?: number; }) {
	return (
		<div role="gridcell" {...props} className={cn(`row-end-${rowSpan} col-end-${colSpan} h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0`, className)} />
	)
}
