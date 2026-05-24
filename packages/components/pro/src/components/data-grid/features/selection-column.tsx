import { Checkbox } from "@rap/components-ui/checkbox";
import type { ColumnDef, Row, Table } from "@tanstack/react-table";
import { Circle } from "lucide-react";
import type { DataGridRowSelectionConfig } from "../types";

export const DATA_GRID_SELECTION_COLUMN_ID = "__rap_data_grid_selection__";

export function createSelectionColumn<TData>(
	config: DataGridRowSelectionConfig<TData>,
): ColumnDef<TData> {
	const type = config.type ?? "checkbox";

	return {
		id: DATA_GRID_SELECTION_COLUMN_ID,
		size: config.columnWidth ?? 48,
		header: ({ table }: { table: Table<TData> }) => {
			if (type === "radio" || config.hideSelectAll) {
				return config.columnTitle ?? null;
			}

			const checked = table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate");
			return (
				<div className="flex items-center gap-2">
					<Checkbox
						checked={checked}
						aria-label="Select all rows"
						onCheckedChange={(value) => {
							const rows = table.getRowModel().rows;
							const before = new Set(table.getSelectedRowModel().rows.map((row) => row.id));
							table.toggleAllPageRowsSelected(!!value);
							const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original);
							const changeRows = rows
								.filter((row) => before.has(row.id) !== !!value)
								.map((row) => row.original);
							config.onSelectAll?.(!!value, selectedRows, changeRows);
						}}
					/>
					{config.columnTitle}
				</div>
			);
		},
		cell: ({ row, table }: { row: Row<TData>; table: Table<TData> }) => {
			const checkboxProps = config.getCheckboxProps?.(row.original);
			const checked = row.getIsSelected() || (row.getIsSomeSelected() && "indeterminate");
			const disabled = checkboxProps?.disabled || (config.enableRowSelection ? !config.enableRowSelection(row) : false);
			const onChange = (value: boolean) => {
				row.toggleSelected(value);
				config.onSelect?.(
					row.original,
					value,
					table.getSelectedRowModel().rows.map((selectedRow) => selectedRow.original),
				);
			};

			if (type === "radio") {
				return (
					<Checkbox
						{...checkboxProps}
						checked={row.getIsSelected()}
						disabled={disabled}
						aria-label="Select row"
						className="aspect-square size-4 shrink-0 rounded-full"
						onCheckedChange={(value) => onChange(!!value)}
					>
						{row.getIsSelected() ? <Circle className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 fill-current" /> : null}
					</Checkbox>
				);
			}

			return (
				<Checkbox
					{...checkboxProps}
					checked={checked}
					disabled={disabled}
					aria-label="Select row"
					onCheckedChange={(value) => onChange(!!value)}
				/>
			);
		},
		enableHiding: false,
		enableSorting: false,
		enableColumnFilter: false,
		meta: {
			pinned: config.fixed ?? "left",
		},
	};
}
