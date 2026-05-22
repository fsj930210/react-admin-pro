
import type { CellContext, ColumnDef } from "@tanstack/react-table";
import { GripVertical } from "lucide-react";
import type { CreateColumnFactory, RowOrderConfig } from "../types";
import type { RefObject } from "react";
import { Button } from "@rap/components-ui/button";
import { ROW_ORDER_HANDLE_COLUMN } from "../utils/constants";




interface RowOrderHandleCellProps<TData> extends CellContext<TData, unknown> {
	handleRef?: RefObject<HTMLButtonElement>;
}

function createRowOrderHandleColumn<TData>(config: RowOrderConfig): ColumnDef<TData> {
	return {
		id: ROW_ORDER_HANDLE_COLUMN,
		size: config.handleColumn?.size || 40,
		header: () => config.handleColumn?.title ? <div>{config.handleColumn?.title}</div> : null,
		cell: ({ handleRef }: RowOrderHandleCellProps<TData>) => (
			<Button size="icon" variant="ghost" ref={handleRef}>
				<GripVertical />
			</Button>
		),
		enableSorting: false,
		enableHiding: false,
	}
}

export function createRowOrderHandleColumnFactory<TData>(): CreateColumnFactory<TData> {
	return {
		shouldCreate: (config) => !!config?.rowOrder?.handleColumn?.enable,
		create: (config) => createRowOrderHandleColumn<TData>(config.rowOrder! || {}),
		position: "prepend",
	}
}