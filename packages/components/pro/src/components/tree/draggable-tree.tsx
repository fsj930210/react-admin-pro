/** biome-ignore-all lint/correctness/useExhaustiveDependencies: feature arrays must stay stable for TreeRoot so the tree instance is not recreated on every render. */

import { TreeRoot } from "@rap/components-ui/tree";
import { useMemo } from "react";
import { buildDraggableFeatures, DraggableTreeContent } from "./shared";
import type { DraggableTreeProps } from "./types";

export function DraggableTree({
  data,
  treeData,
  features,
  indent,
  rowHeight,
  isLeaf,
  className,
  renderItem,
  canDrag,
  canDrop,
  maxDepth,
  allowDropInsideLeaf,
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
}: DraggableTreeProps) {
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
    () =>
      buildDraggableFeatures(featureOptions, { canDrag, canDrop, maxDepth, allowDropInsideLeaf }),
    [
      allowDropInsideLeaf,
      asyncLoader,
      canDrag,
      canDrop,
      checkable,
      checkedKeys,
      defaultCheckedKeys,
      defaultExpandedKeys,
      defaultSelectedKeys,
      expandedKeys,
      features,
      filter,
      maxDepth,
      onCheckedKeysChange,
      onExpandedKeysChange,
      onSelectedKeysChange,
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
        <DraggableTreeContent {...props} {...featureOptions} renderItem={renderItem} tree={tree} />
      )}
    </TreeRoot>
  );
}
