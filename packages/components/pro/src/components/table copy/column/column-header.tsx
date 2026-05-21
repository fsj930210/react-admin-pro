import { type Column, type Table } from "@tanstack/react-table"
import { cn } from "@rap/utils"
import { ColumnSorting, type ColumnSortingProps } from "./column-sorting"
import { ColumnFilter, type ColumnFilterProps } from "./column-filter"
import { useDataTable } from "../data-table"

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>
	title: string;
	sortingProps?: ColumnSortingProps<TData, TValue>;
	filterProps?: ColumnFilterProps<TData, TValue>;
	customRender?: (column: Column<TData, TValue>, table: Table<TData>) => React.ReactNode
}
export function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
	sortingProps,
	filterProps,
	customRender,
	...rest
}: DataTableColumnHeaderProps<TData, TValue>) {
	const { table } = useDataTable()
	if (customRender) {
		return customRender(column, table)
	}
	return (
		<div className={cn("flex items-center gap-2", className)} {...rest}>
			<span className="flex items-center">
				<span>{title}</span>
				<ColumnSorting column={column} {...sortingProps} />
			</span>
			<ColumnFilter column={column} {...filterProps} />
		</div>
	)
}
