import type { SelectorItem } from "@rap/components-base/selector";
import type { BasePaginationResponse } from "@/service/fetch";
import request from "@/service/fetch";

/**
 * Get list selector items
 */
export const fetchSelectorItems = async (params: {
	page: number;
	limit: number;
	search?: string;
}) => {
	return request.get<BasePaginationResponse<SelectorItem>>("/api/rap/selector/items", {
		params,
	});
};
