"use client"

import { useMemo, useState } from "react";
import type { Column } from "@tanstack/react-table";
import { Button } from "@rap/components-ui/button";
import { Input } from "@rap/components-ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@rap/components-ui/select";
import { cn } from "@rap/utils";
import type { DataGridFilterCondition, DataGridFilterValue, FilterOperator } from "../types";
import { normalizeFilterValue } from "../utils/filtering";

interface ColumnFilterPanelProps<TData, TValue> {
	column: Column<TData, TValue>;
	onApply?: () => void;
}

const textOperators: FilterOperator[] = ["contains", "notContains", "equals", "notEqual", "beginsWith", "endsWith", "blank", "notBlank"];
const numberOperators: FilterOperator[] = ["equals", "notEqual", "lessThan", "lessThanOrEqual", "greaterThan", "greaterThanOrEqual", "inRange", "blank", "notBlank"];
const dateOperators: FilterOperator[] = ["equals", "before", "after", "inRange", "blank", "notBlank"];

const operatorLabels: Record<FilterOperator, string> = {
	contains: "Contains",
	notContains: "Not contains",
	equals: "Equals",
	notEqual: "Not equal",
	beginsWith: "Begins with",
	endsWith: "Ends with",
	lessThan: "Less than",
	lessThanOrEqual: "Less than or equal",
	greaterThan: "Greater than",
	greaterThanOrEqual: "Greater than or equal",
	before: "Before",
	after: "After",
	inRange: "In range",
	blank: "Blank",
	notBlank: "Not blank",
};

export function ColumnFilterPanel<TData, TValue>({
	column,
	onApply,
}: ColumnFilterPanelProps<TData, TValue>) {
	const meta = column.columnDef.meta?.filter;
	const type = meta?.type ?? "text";
	const initialValue = normalizeFilterValue(column.getFilterValue());
	const [draft, setDraft] = useState<DataGridFilterValue>(() => ({
		type,
		join: initialValue.join ?? "or",
		conditions: [
			initialValue.conditions?.[0] ?? { operator: getDefaultOperator(type), value: "" },
			initialValue.conditions?.[1] ?? { operator: getDefaultOperator(type), value: "" },
		],
		value: initialValue.value,
	}));

	const operators = useMemo(() => {
		if (meta?.operators?.length) return meta.operators;
		if (type === "number") return numberOperators;
		if (type === "date") return dateOperators;
		return textOperators;
	}, [meta?.operators, type]);

	if (type === "custom" && meta?.render) {
		return meta.render({
			column,
			table: column.columnDef,
			value: column.getFilterValue(),
			setValue: (value) => column.setFilterValue(value),
			clear: () => column.setFilterValue(undefined),
			apply: () => onApply?.(),
		});
	}

	if (type === "select" || type === "multiSelect") {
		const values = Array.isArray(draft.value) ? draft.value : draft.value == null ? [] : [draft.value];
		return (
			<div className="w-64 p-2">
				<div className="max-h-56 space-y-1 overflow-auto">
					{(meta?.options ?? []).map((option) => (
						<button
							type="button"
							key={String(option.value)}
							className={cn(
								"flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent",
								values.includes(option.value) && "bg-accent",
							)}
							onClick={() => {
								const checked = !values.includes(option.value);
								const nextValue = type === "multiSelect"
									? checked
										? [...values, option.value]
										: values.filter((value) => value !== option.value)
									: checked
										? option.value
										: undefined;
								setDraft((previous) => ({ ...previous, value: nextValue }));
							}}
						>
							{option.label}
							<span>{values.includes(option.value) ? "✓" : ""}</span>
						</button>
					))}
				</div>
				<div className="my-2 h-px bg-border" />
				<FilterFooter
					onClear={() => {
						column.setFilterValue(undefined);
						onApply?.();
					}}
					onApply={() => {
						column.setFilterValue(draft.value == null || (Array.isArray(draft.value) && draft.value.length === 0)
							? undefined
							: { ...draft, conditions: undefined });
						onApply?.();
					}}
				/>
			</div>
		);
	}

	return (
		<div className="w-72 p-3">
			<div className="space-y-3">
				<ConditionEditor
					type={type}
					operators={operators}
					condition={draft.conditions?.[0]}
					onChange={(condition) => setDraft((previous) => setCondition(previous, 0, condition))}
				/>
				<div className="flex items-center justify-center gap-6 text-sm">
					<label className="flex items-center gap-2">
						<input
							type="radio"
							checked={(draft.join ?? "or") === "and"}
							onChange={() => setDraft((previous) => ({ ...previous, join: "and" }))}
						/>
						AND
					</label>
					<label className="flex items-center gap-2">
						<input
							type="radio"
							checked={(draft.join ?? "or") === "or"}
							onChange={() => setDraft((previous) => ({ ...previous, join: "or" }))}
						/>
						OR
					</label>
				</div>
				<ConditionEditor
					type={type}
					operators={operators}
					condition={draft.conditions?.[1]}
					onChange={(condition) => setDraft((previous) => setCondition(previous, 1, condition))}
				/>
				<FilterFooter
					onClear={() => {
						column.setFilterValue(undefined);
						onApply?.();
					}}
					onApply={() => {
						const conditions = (draft.conditions ?? []).filter((condition) =>
							condition?.operator === "blank" ||
							condition?.operator === "notBlank" ||
							condition?.value !== undefined && condition.value !== ""
						);
						column.setFilterValue(conditions.length ? { ...draft, conditions } : undefined);
						onApply?.();
					}}
				/>
			</div>
		</div>
	);
}

function ConditionEditor({
	type,
	operators,
	condition,
	onChange,
}: {
	type: string;
	operators: FilterOperator[];
	condition?: DataGridFilterCondition;
	onChange: (condition: DataGridFilterCondition) => void;
}) {
	const operator = condition?.operator ?? getDefaultOperator(type);
	const needsValue = operator !== "blank" && operator !== "notBlank";

	return (
		<div className="space-y-2">
			<Select value={operator} onValueChange={(value) => onChange({ ...condition, operator: value as FilterOperator })}>
				<SelectTrigger className="w-full">
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{operators.map((item) => (
						<SelectItem key={item} value={item}>
							{operatorLabels[item]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{needsValue ? (
				<Input
					type={type === "number" ? "number" : type === "date" ? "date" : "text"}
					value={String(condition?.value ?? "")}
					onChange={(event) => onChange({ ...condition, value: event.target.value })}
				/>
			) : null}
			{operator === "inRange" ? (
				<Input
					type={type === "number" ? "number" : type === "date" ? "date" : "text"}
					value={String(condition?.valueTo ?? "")}
					onChange={(event) => onChange({ ...condition, valueTo: event.target.value })}
				/>
			) : null}
		</div>
	);
}

function FilterFooter({
	onClear,
	onApply,
}: {
	onClear: () => void;
	onApply: () => void;
}) {
	return (
		<div className="flex justify-end gap-2 pt-2">
			<Button variant="outline" size="sm" onClick={onClear}>
				Clear
			</Button>
			<Button size="sm" onClick={onApply}>
				Apply
			</Button>
		</div>
	);
}

function setCondition(value: DataGridFilterValue, index: number, condition: DataGridFilterCondition) {
	const conditions: [DataGridFilterCondition?, DataGridFilterCondition?] = [
		value.conditions?.[0],
		value.conditions?.[1],
	];
	conditions[index] = condition;
	return {
		...value,
		conditions,
	};
}

function getDefaultOperator(type: string): FilterOperator {
	if (type === "number" || type === "date") return "equals";
	return "contains";
}
