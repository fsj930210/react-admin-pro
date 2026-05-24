import { FloatingLayer } from "@rap/components-ui/floating-layer";
import { Choose, Otherwise, When } from "@rap/components-ui/when";
import { cn } from "@rap/utils";
import type { Column, Table } from "@tanstack/react-table";
import { ArrowDown, ArrowRight, ArrowUp, EyeOff, Pin, PinOff } from "lucide-react";
import { useState, type ReactNode } from "react";

export interface HeaderContextMenuState<TData> {
	x: number;
	y: number;
	column: Column<TData>;
}

export function GridContextMenu<TData>({
	table,
	menu,
	render,
	onClose,
}: {
	table: Table<TData>;
	menu: HeaderContextMenuState<TData>;
	render?: (ctx: {
		type: "header";
		table: Table<TData>;
		column: Column<TData>;
		close: () => void;
	}) => ReactNode;
	onClose: () => void;
}) {
	const column = menu.column;

	return (
		<FloatingLayer
			onOpenChange={(open) => { if (!open) onClose(); }}
			open
			point={{ x: menu.x, y: menu.y }}
		>
			<Choose>
				<When condition={Boolean(render)}>
					{render?.({ type: "header", table, column, close: onClose })}
				</When>
				<Otherwise>
					<div className="w-56 rounded-md border bg-popover p-1 text-sm shadow-md">
						<MenuButton onClick={() => { column.pin("left"); onClose(); }} icon={<Pin className="size-3.5" />}>Pin left</MenuButton>
						<MenuButton onClick={() => { column.pin("right"); onClose(); }} icon={<Pin className="size-3.5" />}>Pin right</MenuButton>
						<MenuButton onClick={() => { column.pin(false); onClose(); }} icon={<PinOff className="size-3.5" />}>Unpin</MenuButton>
						<MenuButton onClick={() => { column.toggleVisibility(false); onClose(); }} icon={<EyeOff className="size-3.5" />}>Hide</MenuButton>

						<div className="my-1 border-t" />
						<SubMenu label="Sort" disabled={!column.getCanSort()}>
							<MenuButton disabled={!column.getCanSort()} onClick={() => { column.toggleSorting(false); onClose(); }} icon={<ArrowUp className="size-3.5" />}>Asc</MenuButton>
							<MenuButton disabled={!column.getCanSort()} onClick={() => { column.toggleSorting(true); onClose(); }} icon={<ArrowDown className="size-3.5" />}>Desc</MenuButton>
							<MenuButton disabled={!column.getCanSort()} onClick={() => { column.clearSorting(); onClose(); }}>Clear sort</MenuButton>
						</SubMenu>

						<SubMenu label="Column visibility" renderContent={() => (
							<div className="max-h-56 min-w-52 overflow-auto p-1">
								{table.getAllLeafColumns().filter((item) => item.getCanHide()).map((item) => (
									<label key={item.id} className="flex h-8 cursor-pointer items-center gap-2 rounded px-2 hover:bg-accent">
										<input
											type="checkbox"
											checked={item.getIsVisible()}
											onChange={(event) => item.toggleVisibility(event.target.checked)}
										/>
										<span className="truncate">{String(item.columnDef.header ?? item.id)}</span>
									</label>
								))}
							</div>
						)} />
					</div>
				</Otherwise>
			</Choose>
		</FloatingLayer>
	);
}

function SubMenu({
	children,
	disabled,
	label,
	renderContent,
}: {
	children?: React.ReactNode;
	disabled?: boolean;
	label: string;
	renderContent?: () => React.ReactNode;
}) {
	const [open, setOpen] = useState(false);

	return (
		<div
			className="group/submenu relative"
			onPointerEnter={() => setOpen(true)}
			onPointerLeave={() => setOpen(false)}
		>
			<button
				type="button"
				disabled={disabled}
				className="flex h-8 w-full items-center justify-between rounded-sm px-2 text-left hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
			>
				<span>{label}</span>
				<ArrowRight className="size-3.5 text-muted-foreground" />
			</button>
			<div className="invisible absolute top-0 left-full z-[111] min-w-36 pl-1 opacity-0 group-hover/submenu:visible group-hover/submenu:opacity-100">
				<div className="rounded-md border bg-popover p-1 shadow-md">
					<Choose>
						<When condition={Boolean(renderContent) && open}>
							{renderContent?.()}
						</When>
						<Otherwise>
							{children}
						</Otherwise>
					</Choose>
				</div>
			</div>
		</div>
	);
}

function MenuButton({
	children,
	icon,
	disabled,
	onClick,
}: {
	children: React.ReactNode;
	icon?: React.ReactNode;
	disabled?: boolean;
	onClick?: () => void;
}) {
	return (
		<button
			type="button"
			disabled={disabled}
			className={cn(
				"flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left hover:bg-accent",
				disabled && "pointer-events-none opacity-50",
			)}
			onClick={onClick}
		>
			{icon}
			{children}
		</button>
	);
}
