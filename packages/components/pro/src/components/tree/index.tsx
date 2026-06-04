/** biome-ignore-all lint/correctness/useExhaustiveDependencies: pro tree wrappers collect many feature options before composing plugins. */

import {
  TreeCheckbox,
  TreeDropIndicator,
  TreeItem,
  TreeLabel,
  TreeRoot,
  TreeTrigger,
  TreeViewport,
  TreeVirtualViewport,
} from "@rap/components-ui/tree";
import {
  asyncLoaderFeature,
  checkableFeature,
  crudFeature,
  dndFeature,
  expandableFeature,
  filterFeature,
  searchFeature,
  selectableFeature,
  sortableFeature,
} from "@rap/components-ui/tree/features";
import type {
  CreateTreeOptions,
  DropIntent,
  DropPosition,
  TreeFeature,
  TreeInstance,
  TreeItemInstance,
  TreeKey,
  TreeNode,
} from "@rap/components-ui/tree/types";
import { cn } from "@rap/utils";
import * as React from "react";

type RenderItemContext = {
  item: TreeItemInstance;
  tree: TreeInstance;
  defaultNode: React.ReactNode;
};

type SearchableConfig =
  | boolean
  | {
      highlightKey?: string;
      onSearch?: (
        keyword: string,
        matchedKeys: TreeKey[],
        matchedItems: TreeItemInstance[]
      ) => void;
    };

type AsyncLoaderConfig = {
  loadChildren: (node: TreeNode) => Promise<TreeNode[]>;
  onLoadError?: (error: unknown, key: TreeKey) => void;
};

type ProTreeBaseProps = Omit<React.HTMLAttributes<HTMLDivElement>, "children"> & {
  data?: TreeNode[];
  treeData?: TreeNode[];
  features?: TreeFeature[];
  indent?: number;
  rowHeight?: number;
  isLeaf?: CreateTreeOptions["isLeaf"];

  expandedKeys?: TreeKey[];
  defaultExpandedKeys?: TreeKey[];
  onExpandedKeysChange?: (
    keys: TreeKey[],
    info: { expanded: boolean; key: TreeKey; item?: TreeItemInstance }
  ) => void;

  selectable?: boolean | { multiple?: boolean };
  selectedKeys?: TreeKey[];
  defaultSelectedKeys?: TreeKey[];
  onSelectedKeysChange?: (
    keys: TreeKey[],
    info: { selected: boolean; key: TreeKey; item?: TreeItemInstance }
  ) => void;

  checkable?: boolean | { checkStrictly?: boolean };
  checkedKeys?: TreeKey[];
  defaultCheckedKeys?: TreeKey[];
  onCheckedKeysChange?: (
    keys: TreeKey[],
    info: { checked: boolean; key: TreeKey; item?: TreeItemInstance }
  ) => void;

  searchable?: SearchableConfig;
  filter?: (item: TreeItemInstance) => boolean;
  asyncLoader?: AsyncLoaderConfig;

  renderItem?: (context: RenderItemContext) => React.ReactNode;
  labelRender?: (item: TreeItemInstance) => React.ReactNode;
  extraRender?: (item: TreeItemInstance, tree: TreeInstance) => React.ReactNode;
  itemClassName?: string;
};

export type ProTreeProps = ProTreeBaseProps;

export type ProVirtualTreeProps = ProTreeBaseProps & {
  height: number;
  overscan?: number;
};

export type ProDraggableTreeProps = ProTreeBaseProps & {
  canDrag?: (item: TreeItemInstance) => boolean;
  canDrop?: (info: {
    dragItem: TreeItemInstance;
    dropItem: TreeItemInstance;
    position: DropPosition;
    nextParentKey: TreeKey | null;
    nextIndex: number;
  }) => boolean | string;
  maxDepth?: number;
  allowDropInsideLeaf?: boolean;
  onTreeChange?: (treeData: TreeNode[], intent?: DropIntent) => void;
};

function getSearchableOptions(searchable: SearchableConfig) {
  return typeof searchable === "object" ? searchable : {};
}

function buildCommonFeatures({
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
}: ProTreeBaseProps) {
  const nextFeatures: TreeFeature[] = [
    expandableFeature({
      expandedKeys,
      defaultExpandedKeys,
      onExpandedKeysChange,
    }),
  ];

  if (selectable) {
    const selectableOptions = typeof selectable === "object" ? selectable : {};
    nextFeatures.push(
      selectableFeature({
        ...selectableOptions,
        selectedKeys,
        defaultSelectedKeys,
        onSelectedKeysChange,
      })
    );
  }

  if (checkable) {
    const checkableOptions = typeof checkable === "object" ? checkable : {};
    nextFeatures.push(
      checkableFeature({
        ...checkableOptions,
        checkedKeys,
        defaultCheckedKeys,
        onCheckedKeysChange,
      })
    );
  }

  if (asyncLoader) {
    nextFeatures.push(asyncLoaderFeature(asyncLoader));
  }

  if (searchable) {
    nextFeatures.push(searchFeature(getSearchableOptions(searchable)));
  }

  if (filter) {
    nextFeatures.push(filterFeature({ filter }));
  }

  nextFeatures.push(...(features ?? []));
  return nextFeatures;
}

function DefaultTreeItem({
  item,
  tree,
  checkable,
  labelRender,
  extraRender,
  itemClassName,
  dropIntent,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  item: TreeItemInstance;
  tree: TreeInstance;
  checkable?: ProTreeBaseProps["checkable"];
  labelRender?: ProTreeBaseProps["labelRender"];
  extraRender?: ProTreeBaseProps["extraRender"];
  itemClassName?: string;
  dropIntent?: DropIntent | null;
  draggable?: boolean;
  onDragStart?: React.DragEventHandler<HTMLDivElement>;
  onDragOver?: React.DragEventHandler<HTMLDivElement>;
  onDrop?: React.DragEventHandler<HTMLDivElement>;
  onDragEnd?: React.DragEventHandler<HTMLDivElement>;
}) {
  return (
    <TreeItem
      key={item.key}
      item={item}
      className={cn("relative rounded-sm", itemClassName)}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <TreeTrigger item={item} />
      {checkable && <TreeCheckbox item={item} />}
      <TreeLabel item={item}>{labelRender ?? ((node) => node.node.label)}</TreeLabel>
      {Boolean(item.loading) && <span className="ml-2 text-xs text-muted-foreground">Loading</span>}
      {Boolean(item.loadError) && <span className="ml-2 text-xs text-destructive">Failed</span>}
      {extraRender?.(item, tree)}
      <TreeDropIndicator item={item} intent={dropIntent} />
    </TreeItem>
  );
}

function ProTreeContent(props: ProTreeBaseProps & { tree: TreeInstance }) {
  const { tree, renderItem, checkable, labelRender, extraRender, itemClassName } = props;

  return (
    <TreeViewport>
      {(item) => {
        const defaultNode = (
          <DefaultTreeItem
            item={item}
            tree={tree}
            checkable={checkable}
            labelRender={labelRender}
            extraRender={extraRender}
            itemClassName={itemClassName}
          />
        );
        return renderItem?.({ item, tree, defaultNode }) ?? defaultNode;
      }}
    </TreeViewport>
  );
}

function ProVirtualTreeContent(props: ProVirtualTreeProps & { tree: TreeInstance }) {
  const { tree, renderItem, height, overscan, checkable, labelRender, extraRender, itemClassName } =
    props;

  return (
    <TreeVirtualViewport height={height} overscan={overscan}>
      {(item) => {
        const defaultNode = (
          <DefaultTreeItem
            item={item}
            tree={tree}
            checkable={checkable}
            labelRender={labelRender}
            extraRender={extraRender}
            itemClassName={itemClassName}
          />
        );
        return renderItem?.({ item, tree, defaultNode }) ?? defaultNode;
      }}
    </TreeVirtualViewport>
  );
}

function ProDraggableTreeContent(props: ProDraggableTreeProps & { tree: TreeInstance }) {
  const { tree, renderItem, onTreeChange, checkable, labelRender, extraRender, itemClassName } =
    props;
  const dragStartPoint = React.useRef({ x: 0, y: 0 });
  const dropIntent = tree.getSelectorValue<DropIntent>("dnd.dropIntent");

  return (
    <TreeViewport>
      {(item) => {
        const defaultNode = (
          <DefaultTreeItem
            item={item}
            tree={tree}
            checkable={checkable}
            labelRender={labelRender}
            extraRender={extraRender}
            itemClassName={itemClassName}
            draggable
            dropIntent={dropIntent}
            onDragStart={(event) => {
              dragStartPoint.current = { x: event.clientX, y: event.clientY };
              tree.actions["dnd.startDrag"]?.(item.key);
              event.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(event) => {
              event.preventDefault();
              tree.actions["dnd.updateDropIntent"]?.({
                targetKey: item.key,
                pointer: { x: event.clientX, y: event.clientY },
                initialPointer: dragStartPoint.current,
                targetRect: event.currentTarget.getBoundingClientRect(),
              });
            }}
            onDrop={(event) => {
              event.preventDefault();
              const intent = tree.getSelectorValue<DropIntent>("dnd.dropIntent");
              tree.actions["sortable.drop"]?.();
              onTreeChange?.(tree.nodes, intent);
            }}
            onDragEnd={() => tree.actions["dnd.cancel"]?.()}
          />
        );
        return renderItem?.({ item, tree, defaultNode }) ?? defaultNode;
      }}
    </TreeViewport>
  );
}

function ProTree({
  data,
  treeData,
  features,
  indent,
  rowHeight,
  isLeaf,
  className,
  renderItem,
  ...props
}: ProTreeProps) {
  const mergedFeatures = React.useMemo(
    () => buildCommonFeatures({ ...props, features }),
    [props, features]
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
      {(tree) => <ProTreeContent {...props} renderItem={renderItem} tree={tree} />}
    </TreeRoot>
  );
}

function ProVirtualTree({
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
  ...props
}: ProVirtualTreeProps) {
  const mergedFeatures = React.useMemo(
    () => buildCommonFeatures({ ...props, features }),
    [props, features]
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
        <ProVirtualTreeContent
          {...props}
          renderItem={renderItem}
          height={height}
          overscan={overscan}
          tree={tree}
        />
      )}
    </TreeRoot>
  );
}

function ProDraggableTree({
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
  ...props
}: ProDraggableTreeProps) {
  const mergedFeatures = React.useMemo(
    () => [
      crudFeature(),
      ...buildCommonFeatures({ ...props, features }),
      dndFeature({ canDrag, canDrop, maxDepth, allowDropInsideLeaf }),
      sortableFeature(),
    ],
    [allowDropInsideLeaf, canDrag, canDrop, features, maxDepth, props]
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
      {(tree) => <ProDraggableTreeContent {...props} renderItem={renderItem} tree={tree} />}
    </TreeRoot>
  );
}

export { ProDraggableTree, ProTree, ProVirtualTree };
