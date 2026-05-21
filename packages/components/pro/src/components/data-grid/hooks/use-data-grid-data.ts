import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Row } from "@tanstack/react-table";
import type { DataGridFeatureContext, DataUpdater } from "../types";

interface UseDataGridDataOptions<TData> {
	data: TData[];
	rowKey: string | ((row: TData, index: number, parentRow?: Row<TData>) => string);
	onDataChange?: (updater: DataUpdater<TData>) => void;
}

export function useDataGridData<TData>({
	data,
	rowKey,
	onDataChange,
}: UseDataGridDataOptions<TData>) {
	const [internalData, setInternalData] = useState(data);
	const internalDataRef = useRef(internalData);

	useEffect(() => {
		internalDataRef.current = internalData;
	}, [internalData]);

	useEffect(() => {
		internalDataRef.current = data;
		setInternalData(data);
	}, [data]);

	const getRowId = useCallback((row: TData, index: number, parentRow?: Row<TData>) => {
		if (typeof rowKey === "function") {
			return rowKey(row, index, parentRow);
		}

		return String((row as Record<string, unknown>)[rowKey]);
	}, [rowKey]);

	const updateData = useCallback((updater: DataUpdater<TData>) => {
		const nextData = typeof updater === "function"
			? updater(internalDataRef.current)
			: updater;

		internalDataRef.current = nextData;
		setInternalData(nextData);
		onDataChange?.(nextData);
	}, [onDataChange]);

	const updateCellData = useCallback((rowIndex: number, columnId: string, value: unknown) => {
		updateData((prevData) => prevData.map((row, index) => {
			if (index !== rowIndex) return row;

			return {
				...row,
				[columnId]: value,
			};
		}));
	}, [updateData]);

	const featureContext = useMemo<DataGridFeatureContext<TData>>(() => ({
		data: internalData,
		getRowId,
		updateData,
	}), [getRowId, internalData, updateData]);

	return {
		data: internalData,
		getRowId,
		updateData,
		updateCellData,
		featureContext,
	};
}
