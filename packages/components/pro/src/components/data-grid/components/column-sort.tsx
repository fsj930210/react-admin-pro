import { Button } from "@rap/components-ui/button";
import { FloatingLayer } from "@rap/components-ui/floating-layer";
import { Choose, Otherwise, When } from "@rap/components-ui/when";
import { cn } from "@rap/utils";
import type { Column, Table } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff } from "lucide-react";
import { useRef, useState } from "react";

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
	const sorted = column.getIsSorted();

	return (
		<When condition={column.getCanSort()}>
			<Choose>
				<When condition={Boolean(custom)}>
					{custom?.({ column, table })}
				</When>
				<Otherwise>
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
							<Choose>
								<When condition={sorted === "asc"}>
									<ArrowUp className="size-3.5" />
								</When>
								<When condition={sorted === "desc"}>
									<ArrowDown className="size-3.5" />
								</When>
								<Otherwise>
									<ChevronsUpDown className="size-3.5" />
								</Otherwise>
							</Choose>
						</Button>
						<FloatingLayer
							align="end"
							className="min-w-32 rounded-md border bg-popover p-1 text-sm shadow-md"
							onOpenChange={setOpen}
							open={open}
							triggerRef={triggerRef}
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
						</FloatingLayer>
					</div>
				</Otherwise>
			</Choose>
		</When>
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
