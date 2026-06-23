import { BasicTree } from "@rap/components-pro/tree";
import type { TreeItemInstance, TreeNode } from "@rap/components-ui/tree/types";
import { useState } from "react";

const createSearchTree = (): TreeNode[] => [
  {
    key: "0-0",
    label: "0-0",
    children: [
      {
        key: "0-0-0",
        label: "0-0-0",
        children: [
          { key: "0-0-0-0", label: "0-0-0-0" },
          { key: "0-0-0-1", label: "0-0-0-1" },
          { key: "0-0-0-2", label: "0-0-0-2" },
        ],
      },
      {
        key: "0-0-1",
        label: "0-0-1",
        children: [{ key: "0-0-1-0", label: "0-0-1-0" }],
      },
      { key: "0-0-2", label: "0-0-2" },
    ],
  },
  {
    key: "0-1",
    label: "0-1",
    children: [
      {
        key: "0-1-0",
        label: "0-1-0",
        children: [
          { key: "0-1-0-0", label: "0-1-0-0" },
          { key: "0-1-0-1", label: "0-1-0-1" },
          { key: "0-1-0-2", label: "0-1-0-2" },
        ],
      },
      { key: "0-1-1", label: "0-1-1" },
      { key: "0-1-2", label: "0-1-2" },
    ],
  },
  { key: "0-2", label: "0-2" },
];

function renderSearchLabel(item: TreeItemInstance, searchValue: string) {
  const label = item.node.label;
  const index = searchValue ? label.toLowerCase().indexOf(searchValue.toLowerCase()) : -1;

  if (index === -1) return label;

  const beforeStr = label.slice(0, index);
  const matchStr = label.slice(index, index + searchValue.length);
  const afterStr = label.slice(index + searchValue.length);

  return (
    <>
      {beforeStr}
      <span className="text-destructive" style={{ color: "var(--destructive)" }}>
        {matchStr}
      </span>
      {afterStr}
    </>
  );
}

export function SyncTreeSearchDemo() {
  const [treeData] = useState(createSearchTree);
  const [message, setMessage] = useState("matched: -");
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="space-y-2">
      <BasicTree
        data={treeData}
        defaultExpandedKeys={["0-0", "0-0-0", "0-1", "0-1-0"]}
        labelRender={(item) => renderSearchLabel(item, searchValue)}
        search={{
          onSearch: (keyword, info) => {
            if (info.async) return;
            setSearchValue(keyword.trim());
            setMessage(
              keyword.trim() ? `matched: ${info.matchedKeys.join(", ") || "-"}` : "matched: -"
            );
          },
        }}
      />
      <span className="inline-flex min-h-7 items-center rounded-md border bg-muted/40 px-2 text-xs text-muted-foreground">
        {message}
      </span>
    </div>
  );
}
