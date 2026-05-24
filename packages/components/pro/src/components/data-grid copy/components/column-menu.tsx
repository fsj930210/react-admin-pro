"use client"

import type { Column, Table } from "@tanstack/react-table";
import {
	ArrowDown,
	ArrowUp,
	Columns3,
	EyeOff,
	Funnel,
	MoreHorizontal,
	Pin,
	PinOff,
	X,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@rap/components-ui/dropdown-menu";
import { cn } from "@rap/utils";
import { ColumnFilterPanel } from "./column-filter-panel";
import type { ColumnMenuConfig } from "../types";

interface ColumnMenuProps<TData, TValue> {
	column: Column<TData, TValue>;
	table: Table<TData>;
	config?: ColumnMenuConfig;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	children?: React.ReactNode;
}

export function ColumnMenu<TData, TValue>({
	column,
	table,
	config,
	open,
	onOpenChange,
	children,
}: ColumnMenuProps<TData, TValue>) {
	const meta = column.columnDef.meta;
	const menuMeta = meta?.menu;
	const menuEnabled = config?.enable ?? true;

	if (!menuEnabled || menuMeta?.enable === false) {
		return null;
	}

	const showPin = (menuMeta?.pin ?? config?.pin ?? true) && column.getCanPin();
	const showSort = (menuMeta?.sort ?? config?.sort ?? true) && column.getCanSort();
	const showFilter = (menuMeta?.filter ?? config?.filter ?? true) && column.getCanFilter();
	const showVisibility = (menuMeta?.visibility ?? config?.visibility ?? true);
	const hideable = meta?.visibility?.hideable ?? column.getCanHide();

	return (
		<DropdownMenu open={open} onOpenChange={onOpenChange}>
			{children ? (
				<DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
			) : (
				<DropdownMenuTrigger
					className={cn(
						"inline-flex size-6 shrink-0 items-center justify-center rounded-md",
						"opacity-0 outline-none transition-opacity hover:bg-accent hover:text-accent-foreground",
						"focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
						"group-hover/th:opacity-100 data-[state=open]:opacity-100",
					)}
					onPointerDownCapture={(event) => event.stopPropagation()}
					onClick={(event) => event.stopPropagation()}
				>
					<MoreHorizontal className="size-3.5" />
				</DropdownMenuTrigger>
			)}
			<DropdownMenuContent align="start" className="min-w-48">
				{showPin ? (
					<>
						<DropdownMenuItem onClick={() => column.pin("left")}>
							<Pin className="size-3.5" />
							Pin left
						</DropdownMenuItem>
						<DropdownMenuItem onClick={() => column.pin("right")}>
							<Pin className="size-3.5" />
							Pin right
						</DropdownMenuItem>
						{column.getIsPinned() ? (
							<DropdownMenuItem onClick={() => column.pin(false)}>
								<PinOff className="size-3.5" />
								Unpin
							</DropdownMenuItem>
						) : null}
						<DropdownMenuSeparator />
					</>
				) : null}
				{showSort ? (
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<ArrowUp className="size-3.5" />
							Sort
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuItem onClick={() => column.toggleSorting(false)}>
								<ArrowUp className="size-3.5" />
								Asc
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => column.toggleSorting(true)}>
								<ArrowDown className="size-3.5" />
								Desc
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => column.clearSorting()}>
								<X className="size-3.5" />
								Clear sort
							</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				) : null}
				{showFilter ? (
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<Funnel className="size-3.5" />
							Filter
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent className="p-0">
							<ColumnFilterPanel column={column} />
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				) : null}
				{showVisibility ? (
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>
							<Columns3 className="size-3.5" />
							Columns
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent className="max-h-72 min-w-52 overflow-y-auto">
							{table.getAllLeafColumns().map((leafColumn) => {
								const leafMeta = leafColumn.columnDef.meta;
								const leafHideable = leafMeta?.visibility?.hideable ?? leafColumn.getCanHide();
								return (
									<DropdownMenuCheckboxItem
										key={leafColumn.id}
										checked={leafColumn.getIsVisible()}
										disabled={!leafHideable}
										onCheckedChange={(checked) => leafColumn.toggleVisibility(!!checked)}
										onSelect={(event) => event.preventDefault()}
									>
										{leafMeta?.title ?? leafColumn.id}
									</DropdownMenuCheckboxItem>
								);
							})}
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				) : null}
				{hideable ? (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
							<EyeOff className="size-3.5" />
							Hide
						</DropdownMenuItem>
					</>
				) : null}
				{menuMeta?.renderItems?.({ column, table })}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
