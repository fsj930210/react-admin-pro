import { Button } from "@rap/components-ui/button";
import { cn } from "@rap/utils";
import type { Column, Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export function ColumnSort<TData>({
	column,
	table,
}: {
	column: Column<TData, unknown>;
	table: Table<TData>;
}) {
	const custom = column.columnDef.meta?.sort?.render;
	const [open, setOpen] = useState(false);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const panelRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState({ left: 0, top: 0 });
	const sorted = column.getIsSorted();

	useEffect(() => {
		if (!open) return;
		const trigger = triggerRef.current;
		if (!trigger) return;
		const rect = trigger.getBoundingClientRect();
		setPosition({ left: Math.max(8, rect.right - 128), top: rect.bottom + 4 });

		const closeOnOutsidePointerDown = (event: PointerEvent) => {
			const target = event.target as Node | null;
			if (trigger.contains(target) || panelRef.current?.contains(target)) return;
			setOpen(false);
		};
		document.addEventListener("pointerdown", closeOnOutsidePointerDown);
		return () => document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
	}, [open]);

	if (!column.getCanSort()) return null;
	if (custom) return custom({ column, table });

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
					setOpen((value) => !value);
				}}
			>
				{sorted === "asc" ? <ArrowUp className="size-3.5" /> : sorted === "desc" ? <ArrowDown className="size-3.5" /> : <ChevronsUpDown className="size-3.5" />}
			</Button>
			{open ? createPortal(
				<div
					ref={panelRef}
					className="fixed z-[100] min-w-32 rounded-md border bg-popover p-1 text-sm shadow-md"
					style={{ left: position.left, top: position.top }}
					onMouseDown={(event) => event.stopPropagation()}
				>
					<MenuButton onClick={() => { column.toggleSorting(false, table.options.enableMultiSort); setOpen(false); }}>
						<ArrowUp className="size-3.5" />
						Asc
					</MenuButton>
					<MenuButton onClick={() => { column.toggleSorting(true, table.options.enableMultiSort); setOpen(false); }}>
						<ArrowDown className="size-3.5" />
						Desc
					</MenuButton>
					<MenuButton onClick={() => { column.clearSorting(); setOpen(false); }}>Clear sort</MenuButton>
					<MenuButton onClick={() => { column.toggleVisibility(false); setOpen(false); }}>
						<EyeOff className="size-3.5" />
						Hide
					</MenuButton>
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
			className="flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left hover:bg-accent"
			onClick={onClick}
		>
			{children}
		</button>
	);
}
