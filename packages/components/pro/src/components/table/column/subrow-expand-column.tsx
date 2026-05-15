
import { cn } from "@rap/utils";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import { SUBROW_EXPAND_COLUMN } from "../utils/constants";

export function createSubrowExpandColumn<TData>(hideWhenSingle?: boolean, size?: number): ColumnDef<TData> {
	return {
		id: SUBROW_EXPAND_COLUMN,
		size: size ?? 60,
		header: () => null,
		cell: ({ row }: { row: Row<TData> }) => {
			if (!row.getCanExpand()) {
				return <div className="w-4" />; // Spacer for alignment
			}

			// Hide icon if only 1 subrow and hideWhenSingle is true
			if (hideWhenSingle && row.subRows && row.subRows.length === 1) {
				return <div className="w-4" />;
			}
			return (
				<button
					onClick={row.getToggleExpandedHandler()}
					className={cn(
						"inline-flex items-center justify-center",
						"h-6 w-6 cursor-pointer transition-all",
						"hover:bg-muted rounded-sm",
						"focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
					)}
					aria-label={row.getIsExpanded() ? "Collapse row" : "Expand row"}
					aria-expanded={row.getIsExpanded()}
					type="button"
				>
					<ChevronRight
						className={cn(
							"h-4 w-4 transition-transform duration-200",
							row.getIsExpanded() && "rotate-90"
						)}
					/>
				</button>
			)
		},
		enableSorting: false,
		enableHiding: false,
	}
}