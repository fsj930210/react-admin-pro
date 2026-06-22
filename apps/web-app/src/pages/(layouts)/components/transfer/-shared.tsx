import { DataGrid } from "@rap/components-ui/data-grid";
import { Tree } from "@rap/components-pro/tree";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rap/components-ui/card";
import {
  SelectorCount,
  SelectorEmpty,
  SelectorFooter,
  SelectorList,
  SelectorListItem,
  SelectorSearch,
  SelectorSelectAll,
  useSelector,
} from "@rap/components-ui/selector";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@rap/components-ui/pagination";
import type { TreeNode } from "@rap/components-ui/tree/types";
import {
  MoveAllToSourceAction,
  MoveAllToTargetAction,
  MoveToSourceAction,
  MoveToTargetAction,
  useTransfer,
} from "@rap/components-ui/transfer";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

export type User = {
  id: string;
  name: string;
  department: string;
  role: string;
  status: "active" | "locked";
  disabled?: boolean;
};

const departments = ["Engineering", "Product", "Growth", "Success"];
const roles = ["Owner", "Admin", "Editor", "Viewer"];
export const longText =
  "This is a very very very very very very long member name used to verify panel overflow";

function createUsers(count: number): User[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `user-${index + 1}`,
    name: index % 6 === 0 ? `Member ${index + 1} - ${longText}` : `Member ${index + 1}`,
    department: departments[index % departments.length],
    role: roles[index % roles.length],
    status: index % 13 === 0 ? "locked" : "active",
    disabled: index % 23 === 0,
  }));
}

export const dataSource = createUsers(96);
export const initialValue = ["user-2", "user-5", "user-9"];

export const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "Name", meta: { ellipsis: true } },
  { accessorKey: "department", header: "Department", meta: { ellipsis: true } },
  { accessorKey: "role", header: "Role", meta: { ellipsis: true } },
];

export const treeTransferData: TreeNode[] = [
  {
    key: "engineering",
    label: "Engineering",
    children: [
      { key: "frontend", label: `Frontend - ${longText}` },
      { key: "backend", label: "Backend" },
      { key: "qa", label: "QA", disabled: true },
    ],
  },
  {
    key: "business",
    label: "Business",
    children: [
      { key: "growth", label: "Growth" },
      { key: "success", label: `Success - ${longText}` },
      { key: "support", label: "Support" },
    ],
  },
];

export function flattenTree(nodes: TreeNode[]): TreeNode[] {
  return nodes.flatMap((node) => [node, ...(node.children ? flattenTree(node.children) : [])]);
}

function filterTreeByKeys(nodes: TreeNode[], keys: Set<string>): TreeNode[] {
  const result: TreeNode[] = [];
  for (const node of nodes) {
    const children = node.children ? filterTreeByKeys(node.children, keys) : undefined;
    if (!keys.has(String(node.key)) && !children?.length) continue;
    result.push({ ...node, children });
  }
  return result;
}

export function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function TransferActions() {
  return (
    <div className="flex shrink-0 flex-row items-center justify-center gap-2 md:flex-col">
      <MoveToTargetAction />
      <MoveToSourceAction />
      <MoveAllToTargetAction />
      <MoveAllToSourceAction />
    </div>
  );
}

export function PanelFooter({ type }: { type: "source" | "target" }) {
  const transfer = useTransfer<User>();
  const total = type === "source" ? transfer.sourceItems.length : transfer.targetItems.length;
  const checked =
    type === "source" ? transfer.sourceCheckedValues.length : transfer.targetCheckedValues.length;
  return (
    <div className="text-muted-foreground text-sm">
      Total {total}, checked {checked}
    </div>
  );
}

export function ListPanelContent({ placeholder = "Search..." }: { placeholder?: string }) {
  const { filteredItems } = useSelector<User>();

  return (
    <>
      <SelectorSearch placeholder={placeholder} />
      <SelectorSelectAll />
      {filteredItems.length > 0 ? (
        <SelectorList<User>>
          {({ item }) => (
            <SelectorListItem<User> item={item}>
              <span className="block truncate">{item.name}</span>
            </SelectorListItem>
          )}
        </SelectorList>
      ) : (
        <div className="min-h-0 flex-1 rounded-md border">
          <SelectorEmpty className="h-full min-h-0" />
        </div>
      )}
    </>
  );
}

export function DataGridPanelContent() {
  const api = useSelector<User>();

  return (
    <>
      <SelectorSearch placeholder="Search members" />
      <div className="min-h-0 flex-1 [&_.os-host]:min-h-0 [&_.os-host]:flex-1 [&>div]:flex [&>div]:h-full [&>div]:flex-col">
        {api.filteredItems.length > 0 ? (
          <DataGrid
            rowKey="id"
            columns={columns}
            data={api.filteredItems}
            scroll={{ y: "100%" }}
            pagination={{
              mode: "local",
              defaultPageSize: 6,
              showSizeChanger: false,
              contentClassName:
                "flex-nowrap justify-end [&_[data-slot=pagination-link]>span]:hidden",
            }}
            rowSelection={{
              selectedRowKeys: api.selectedValues,
              onChange: (keys) => api.setValues(keys),
              getCheckboxProps: (record) => ({ disabled: api.getDisabled(record) }),
            }}
          />
        ) : (
          <div className="flex h-full rounded-md border">
            <SelectorEmpty className="h-full min-h-0 flex-1" />
          </div>
        )}
      </div>
      <SelectorCount />
    </>
  );
}

export function TreeSourcePanelContent() {
  const api = useSelector<TreeNode>();
  const sourceKeys = useMemo(
    () => new Set(api.filteredItems.map((item) => String(item.key))),
    [api.filteredItems]
  );
  const sourceTree = useMemo(() => filterTreeByKeys(treeTransferData, sourceKeys), [sourceKeys]);

  return (
    <>
      <SelectorSearch placeholder="Search organization" />
      <div className="min-h-0 flex-1 overflow-auto rounded-md border p-2">
        <Tree
          data={sourceTree}
          checkable={{ checkStrictly: false }}
          defaultExpandedKeys={["engineering", "business"]}
          checkedKeys={api.selectedValues}
          onCheckedKeysChange={(keys) => api.setValues(keys.map(String))}
          labelRender={(item) => (
            <span className="block max-w-full truncate">{item.node.label}</span>
          )}
        />
      </div>
      <SelectorCount />
    </>
  );
}

export function TreeTargetListContent() {
  const { filteredItems } = useSelector<TreeNode>();

  return (
    <>
      <SelectorSearch placeholder="Search selected" />
      {filteredItems.length > 0 ? (
        <SelectorList<TreeNode>>
          {({ item }) => (
            <SelectorListItem<TreeNode> item={item}>
              <span className="block truncate">{item.label}</span>
            </SelectorListItem>
          )}
        </SelectorList>
      ) : (
        <div className="min-h-0 flex-1 rounded-md border">
          <SelectorEmpty className="h-full min-h-0" />
        </div>
      )}
      <SelectorCount />
    </>
  );
}

export function PaginatedList({ pageSize = 8 }: { pageSize?: number }) {
  const [page, setPage] = useState(1);
  const api = useSelector<User>();
  const pageCount = Math.max(1, Math.ceil(api.filteredItems.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageItems = api.filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <>
      <SelectorSearch placeholder="Search current panel" />
      <SelectorSelectAll />
      <div className="min-h-0 flex-1 overflow-auto rounded-md border p-1">
        {pageItems.map((item) => (
          <SelectorListItem key={item.id} item={item}>
            <div className="flex min-w-0 items-center justify-between gap-3">
              <span className="truncate">{item.name}</span>
              <span className="shrink-0 text-muted-foreground text-xs">{item.department}</span>
            </div>
          </SelectorListItem>
        ))}
      </div>
      <SelectorFooter className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
        <div className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
          Page {currentPage} / {pageCount}, total {api.filteredItems.length}
        </div>
        <Pagination className="mx-0 w-auto">
          <PaginationContent className="justify-end">
            <PaginationItem>
              <PaginationLink
                aria-label="Previous page"
                disabled={currentPage <= 1}
                size="icon"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                <ChevronLeft className="size-4" />
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink isActive>{currentPage}</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                aria-label="Next page"
                disabled={currentPage >= pageCount}
                size="icon"
                onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
              >
                <ChevronRight className="size-4" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </SelectorFooter>
      <SelectorEmpty />
    </>
  );
}
