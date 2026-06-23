/** biome-ignore-all lint/correctness/useExhaustiveDependencies: feature arrays must stay stable for TreeRoot so the tree instance is not recreated on every render. */

import { TreeRoot } from "@rap/components-ui/tree";
import { useMemo } from "react";
import { buildCommonFeatures, TreeContent, TreeSearch } from "./shared";
import type { BasicTreeProps } from "./types";

export function BasicTree({
  data,
  treeData,
  features,
  indent,
  rowHeight,
  isLeaf,
  className,
  renderItem,
  expandedKeys,
  defaultExpandedKeys,
  onExpandedKeysChange,
  selectable,
  selectedKeys,
  defaultSelectedKeys,
  onSelectedKeysChange,
  checkable,
  checkedKeys,
  defaultCheckedKeys,
  onCheckedKeysChange,
  searchable,
  search,
  filter,
  asyncLoader,
  ...props
}: BasicTreeProps) {
  const featureOptions = {
    features,
    expandedKeys,
    defaultExpandedKeys,
    onExpandedKeysChange,
    selectable,
    selectedKeys,
    defaultSelectedKeys,
    onSelectedKeysChange,
    checkable,
    checkedKeys,
    defaultCheckedKeys,
    onCheckedKeysChange,
    searchable: search ?? searchable,
    filter,
    asyncLoader,
  };
  const mergedFeatures = useMemo(
    () => buildCommonFeatures(featureOptions),
    [
      asyncLoader,
      checkable,
      checkedKeys,
      defaultCheckedKeys,
      defaultExpandedKeys,
      defaultSelectedKeys,
      expandedKeys,
      features,
      filter,
      onCheckedKeysChange,
      onExpandedKeysChange,
      onSelectedKeysChange,
      search,
      searchable,
      selectable,
      selectedKeys,
    ]
  );

  return (
    <TreeRoot
      data={data ?? treeData ?? []}
      features={mergedFeatures}
      indent={indent}
      rowHeight={rowHeight}
      isLeaf={isLeaf}
      className={className}
    >
      {(tree) => (
        <TreeSearch
          tree={tree}
          search={search}
          asyncLoader={asyncLoader}
          baseProps={{ ...props, ...featureOptions, renderItem }}
        >
          <TreeContent {...props} {...featureOptions} renderItem={renderItem} tree={tree} />
        </TreeSearch>
      )}
    </TreeRoot>
  );
}
