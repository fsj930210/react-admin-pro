/** biome-ignore-all lint/correctness/useExhaustiveDependencies: feature arrays must stay stable for TreeRoot so the tree instance is not recreated on every render. */

import { TreeRoot } from "@rap/components-ui/tree";
import { useMemo } from "react";
import {
  buildCommonFeatures,
  buildDraggableFeatures,
  DraggableTreeContent,
  DraggableVirtualTreeContent,
  TreeContent,
  TreeSearch,
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
  search,
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
    searchable: search ?? searchable,
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
      search,
      searchable,
      selectable,
      selectedKeys,
    ]
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
            <TreeSearch
              tree={tree}
              search={search}
              asyncLoader={asyncLoader}
              baseProps={{ ...props, ...featureOptions, renderItem }}
            >
              <DraggableVirtualTreeContent
                {...props}
                {...featureOptions}
                renderItem={renderItem}
                height={virtualHeight}
                overscan={virtualOptions.overscan}
                tree={tree}
              />
            </TreeSearch>
          );
        }

        if (virtualOptions) {
          return (
            <TreeSearch
              tree={tree}
              search={search}
              asyncLoader={asyncLoader}
              baseProps={{ ...props, ...featureOptions, renderItem }}
            >
              <VirtualTreeContent
                {...props}
                {...featureOptions}
                renderItem={renderItem}
                height={virtualHeight}
                overscan={virtualOptions.overscan}
                tree={tree}
              />
            </TreeSearch>
          );
        }

        if (draggable) {
          return (
            <TreeSearch
              tree={tree}
              search={search}
              asyncLoader={asyncLoader}
              baseProps={{ ...props, ...featureOptions, renderItem }}
            >
              <DraggableTreeContent
                {...props}
                {...featureOptions}
                renderItem={renderItem}
                tree={tree}
              />
            </TreeSearch>
          );
        }

        return (
          <TreeSearch
            tree={tree}
            search={search}
            asyncLoader={asyncLoader}
            baseProps={{ ...props, ...featureOptions, renderItem }}
          >
            <TreeContent {...props} {...featureOptions} renderItem={renderItem} tree={tree} />
          </TreeSearch>
        );
      }}
    </TreeRoot>
  );
}
