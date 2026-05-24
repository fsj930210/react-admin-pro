import type { FilterFn } from "@tanstack/react-table";
import type { DataGridFilterValue, FilterOperator } from "../types";

export const dataGridFilter: FilterFn<unknown> = (row, columnId, filterValue) => {
	if (filterValue == null || filterValue === "") return true;

	const value = row.getValue(columnId);
	const normalized = normalizeFilterValue(filterValue);

	if (!normalized.conditions?.length && normalized.value === undefined) {
		return true;
	}

	if (normalized.conditions?.length) {
		const results = normalized.conditions
			.filter(Boolean)
			.map((condition) => matchesOperator(
				value,
				condition?.operator ?? "contains",
				condition?.value,
				condition?.valueTo,
			));

		return normalized.join === "and"
			? results.every(Boolean)
			: results.some(Boolean);
	}

	if (Array.isArray(normalized.value)) {
		return normalized.value.includes(value as never);
	}

	return matchesOperator(value, "contains", normalized.value);
};

export const dataGridGlobalFuzzy: FilterFn<unknown> = (row, _columnId, filterValue) => {
	if (filterValue == null || filterValue === "") return true;

	const needle = String(filterValue).toLowerCase();
	return row.getAllCells().some((cell) => fuzzyIncludes(cell.getValue(), needle));
};

export function normalizeFilterValue(value: unknown): DataGridFilterValue {
	if (isFilterValue(value)) return value;

	return {
		value,
		conditions: value == null || value === ""
			? []
			: [{ operator: "contains", value }],
	};
}

export function matchesOperator(
	rawValue: unknown,
	operator: FilterOperator,
	rawFilterValue?: unknown,
	rawFilterValueTo?: unknown,
) {
	const isBlank = rawValue == null || rawValue === "";

	if (operator === "blank") return isBlank;
	if (operator === "notBlank") return !isBlank;
	if (isBlank) return false;

	const value = normalizeComparable(rawValue);
	const filterValue = normalizeComparable(rawFilterValue);
	const filterValueTo = normalizeComparable(rawFilterValueTo);
	const valueText = String(rawValue).toLowerCase();
	const filterText = String(rawFilterValue ?? "").toLowerCase();

	switch (operator) {
		case "contains":
			return valueText.includes(filterText);
		case "notContains":
			return !valueText.includes(filterText);
		case "equals":
			return value === filterValue || valueText === filterText;
		case "notEqual":
			return value !== filterValue && valueText !== filterText;
		case "beginsWith":
			return valueText.startsWith(filterText);
		case "endsWith":
			return valueText.endsWith(filterText);
		case "lessThan":
		case "before":
			return value < filterValue;
		case "lessThanOrEqual":
			return value <= filterValue;
		case "greaterThan":
		case "after":
			return value > filterValue;
		case "greaterThanOrEqual":
			return value >= filterValue;
		case "inRange":
			return value >= filterValue && value <= filterValueTo;
		default:
			return true;
	}
}

function isFilterValue(value: unknown): value is DataGridFilterValue {
	return !!value && typeof value === "object" && ("conditions" in value || "join" in value || "type" in value);
}

function normalizeComparable(value: unknown) {
	if (value instanceof Date) return value.getTime();
	if (typeof value === "number") return value;
	if (typeof value === "string") {
		const numeric = Number(value);
		if (!Number.isNaN(numeric) && value.trim() !== "") return numeric;

		const date = Date.parse(value);
		if (!Number.isNaN(date) && /\d{4}|\d{1,2}[/-]\d{1,2}/.test(value)) return date;
	}
	return String(value ?? "").toLowerCase();
}

function fuzzyIncludes(value: unknown, needle: string) {
	const text = String(value ?? "").toLowerCase();
	let index = 0;

	for (const char of text) {
		if (char === needle[index]) index += 1;
		if (index === needle.length) return true;
	}

	return false;
}
