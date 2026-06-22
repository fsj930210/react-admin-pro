import { HttpResponse, http } from "msw";

const SUCCESS_CODE = "0000000000";

const organizationTree = [
  {
    key: "grade-1",
    label: "一年级",
    children: [
      { key: "grade-1-class-1", label: "一班" },
      { key: "grade-1-class-2", label: "二班" },
    ],
  },
  {
    key: "grade-2",
    label: "二年级",
    children: [
      { key: "grade-2-class-1", label: "一班" },
      { key: "grade-2-class-2", label: "二班" },
    ],
  },
];

const asyncRootOrganizations = [
  { key: "grade-1", label: "一年级", isLeaf: false },
  { key: "grade-2", label: "二年级", isLeaf: false },
];

const asyncOrganizationChildren = new Map<
  string,
  Array<{ key: string; label: string; isLeaf?: boolean }>
>([
  [
    "grade-1",
    [
      { key: "grade-1-class-1", label: "一班", isLeaf: true },
      { key: "grade-1-class-2", label: "二班", isLeaf: true },
    ],
  ],
  [
    "grade-2",
    [
      { key: "grade-2-class-1", label: "一班", isLeaf: true },
      { key: "grade-2-class-2", label: "二班", isLeaf: true },
    ],
  ],
]);

const organizationPathMap = new Map<string, string>([
  ["grade-1-class-1", "一年级 / 一班"],
  ["grade-1-class-2", "一年级 / 二班"],
  ["grade-2-class-1", "二年级 / 一班"],
  ["grade-2-class-2", "二年级 / 二班"],
]);

const childKeys = new Map<string, string[]>([
  ["grade-1", ["grade-1-class-1", "grade-1-class-2"]],
  ["grade-2", ["grade-2-class-1", "grade-2-class-2"]],
]);

const users = [
  { id: "u-1", name: "张三", account: "zhangsan", classKey: "grade-1-class-1" },
  { id: "u-2", name: "李四", account: "lisi", classKey: "grade-1-class-1" },
  { id: "u-3", name: "王五", account: "wangwu", classKey: "grade-1-class-2" },
  { id: "u-4", name: "赵六", account: "zhaoliu", classKey: "grade-1-class-2" },
  { id: "u-5", name: "钱七", account: "qianqi", classKey: "grade-2-class-1" },
  { id: "u-6", name: "孙八", account: "sunba", classKey: "grade-2-class-1" },
  { id: "u-7", name: "周九", account: "zhoujiu", classKey: "grade-2-class-2" },
  { id: "u-8", name: "吴十", account: "wushi", classKey: "grade-2-class-2" },
];

function withOrganizationPath<T extends { classKey: string }>(item: T) {
  return {
    ...item,
    organizationPath: organizationPathMap.get(item.classKey),
  };
}

function success<T>(data: T) {
  return HttpResponse.json({
    code: SUCCESS_CODE,
    message: "success",
    data: { data },
  });
}

export default [
  http.get("/api/rap/tree-transfer/organizations", () => success(organizationTree)),

  http.get("/api/rap/tree-transfer/async-organizations", () => success(asyncRootOrganizations)),

  http.get("/api/rap/tree-transfer/organization-children", ({ request }) => {
    const url = new URL(request.url);
    const parentKey = url.searchParams.get("parentKey") ?? "";
    return success(asyncOrganizationChildren.get(parentKey) ?? []);
  }),

  http.get("/api/rap/tree-transfer/users", ({ request }) => {
    const url = new URL(request.url);
    const treeKey = url.searchParams.get("treeKey") ?? "";
    const search = url.searchParams.get("search") ?? "";
    const includeChild = url.searchParams.get("includeChild") === "true";
    const keys = includeChild ? [treeKey, ...(childKeys.get(treeKey) ?? [])] : [treeKey];
    const keyword = search.toLowerCase();
    const data = users.filter((user) => {
      const matchedTree = keys.includes(user.classKey);
      const matchedSearch =
        !keyword || user.name.includes(search) || user.account.toLowerCase().includes(keyword);
      return matchedTree && matchedSearch;
    });

    return success(data.map(withOrganizationPath));
  }),

  http.post("/api/rap/tree-transfer/selected-users", async ({ request }) => {
    const body = (await request.json()) as { ids?: string[] };
    const ids = body.ids ?? [];
    return success(users.filter((user) => ids.includes(user.id)).map(withOrganizationPath));
  }),
];
