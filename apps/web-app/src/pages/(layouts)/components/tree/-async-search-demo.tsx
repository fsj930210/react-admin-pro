import { BasicTree } from "@rap/components-pro/tree";
import type { TreeItemInstance, TreeNode } from "@rap/components-ui/tree/types";
import { useState } from "react";
import {
  fetchTreeChildren,
  fetchTreeSearchOptions,
  fetchTreeSearchSubtree,
} from "@/service/tree";

const createRemoteTree = (): TreeNode[] => [
  {
    key: "remote-root",
    label: "Remote Organization",
    child_num: 3,
    children: [
      { key: "remote-apac", label: "APAC", child_num: 4, children: [] },
      { key: "remote-emea", label: "EMEA", child_num: 4, children: [] },
      { key: "remote-na", label: "North America", child_num: 0, children: [] },
    ],
  },
];

function renderSearchLabel(item: TreeItemInstance, searchValue: string) {
  const label = item.node.label;
  const index = searchValue ? label.toLowerCase().indexOf(searchValue.toLowerCase()) : -1;

  if (index === -1) return label;

  return (
    <>
      {label.slice(0, index)}
      <span className="text-destructive" style={{ color: "var(--destructive)" }}>
        {label.slice(index, index + searchValue.length)}
      </span>
      {label.slice(index + searchValue.length)}
    </>
  );
}

export function AsyncTreeSearchDemo() {
  const [treeData] = useState(createRemoteTree);
  const [message, setMessage] = useState("options: -");
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="space-y-2">
      <BasicTree
        data={treeData}
        defaultExpandedKeys={["remote-root"]}
        asyncLoader={{
          loadChildren: (node) => fetchTreeChildren(node.key),
        }}
        isLeaf={(node) => typeof node.child_num === "number" && node.child_num <= 0}
        labelRender={(item) => renderSearchLabel(item, searchValue)}
        search={{
          searchOptions: fetchTreeSearchOptions,
          searchSubtree: fetchTreeSearchSubtree,
          onSearch: (keyword, info) => {
            if (!info.async) return;
            setSearchValue(keyword.trim());
            setMessage(keyword.trim() ? `options: ${info.options.length}` : "options: -");
          },
        }}
      />
      <span className="inline-flex min-h-7 items-center rounded-md border bg-muted/40 px-2 text-xs text-muted-foreground">
        {message}
      </span>
    </div>
  );
}
