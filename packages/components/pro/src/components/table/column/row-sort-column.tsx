

import { Button } from "@rap/components-ui/button";
import { ROW_SORT_COLUMN } from "../utils/constants";
import { GripVertical } from "lucide-react";
import type { RefObject } from "react";
import type { CellContext, ColumnDef } from "@tanstack/react-table";

interface RowSortCellProps<TData> extends CellContext<TData, unknown> {
	handleRef?: RefObject<HTMLButtonElement>;
}

export function createRowSortColumn<TData>(): ColumnDef<TData> {
	return {
		id: ROW_SORT_COLUMN,
		size: 40,
		header: () => <div>移动</div>,
		cell: ({ handleRef }: RowSortCellProps<TData>) => (
			<Button size="icon" variant="ghost" ref={handleRef}>
				<GripVertical />
			</Button>
		),
		enableSorting: false,
		enableHiding: false,
	}
}