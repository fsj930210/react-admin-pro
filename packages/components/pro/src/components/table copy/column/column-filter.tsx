import { type Column, type Table } from "@tanstack/react-table"
import { Check, Funnel } from "lucide-react"
import { type ComponentProps, useEffect, useState } from "react"

import { cn } from "@rap/utils"
import { Button } from "@rap/components-ui/button"
import { Input } from "@rap/components-ui/input"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@rap/components-ui/dropdown-menu"
import type { ColumnMeta } from "../data-table"
import { useDataTable } from "../data-table"


const noLimitOption = { value: "__no_limit__", label: "不限" }

export type ColumnFilterProps<TData, TValue> = {
	column: Column<TData, TValue>
	customRender?: (column: Column<TData, TValue>, table: Table<TData>) => React.ReactNode;

} & ComponentProps<typeof DropdownMenu>

export function ColumnFilter<TData, TValue>({
	column,
	customRender,
	...rest
}: ColumnFilterProps<TData, TValue>) {
	const canFilter = column.columnDef.enableColumnFilter;
	const meta = column.columnDef.meta as ColumnMeta | undefined
	const filterType = meta?.filterType ?? "radio"
	const enableNoLimit = meta?.enableFilterNoLimitOption ?? true
	const filterOptions = meta?.filterOptions

	const { table, currentFilterColumnRef } = useDataTable()

	const [isOpen, setIsOpen] = useState(false)
	const [inputValue, setInputValue] = useState<string>(column.getFilterValue() as string ?? '')

	const columnFilterValue = column.getFilterValue() as string | undefined
	const options = filterOptions ?? []
	const renderedFilterOptions = enableNoLimit ? [noLimitOption, ...options] : options

	const isFiltered = column.getIsFiltered();

	const handleOptionClick = (optionValue: string | number) => {
		if (currentFilterColumnRef) {
			currentFilterColumnRef.current = column
		}
		if (filterType === "checkbox") {
			if (optionValue === noLimitOption.value) {
				column.setFilterValue(undefined)
			} else {
				const currentValues = (column.getFilterValue() as (string | number)[]).filter(v => v !== noLimitOption.value)
				const isSelected = currentValues.includes(optionValue)
				const newValues = isSelected
					? currentValues.filter(v => v !== optionValue)
					: [...currentValues, optionValue]

				if (newValues.length === 0) {
					column.setFilterValue(undefined)
				} else {
					column.setFilterValue(newValues)
				}
			}
		} else {
			if (optionValue === noLimitOption.value) {
				column.setFilterValue(undefined)
			} else {
				column.setFilterValue(optionValue)
			}
		}
		setIsOpen(false)
	}

	const handleInputChange = (value: string) => {
		setInputValue(value)
	}

	const handleInputKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			if (currentFilterColumnRef) {
				currentFilterColumnRef.current = column
			}
			column.setFilterValue(inputValue || undefined)
			setIsOpen(false)
		}
	}

	useEffect(() => {
		const value = column.getFilterValue() as string | undefined
		setInputValue(value ?? '')
	}, [columnFilterValue])

	if (!canFilter) return null



	return (
		<DropdownMenu {...rest} open={isOpen} onOpenChange={setIsOpen}>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="size-3.5 has-[>svg]:px-0 focus-visible:border-none"
				>
					<Funnel className={cn("size-3.5", isFiltered && "text-table-filter-active")} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align="start"
				className="w-[180px] p-2"
			>
				{
					filterType === "custom" && customRender && customRender(column, table as Table<TData>)
				}
				{
					filterType === "input" && (
						<Input
							type="text"
							value={inputValue}
							onChange={(e) => handleInputChange(e.target.value)}
							onKeyDown={handleInputKeyDown}
							className="h-8 text-xs w-full"
							placeholder="筛选（回车关闭）"
						/>
					)
				}
				{
					(filterType === "checkbox" || filterType === "radio") && (
						<ul className="list-none m-0 p-0 space-y-0">
							{renderedFilterOptions.map((option) => {
								const isSelected = filterType === "checkbox" ? (column.getFilterValue() as (string | number)[])?.includes?.(option.value) : column.getFilterValue() === option.value
								return (
									<li
										key={option.value}
										className={cn(
											"w-full p-2 text-sm cursor-pointer flex items-center justify-between rounded-md",
											"hover:bg-accent hover:text-accent-foreground",
											isSelected && "bg-accent text-accent-foreground"
										)}
										onClick={() => handleOptionClick(option.value)}
									>
										<span>
											{option.label}
										</span>
										<Check className={cn(
											"size-3.5",
											isSelected ? "opacity-100" : "opacity-0"
										)}
										/>
									</li>
								)
							})}
						</ul>
					)
				}

			</DropdownMenuContent>
		</DropdownMenu>
	)
}
