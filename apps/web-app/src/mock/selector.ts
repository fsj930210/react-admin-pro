import { HttpResponse, http } from "msw";

const SUCCESS_CODE = "0000000000";

const listSelectorItems = Array.from({ length: 501 }, (_, index) => ({
	label: `选项 ${index + 1}`,
	value: `value-${index + 1}`,
	disabled: Math.random() > 0.9,
}));

export default [
	http.get("/api/rap/selector/items", ({ request }) => {
		const url = new URL(request.url);
		const page = parseInt(url.searchParams.get("page") ?? "1", 10);
		const limit = parseInt(url.searchParams.get("page_size") ?? "100", 10);
		const search = url.searchParams.get("search") ?? "";

		let filteredItems = listSelectorItems;
		if (search) {
			const searchLower = search.toLowerCase();
			filteredItems = listSelectorItems.filter((item) =>
				item.label.toLowerCase().includes(searchLower),
			);
		}

		const total = filteredItems.length;
		const totalPages = Math.ceil(total / limit);

		// 当页码超过总页数时返回空数组
		let paginatedItems: typeof listSelectorItems = [];
		if (page <= totalPages) {
			const start = (page - 1) * limit;
			const end = start + limit;
			paginatedItems = filteredItems.slice(start, end);
		}

		return HttpResponse.json({
			code: SUCCESS_CODE,
			message: "success",
			data: {
				data: paginatedItems,
				pagination: {
					page,
					page_size: limit,
					total: total,
				},
			},
		});
	}),
];
