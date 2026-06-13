/** biome-ignore-all lint/correctness/useExhaustiveDependencies: feature arrays must stay stable for TreeRoot so the tree instance is not recreated on every render. */

import { TreeRoot } from "@rap/components-ui/tree";
import { useMemo } from "react";
import { buildCommonFeatures, TreeContent } from "./shared";
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
    searchable,
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
      searchable,
      selectable,
      selectedKeys,
    ],
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
        <TreeContent
          {...props}
          {...featureOptions}
          renderItem={renderItem}
          tree={tree}
        />
      )}
    </TreeRoot>
  );
}
