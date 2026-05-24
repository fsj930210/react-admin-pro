import { Button } from "@rap/components-ui/button";
import { Input } from "@rap/components-ui/input";
import { cn } from "@rap/utils";
import type { Column, Table } from "@tanstack/react-table";
import { Funnel } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function ColumnFilter<TData>({
	column,
	table,
}: {
	column: Column<TData, unknown>;
	table: Table<TData>;
}) {
	const filter = column.columnDef.meta?.filter;
	const [open, setOpen] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ left: 0, top: 0 });
	const type = filter?.type ?? "input";
	const value = column.getFilterValue();
	const [draft, setDraft] = useState(String(value ?? ""));
	const isOptionFilter = type === "checkbox" || type === "radio" || type === "select" || type === "multiSelect";

	useEffect(() => {
		if (!open) setDraft(String(value ?? ""));
	}, [open, value]);

	useEffect(() => {
		if (!open) return;
		const trigger = triggerRef.current;
		if (!trigger) return;
		const rect = trigger.getBoundingClientRect();
		setPosition({ left: Math.max(8, rect.right - 208), top: rect.bottom + 4 });

		const closeOnOutsidePointerDown = (event: PointerEvent) => {
			const target = event.target as Node | null;
			if (trigger.contains(target) || panelRef.current?.contains(target)) return;
			setOpen(false);
		};
		document.addEventListener("pointerdown", closeOnOutsidePointerDown);
		return () => document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
	}, [open]);

	if (!column.getCanFilter() || !filter) return null;
	if (filter.render) return filter.render({ column, table });

	return (
		<div className="shrink-0">
			<Button
				ref={triggerRef}
				type="button"
				variant="ghost"
				size="icon"
				className={cn("size-7", open && "bg-accent")}
				onClick={(event) => {
					event.stopPropagation();
					setOpen((next) => !next);
				}}
			>
				<Funnel className={cn("size-3.5", column.getIsFiltered() && "text-primary")} />
			</Button>
			{open ? createPortal(
				<div
					ref={panelRef}
					className="fixed z-[100] w-52 rounded-md border bg-popover p-2 text-sm shadow-md"
					style={{ left: position.left, top: position.top }}
					onMouseDown={(event) => event.stopPropagation()}
				>
					{isOptionFilter ? (
						<div className="space-y-1">
							<MenuButton onClick={() => { column.setFilterValue(undefined); setOpen(false); }}>All</MenuButton>
							{filter.options?.map((option) => (
								<MenuButton
									key={String(option.value)}
									onClick={() => {
										if (type === "checkbox" || type === "multiSelect") {
											const current = Array.isArray(value) ? value : [];
											column.setFilterValue(
												current.includes(option.value)
													? current.filter((item) => item !== option.value)
													: [...current, option.value],
											);
											return;
										}
										column.setFilterValue(option.value);
										setOpen(false);
									}}
								>
									{option.label}
								</MenuButton>
							))}
						</div>
					) : (
						<Input
							autoFocus
							className="h-8"
							value={draft}
							placeholder="Filter"
							onChange={(event) => setDraft(event.target.value)}
							onBlur={() => column.setFilterValue(draft || undefined)}
							onKeyDown={(event) => {
								if (event.key === "Enter") {
									column.setFilterValue(draft || undefined);
									setOpen(false);
								}
							}}
						/>
					)}
				</div>,
				document.body,
			) : null}
		</div>
	);
}

function MenuButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
	return (
		<button
			type="button"
			className="flex h-8 w-full items-center rounded-sm px-2 text-left hover:bg-accent"
			onClick={onClick}
		>
			{children}
		</button>
	);
}
