"use client"

import { useEffect, useMemo, useState } from "react";
import { flexRender, type Cell } from "@tanstack/react-table";
import { Input } from "@rap/components-ui/input";
import type { EditableCellContext } from "../types";

interface EditableCellProps<TData, TValue> {
	cell: Cell<TData, TValue>;
	enable?: boolean;
	handleRef?: (element: Element | null) => void;
}

export function EditableCell<TData, TValue>({
	cell,
	enable,
	handleRef,
}: EditableCellProps<TData, TValue>) {
	const context = cell.getContext();
	const editMeta = cell.column.columnDef.meta?.edit;
	const canEdit = !!enable && (
		typeof editMeta?.enable === "function"
			? editMeta.enable(context)
			: editMeta?.enable
	);
	const value = context.getValue();
	const [isEditing, setIsEditing] = useState(false);
	const [draftValue, setDraftValue] = useState<TValue>(value);

	useEffect(() => {
		if (!isEditing) {
			setDraftValue(value);
		}
	}, [isEditing, value]);

	const editableContext = useMemo<EditableCellContext<TData, TValue>>(() => ({
		...context,
		cell,
		value,
		rowData: context.row.original,
		rowIndex: context.row.index,
		columnId: context.column.id,
		isEditing,
		draftValue,
		setDraftValue,
		cancelEdit: () => {
			setDraftValue(value);
			setIsEditing(false);
		},
		commitEdit: (nextValue) => {
			const committedValue = nextValue ?? draftValue;
			context.table.options.meta?.updateCellData?.(
				context.row.index,
				context.column.id,
				committedValue,
			);
			setDraftValue(committedValue);
			setIsEditing(false);
		},
	}), [cell, context, draftValue, isEditing, value]);

	if (isEditing && canEdit) {
		if (editMeta?.render) {
			return editMeta.render(editableContext);
		}

		return (
			<Input
				autoFocus
				className="h-8 w-full"
				value={String(draftValue ?? "")}
				onChange={(event) => setDraftValue(event.target.value as TValue)}
				onBlur={() => editableContext.commitEdit()}
				onKeyDown={(event) => {
					if (event.key === "Enter") editableContext.commitEdit();
					if (event.key === "Escape") editableContext.cancelEdit();
				}}
			/>
		);
	}

	return (
		<div
			className="size-full"
			onDoubleClick={() => {
				if (canEdit) setIsEditing(true);
			}}
		>
			{flexRender(cell.column.columnDef.cell, {
				...context,
				handleRef,
			})}
		</div>
	);
}
