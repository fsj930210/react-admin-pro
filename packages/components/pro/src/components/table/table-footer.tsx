import { TableFooter } from "@rap/components-ui/table"
import { type Table } from "@tanstack/react-table"
import type { ReactNode } from "react"


type DataTableFooterProps<TData> = {
	children?: (table: Table<TData>) => ReactNode
	table: Table<TData>
}
export function DataTableFooter<TData>(props: DataTableFooterProps<TData>) {
	const { table, children } = props
	return children ? (
		<TableFooter>
			{children(table)}
		</TableFooter>
	) : null
}
