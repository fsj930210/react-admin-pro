import { Button } from "@rap/components-ui/button";
import { FloatingLayer } from "@rap/components-ui/floating-layer";
import { Input } from "@rap/components-ui/input";
import { Choose, Otherwise, When } from "@rap/components-ui/when";
import { cn } from "@rap/utils";
import type { Column, Table } from "@tanstack/react-table";
import { Funnel } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
	const type = filter?.type ?? "input";
	const value = column.getFilterValue();
	const [draft, setDraft] = useState(String(value ?? ""));
	const isOptionFilter = type === "checkbox" || type === "radio" || type === "select" || type === "multiSelect";

	useEffect(() => {
		if (!open) setDraft(String(value ?? ""));
	}, [open, value]);

	return (
		<When condition={column.getCanFilter() && Boolean(filter)}>
			<Choose>
				<When condition={Boolean(filter?.render)}>
					{filter?.render?.({ column, table })}
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
								setOpen((next) => !next);
							}}
						>
							<Funnel className={cn("size-3.5", column.getIsFiltered() && "text-primary")} />
						</Button>
						<FloatingLayer
							align="end"
							className="w-52 rounded-md border bg-popover p-2 text-sm shadow-md"
							onOpenChange={setOpen}
							open={open}
							triggerRef={triggerRef}
						>
							<Choose>
								<When condition={isOptionFilter}>
									<div className="space-y-1">
										<MenuButton onClick={() => { column.setFilterValue(undefined); setOpen(false); }}>All</MenuButton>
										{filter?.options?.map((option) => (
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
								</When>
								<Otherwise>
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
								</Otherwise>
							</Choose>
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
			className="flex h-8 w-full items-center rounded-sm px-2 text-left hover:bg-accent"
			onClick={onClick}
		>
			{children}
		</button>
	);
}
