import { useState } from "react";
import type { DataGridConfig, DataGridFeature } from "../types";
import { useControllableState } from '../hooks/use-controllable-state';
export function useColumnOrderFeature(config: DataGridConfig): DataGridFeature {
	const [columnOrder, setColumnOrder] = useState(config?.columnOrder?.columnOrder || config?.columnOrder?.defaultColumnOrder);
	
	return {
		enableDrag: true,
		dragType: 'row',
	};
}
