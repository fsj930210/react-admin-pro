import { Button } from "@rap/components-ui/button";
import type { Column, Table } from "@tanstack/react-table";
import { ArrowDown, ArrowRight, ArrowUp, EyeOff, Pin, PinOff } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

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
	const menuRef = useRef<HTMLDivElement>(null);
	const leafColumns = table.getAllLeafColumns().filter((item) => item.getCanHide());
	const left = Math.min(menu.x, window.innerWidth - 240);
	const top = Math.min(menu.y, window.innerHeight - 320);

	useEffect(() => {
		const closeOnOutsidePointerDown = (event: PointerEvent) => {
			const target = event.target as Node | null;
			if (menuRef.current?.contains(target)) return;
			onClose();
		};
		document.addEventListener("pointerdown", closeOnOutsidePointerDown);
		return () => document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
	}, [onClose]);

	if (render) {
		return createPortal(
			<div
				ref={menuRef}
				className="fixed z-[110]"
				style={{ left, top }}
			>
				{render({ type: "header", table, column, close: onClose })}
			</div>,
			document.body,
		);
	}

	return createPortal(
		<div
			ref={menuRef}
			className="fixed z-[110] w-56 rounded-md border bg-popover p-1 text-sm shadow-md"
			style={{ left, top }}
		>
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

			<SubMenu label="Column visibility">
				<div className="max-h-56 min-w-52 overflow-auto p-1">
					{leafColumns.map((item) => (
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
			</SubMenu>
		</div>,
		document.body,
	);
}

function SubMenu({
	children,
	disabled,
	label,
}: {
	children: React.ReactNode;
	disabled?: boolean;
	label: string;
}) {
	return (
		<div className="group/submenu relative">
			<button
				type="button"
				disabled={disabled}
				className="flex h-8 w-full items-center justify-between rounded-sm px-2 text-left hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
			>
				<span>{label}</span>
				<ArrowRight className="size-3.5 text-muted-foreground" />
			</button>
			<div className="invisible absolute top-0 left-full z-[111] ml-1 min-w-36 rounded-md border bg-popover p-1 opacity-0 shadow-md group-hover/submenu:visible group-hover/submenu:opacity-100">
				{children}
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
		<Button
			type="button"
			variant="ghost"
			size="sm"
			disabled={disabled}
			className="h-8 w-full justify-start gap-2 px-2"
			onClick={onClick}
		>
			{icon}
			{children}
		</Button>
	);
}
