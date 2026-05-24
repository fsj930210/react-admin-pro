import { Checkbox } from "@rap/components-ui/checkbox";
import type { ColumnDef, Row, Table } from "@tanstack/react-table";
import { Circle } from "lucide-react";
import type { CreateColumnFactory, RowSelectionConfig } from "../types";
import { ROW_SELECTION_COLUMN } from "../utils/constants";


function createRowSelectionColumn<TData>(
	config: RowSelectionConfig<TData>
): ColumnDef<TData> {
	const {
		type = "checkbox",
		title,
		enableSelectAll = true,
		size = 40,
		enableRowSelection,
		onSelect,
		onSelectAll,
	} = config;

	return {
		id: ROW_SELECTION_COLUMN,
		header: ({ table }: { table: Table<TData> }) => {
			const isAllSelected = table.getIsAllPageRowsSelected();
			const isSomeSelected = table.getIsSomePageRowsSelected();

			const handleSelectAll = (value: boolean) => {
				const currentPageRows = table.getRowModel().rows;
				const previousStates = currentPageRows.map((r) => r.getIsSelected());
				table.toggleAllPageRowsSelected(value);
				if (onSelectAll) {
					const selectedRows = currentPageRows
						.filter((r) => r.getIsSelected())
						.map((r) => r.original);
					const changeRows = currentPageRows
						.filter((r, index) => r.getIsSelected() !== previousStates[index])
						.map((r) => r.original);
					onSelectAll(value, selectedRows, changeRows);
				}
			};

			if (type === "radio") {
				return title ? <div className="text-sm font-medium">{title}</div> : null;
			}

			return (
				<div className="flex items-center gap-2">
					<Checkbox
						checked={isAllSelected || (isSomeSelected && "indeterminate")}
						onCheckedChange={(value) => handleSelectAll(!!value)}
						aria-label="Select all"
						disabled={!enableSelectAll}
						className="cursor-pointer z-2"
						onPointerDownCapture={(e) => e.stopPropagation()}
					/>
					{title && <span className="text-sm font-medium">{title}</span>}
				</div>
			);
		},
		cell: ({ row, table }: { row: Row<TData>; table: Table<TData> }) => {
			const isSelected = row.getIsSelected();
			const handleSelect = (value: boolean) => {
				row.toggleSelected(value);

				if (onSelect) {
					const selectedRows = table.getRowModel().rows
						.filter((item) => item.id === row.id ? value : item.getIsSelected())
						.map((r) => r.original);
					onSelect(row.original, value, selectedRows);
				}
			};

			if (type === "radio") {
				return (
					<Checkbox
						checked={isSelected}
						onCheckedChange={(value) => handleSelect(!!value)}
						aria-label="Select row"
						className="aspect-square size-4 shrink-0 rounded-full border border-input text-primary shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
						disabled={enableRowSelection ? !enableRowSelection(row) : false}
					>
						{isSelected && (
							<Circle className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full fill-primary-foreground" />
						)}
					</Checkbox>
				);
			}

			return (
				<Checkbox
					checked={isSelected}
					onCheckedChange={(value) => handleSelect(!!value)}
					aria-label="Select row"
					disabled={enableRowSelection ? !enableRowSelection(row) : false}
					className="cursor-pointer z-2"
				/>
			);
		},
		size,
		enableSorting: false,
		enableHiding: false,
	};
}

export function createRowSelectionColumnFactory<TData>(): CreateColumnFactory<TData> {
	return {
		shouldCreate: (config) => !!config?.rowSelection?.enable,
		create: (config) => createRowSelectionColumn<TData>(config.rowSelection! || {}),
		position: "prepend",
	}
}
