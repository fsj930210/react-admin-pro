import type { TreeNode } from "@rap/components-ui/tree/types";
import { HttpResponse, http } from "msw";

const SUCCESS_CODE = "0000000000";

const createChildren = (parentKey: string): TreeNode[] =>
	Array.from({ length: 4 }, (_, index) => ({
		key: `${parentKey}-remote-${index + 1}`,
		label: `Remote ${parentKey}-${index + 1}`,
		child_num: index < 2 ? 2 : 0,
		children: [],
	}));

export default [
	http.get("/api/rap/tree/children", ({ request }) => {
		const url = new URL(request.url);
		const parentKey = url.searchParams.get("parentKey") ?? "remote-root";

		return HttpResponse.json({
			code: SUCCESS_CODE,
			message: "success",
			data: {
				data: createChildren(parentKey),
			},
		});
	}),
];
