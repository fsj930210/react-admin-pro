"use client"

import { type Table } from "@tanstack/react-table"
import { GripVertical } from "lucide-react"
import { useState } from "react"

import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
} from "@rap/components-ui/sortable"
import {
  Listbox,
  ListboxItem,
  ListboxItemIndicator,
} from "@rap/components-ui/listbox"

export function DataTableViewOptions<TData>({
  table,
}: {
  table: Table<TData>
}) {
  /** 获取所有可隐藏的列 */
  const allColumns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide(),
    )

  /** 列项接口 */
  interface ColumnItem {
    id: string
  }

  /** 当前列的状态列表 */
  const columnItems: ColumnItem[] = allColumns.map((column) => ({
    id: column.id,
  }))

  /** 当前选中的列（可见的列） */
  const [selectedIds, setSelectedIds] = useState<string[]>(
    allColumns.filter((c) => c.getIsVisible()).map((c) => c.id),
  )

  /** 处理列顺序变更 */
  const handleColumnReorder = (items: ColumnItem[]) => {
    const newOrder = items.map((item) => item.id)
    table.setColumnOrder(newOrder)
  }

  /** 处理列可见性变更 */
  const handleSelectionChange = (value: string[]) => {
    setSelectedIds(value)
    allColumns.forEach((column) => {
      const isVisible = value.includes(column.id)
      if (column.getIsVisible() !== isVisible) {
        column.toggleVisibility(isVisible)
      }
    })
  }

  return (
    <Listbox
      multiple
      value={selectedIds}
      onValueChange={handleSelectionChange}
      className="p-4 w-[200px]"
    >
      <Sortable
        value={columnItems}
        getItemValue={(item) => item.id}
        onValueChange={handleColumnReorder}
        orientation="vertical"
      >
        <SortableContent className="flex flex-col gap-1">
          {columnItems.map((item) => (
            <SortableItem
              key={item.id}
              value={item.id}
              asHandle
              className="flex items-center"
            >
              <SortableItemHandle className="mr-2 cursor-grab opacity-40 hover:opacity-100 transition-opacity">
                <GripVertical className="size-4 text-muted-foreground" />
              </SortableItemHandle>
              <ListboxItem value={item.id} className="flex-1 cursor-pointer">
                <span className="capitalize truncate">{item.id}</span>
                <ListboxItemIndicator />
              </ListboxItem>
            </SortableItem>
          ))}
        </SortableContent>
      </Sortable>
    </Listbox>
  )
}
