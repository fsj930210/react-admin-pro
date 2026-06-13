/** biome-ignore-all lint/correctness/useExhaustiveDependencies: feature arrays must stay stable for TreeRoot so the tree instance is not recreated on every render. */

import { TreeRoot } from "@rap/components-ui/tree";
import { useMemo } from "react";
import {
  buildCommonFeatures,
  buildDraggableFeatures,
  DraggableTreeContent,
  DraggableVirtualTreeContent,
  TreeContent,
  VirtualTreeContent,
} from "./shared";
import type { TreeProps, TreeVirtualConfig } from "./types";

function getVirtualOptions(virtual: TreeVirtualConfig | undefined) {
  if (!virtual) return null;
  return typeof virtual === "object" ? virtual : {};
}

export function Tree({
  data,
  treeData,
  features,
  indent,
  rowHeight,
  isLeaf,
  className,
  renderItem,
  virtual,
  draggable,
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
}: TreeProps) {
  const virtualOptions = getVirtualOptions(virtual);
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
      draggable
        ? buildDraggableFeatures(featureOptions, draggable)
        : buildCommonFeatures(featureOptions),
    [
      asyncLoader,
      checkable,
      checkedKeys,
      defaultCheckedKeys,
      defaultExpandedKeys,
      defaultSelectedKeys,
      draggable,
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
  const virtualHeight = virtualOptions?.height ?? 320;

  return (
    <TreeRoot
      data={data ?? treeData ?? []}
      features={mergedFeatures}
      indent={indent}
      rowHeight={rowHeight}
      isLeaf={isLeaf}
      className={className}
    >
      {(tree) => {
        if (virtualOptions && draggable) {
          return (
            <DraggableVirtualTreeContent
              {...props}
              {...featureOptions}
              renderItem={renderItem}
              height={virtualHeight}
              overscan={virtualOptions.overscan}
              tree={tree}
            />
          );
        }

        if (virtualOptions) {
          return (
            <VirtualTreeContent
              {...props}
              {...featureOptions}
              renderItem={renderItem}
              height={virtualHeight}
              overscan={virtualOptions.overscan}
              tree={tree}
            />
          );
        }

        if (draggable) {
          return (
            <DraggableTreeContent
              {...props}
              {...featureOptions}
              renderItem={renderItem}
              tree={tree}
            />
          );
        }

        return <TreeContent {...props} {...featureOptions} renderItem={renderItem} tree={tree} />;
      }}
    </TreeRoot>
  );
}
