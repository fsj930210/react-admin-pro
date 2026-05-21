import { type Column, type Table } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, EyeOff, X } from "lucide-react"
import { Button } from "@rap/components-ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@rap/components-ui/dropdown-menu"
import { useDataTable } from "../data-table"
import type { ComponentProps } from "react"

export type ColumnSortingProps<TData, TValue> = {
	column: Column<TData, TValue>;
	customRender?: (column: Column<TData, TValue>, table: Table<TData>) => React.ReactNode
} & ComponentProps<typeof DropdownMenu>

export function ColumnSorting<TData, TValue>({
	column,
	customRender,
	...rest
}: ColumnSortingProps<TData, TValue>) {
	const context = useDataTable()
	const canSort = column.getCanSort()
	const isSorted = column.getIsSorted()
	const enableMultiSort = context?.enableMultiSort ?? false
	const currentSortColumnRef = context?.currentSortColumnRef
	const table = context?.table

	const handleRemoveSort = () => {
		if (currentSortColumnRef) {
			currentSortColumnRef.current = column
		}
		if (table) {
			const currentSorting = table.getState().sorting
			const newSorting = currentSorting.filter(s => s.id !== column.id)
			table.setSorting(newSorting)
		}
	}

	const handleSortAsc = () => {
		if (currentSortColumnRef) {
			currentSortColumnRef.current = column
		}
		column.toggleSorting(false, enableMultiSort)
	}

	const handleSortDesc = () => {
		if (currentSortColumnRef) {
			currentSortColumnRef.current = column
		}
		column.toggleSorting(true, enableMultiSort)
	}
	if (customRender) {
		return customRender(column, table)
	}
	return (
		canSort && (
			<DropdownMenu {...rest}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 has-[>svg]:px-0 data-[state=open]:bg-accent"
					>
						{isSorted === "desc" ? (
							<ArrowDown className="size-3.5" />
						) : isSorted === "asc" ? (
							<ArrowUp className="size-3.5" />
						) : (
							<ChevronsUpDown className="size-3.5" />
						)}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start">
					{isSorted && (
						<DropdownMenuItem onClick={handleRemoveSort}>
							<X className="size-3.5" />
							Remove Sort
						</DropdownMenuItem>
					)}
					<DropdownMenuItem onClick={handleSortAsc}>
						<ArrowUp className="size-3.5" />
						Asc
					</DropdownMenuItem>
					<DropdownMenuItem onClick={handleSortDesc}>
						<ArrowDown className="size-3.5" />
						Desc
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
						<EyeOff className="size-3.5" />
						Hide
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		)
	)
}
