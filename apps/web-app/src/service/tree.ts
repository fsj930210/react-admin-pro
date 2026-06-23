import type { TreeNode } from "@rap/components-ui/tree/types";
import type { TreeSearchOption } from "@rap/components-pro/tree";

export const fetchTreeChildren = async (parentKey: string) => {
  const response = await fetch(`/api/rap/tree/children?parentKey=${encodeURIComponent(parentKey)}`);
  const body = (await response.json()) as {
    data?: { data?: TreeNode[] } | TreeNode[];
  };

  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.data?.data)) return body.data.data;
  return [];
};

export const fetchTreeSearchOptions = async (keyword: string) => {
  const response = await fetch(
    `/api/rap/tree/search-options?keyword=${encodeURIComponent(keyword)}`
  );
  const body = (await response.json()) as {
    data?: { data?: TreeSearchOption[] } | TreeSearchOption[];
  };

  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.data?.data)) return body.data.data;
  return [];
};

export const fetchTreeSearchSubtree = async (option: TreeSearchOption) => {
  const response = await fetch(
    `/api/rap/tree/search-subtree?key=${encodeURIComponent(option.key)}`
  );
  const body = (await response.json()) as {
    data?: { data?: TreeNode[] } | TreeNode[];
  };

  if (Array.isArray(body.data)) return body.data;
  if (Array.isArray(body.data?.data)) return body.data.data;
  return [];
};
