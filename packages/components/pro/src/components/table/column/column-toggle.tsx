"use client"

import { useDataTable } from "../data-table"
import { useState } from "react"
import { GripVertical, Check, RefreshCw } from "lucide-react"
import { Button } from "@rap/components-ui/button"
import { Input } from "@rap/components-ui/input"
import {
	Sortable,
	SortableContent,
	SortableItem,
	SortableItemHandle,
} from "@rap/components-ui/sortable"

export function DataTableViewOptions() {
	const { table } = useDataTable()

	const allColumns = table.getAllColumns().filter(column =>
		typeof column.accessorFn !== "undefined" && column.getCanHide()
	)

	const [searchTerm, setSearchTerm] = useState("")
	const [, forceUpdate] = useState({})

	const getColumnItems = () => {
		const order = table.getState().columnOrder.length > 0
			? table.getState().columnOrder
			: allColumns.map(c => c.id)
		return [...allColumns]
			.map(col => {
				let headerText = col.id
				const header = col.columnDef.header
				if (typeof header === "string") {
					headerText = header
				} else if ((col.columnDef.meta as Record<string, unknown>)?.title) {
					headerText = (col.columnDef.meta as Record<string, unknown>).title as string
				}
				return { id: col.id, header: headerText }
			})
			.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
	}

	const handleColumnReorder = (items: { id: string }[]) => {
		const newOrder = items.map((item) => item.id)
		table.setColumnOrder(newOrder)
		forceUpdate({})
	}

	const handleToggleVisibility = (columnId: string) => {
		const column = allColumns.find(c => c.id === columnId)
		if (column) {
			column.toggleVisibility()
		}
	}

	const handleResetOrder = () => {
		const defaultOrder = allColumns.map(c => c.id)
		table.setColumnOrder(defaultOrder)
	}

	const getColumnById = (id: string) => allColumns.find(c => c.id === id)

	const getFilteredItems = () => {
		const items = getColumnItems()
		if (!searchTerm) return items
		return items.filter(item =>
			item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			(item.header && item.header.toLowerCase().includes(searchTerm.toLowerCase()))
		)
	}

	return (
		<div className="w-[200px] max-h-[300px] overflow-y-auto p-2 space-y-2">
			<Input
				type="text"
				placeholder="Search columns..."
				value={searchTerm}
				onChange={(e) => setSearchTerm(e.target.value)}
				className="text-sm"
			/>

			<Sortable
				value={getColumnItems()}
				getItemValue={(item) => item.id}
				onValueChange={handleColumnReorder}
				orientation="vertical"
			>
				<SortableContent className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
					{getFilteredItems().map((item) => {
						const column = getColumnById(item.id)
						if (!column) return null
						return (
							<SortableItem
								key={item.id}
								value={item.id}
								className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors"
							>
								<SortableItemHandle className="cursor-grab active:cursor-grabbing opacity-40 hover:opacity-100">
									<GripVertical className="size-3.5 text-muted-foreground" />
								</SortableItemHandle>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => handleToggleVisibility(item.id)}
									className="flex-1 justify-between hover:bg-transparent"
								>
									<span className="truncate">{item.header}</span>
									{column.getIsVisible() && (
										<Check className="size-3.5 text-foreground" />
									)}
								</Button>
							</SortableItem>
						)
					})}
				</SortableContent>
			</Sortable>

			<div className="border-t pt-2">
				<Button
					variant="outline"
					size="sm"
					className="w-full gap-2"
					onClick={handleResetOrder}
				>
					<RefreshCw className="size-3.5" />
					Reset Column Order
				</Button>
			</div>
		</div>
	)
}
