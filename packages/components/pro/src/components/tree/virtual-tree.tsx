/** biome-ignore-all lint/correctness/useExhaustiveDependencies: feature arrays must stay stable for TreeRoot so the tree instance is not recreated on every render. */

import { TreeRoot } from "@rap/components-ui/tree";
import { useMemo } from "react";
import { buildCommonFeatures, VirtualTreeContent } from "./shared";
import type { VirtualTreeProps } from "./types";

export function VirtualTree({
  data,
  treeData,
  features,
  indent,
  rowHeight,
  isLeaf,
  className,
  renderItem,
  height,
  overscan,
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
}: VirtualTreeProps) {
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
        <VirtualTreeContent
          {...props}
          {...featureOptions}
          renderItem={renderItem}
          height={height}
          overscan={overscan}
          tree={tree}
        />
      )}
    </TreeRoot>
  );
}
