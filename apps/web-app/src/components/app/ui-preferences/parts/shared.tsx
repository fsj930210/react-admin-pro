import type { ReactNode } from "react";

export const selectContentClassName = "z-[120]";
export const controlClassName = "w-full";
export const numberInputClassName =
	"h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";
export const textInputClassName =
	"h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

export function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="space-y-3">
			<h3 className="text-sm font-semibold">{title}</h3>
			<div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2">{children}</div>
		</section>
	);
}

export function Field({
	label,
	description,
	children,
}: {
	label: string;
	description?: string;
	children: ReactNode;
}) {
	return (
		<div className="flex min-h-20 flex-col justify-between gap-2 rounded-md border border-border/60 bg-muted/20 p-3 text-sm">
			<div className="min-w-0">
				<div className="truncate text-foreground">{label}</div>
				{description && <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>}
			</div>
			<div className="flex w-full justify-end">{children}</div>
		</div>
	);
}
