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

const remoteSearchTree: TreeNode[] = [
  {
    key: "remote-root",
    label: "Remote Organization",
    children: [
      {
        key: "remote-apac",
        label: "APAC",
        children: [
          {
            key: "remote-apac-platform",
            label: "APAC Platform",
            children: [
              { key: "remote-apac-platform-web", label: "APAC Web Team" },
              { key: "remote-apac-platform-mobile", label: "APAC Mobile Team" },
            ],
          },
          { key: "remote-apac-design", label: "APAC Design" },
        ],
      },
      {
        key: "remote-emea",
        label: "EMEA",
        children: [
          {
            key: "remote-emea-product",
            label: "EMEA Product",
            children: [
              { key: "remote-emea-product-growth", label: "EMEA Growth Team" },
              { key: "remote-emea-product-admin", label: "EMEA Admin Team" },
            ],
          },
          { key: "remote-emea-finance", label: "EMEA Finance" },
        ],
      },
      {
        key: "remote-na",
        label: "North America",
        children: [
          { key: "remote-na-support", label: "North America Support" },
          { key: "remote-na-ops", label: "North America Operations" },
        ],
      },
    ],
  },
];

const findPath = (nodes: TreeNode[], key: string, path: TreeNode[] = []): TreeNode[] | null => {
  for (const node of nodes) {
    const nextPath = [...path, node];
    if (node.key === key) return nextPath;
    const childPath = node.children ? findPath(node.children, key, nextPath) : null;
    if (childPath) return childPath;
  }
  return null;
};

const flattenSearchOptions = (nodes: TreeNode[], pathLabel = ""): Array<{
  key: string;
  label: string;
  pathLabel: string;
}> =>
  nodes.flatMap((node) => {
    const nextPathLabel = pathLabel ? `${pathLabel} / ${node.label}` : node.label;
    return [
      { key: node.key, label: node.label, pathLabel: nextPathLabel },
      ...(node.children ? flattenSearchOptions(node.children, nextPathLabel) : []),
    ];
  });

const buildSubtreeByPath = (path: TreeNode[]): TreeNode[] => {
  const [root, ...rest] = path;
  if (!root) return [];
  const clonePathNode = (node: TreeNode, children?: TreeNode[]): TreeNode => ({
    ...node,
    children,
  });
  let child = rest.reduceRight<TreeNode | undefined>(
    (nextChild, node) => clonePathNode(node, nextChild ? [nextChild] : node.children),
    undefined
  );
  child = child ?? clonePathNode(root, root.children);
  return [clonePathNode(root, rest.length > 0 ? [child] : root.children)];
};

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
  http.get("/api/rap/tree/search-options", ({ request }) => {
    const url = new URL(request.url);
    const keyword = (url.searchParams.get("keyword") ?? "").trim().toLowerCase();
    const options = keyword
      ? flattenSearchOptions(remoteSearchTree).filter((item) =>
          item.label.toLowerCase().includes(keyword)
        )
      : [];

    return HttpResponse.json({
      code: SUCCESS_CODE,
      message: "success",
      data: {
        data: options,
      },
    });
  }),
  http.get("/api/rap/tree/search-subtree", ({ request }) => {
    const url = new URL(request.url);
    const key = url.searchParams.get("key") ?? "";
    const path = findPath(remoteSearchTree, key);

    return HttpResponse.json({
      code: SUCCESS_CODE,
      message: "success",
      data: {
        data: path ? buildSubtreeByPath(path) : [],
      },
    });
  }),
];
