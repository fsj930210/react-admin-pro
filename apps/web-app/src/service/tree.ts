import type { TreeNode } from "@rap/components-ui/tree/types";

export const fetchTreeChildren = async (parentKey: string) => {
	const response = await fetch(`/api/rap/tree/children?parentKey=${encodeURIComponent(parentKey)}`);
	const body = (await response.json()) as {
		data?: { data?: TreeNode[] } | TreeNode[];
	};

	if (Array.isArray(body.data)) return body.data;
	if (Array.isArray(body.data?.data)) return body.data.data;
	return [];
};
