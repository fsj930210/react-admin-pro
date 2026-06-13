/** biome-ignore-all lint/correctness/useExhaustiveDependencies: feature arrays must stay stable for TreeRoot so the tree instance is not recreated on every render. */

import {
  TreeCheckbox,
  TreeDropIndicator,
  TreeItem,
  TreeLabel,
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
import { useTranslation } from "@rap/i18n";
import { cn } from "@rap/utils";
import { useRef } from "react";
import type { DragEventHandler, MouseEventHandler } from "react";
import type {
  DraggableTreeProps,
  DropIntent,
  TreeBaseProps,
  TreeDraggableConfig,
  TreeFeature,
  TreeInstance,
  TreeItemInstance,
  VirtualTreeProps,
} from "./types";

export function getSearchableOptions(searchable: TreeBaseProps["searchable"]) {
  return typeof searchable === "object" ? searchable : {};
}

export function buildCommonFeatures({
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
}: TreeBaseProps) {
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
      }),
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
      }),
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

export function buildDraggableFeatures(
  props: TreeBaseProps,
  draggable?: TreeDraggableConfig,
) {
  const draggableOptions = typeof draggable === "object" ? draggable : {};
  return [
    crudFeature(),
    ...buildCommonFeatures(props),
    dndFeature(draggableOptions),
    sortableFeature(),
  ];
}

export function DefaultTreeItem({
  item,
  tree,
  checkable,
  labelRender,
  extraRender,
  onItemContextMenu,
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
  checkable?: TreeBaseProps["checkable"];
  labelRender?: TreeBaseProps["labelRender"];
  extraRender?: TreeBaseProps["extraRender"];
  onItemContextMenu?: TreeBaseProps["onItemContextMenu"];
  itemClassName?: string;
  dropIntent?: DropIntent | null;
  draggable?: boolean;
  onDragStart?: DragEventHandler<HTMLDivElement>;
  onDragOver?: DragEventHandler<HTMLDivElement>;
  onDrop?: DragEventHandler<HTMLDivElement>;
  onDragEnd?: DragEventHandler<HTMLDivElement>;
}) {
  const { t } = useTranslation("pro");
  const handleContextMenu: MouseEventHandler<HTMLDivElement> | undefined = onItemContextMenu
    ? (event) => onItemContextMenu(event, { item, tree })
    : undefined;

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
      onContextMenu={handleContextMenu}
    >
      <TreeTrigger item={item} />
      {checkable && <TreeCheckbox item={item} />}
      <TreeLabel item={item}>{labelRender ?? ((node) => node.node.label)}</TreeLabel>
      {Boolean(item.loading) && (
        <span className="ml-2 text-xs text-muted-foreground">{t("tree.loading")}</span>
      )}
      {Boolean(item.loadError) && (
        <span className="ml-2 text-xs text-destructive">{t("tree.failed")}</span>
      )}
      {extraRender?.(item, tree)}
      <TreeDropIndicator item={item} intent={dropIntent} />
    </TreeItem>
  );
}

export function TreeContent(props: TreeBaseProps & { tree: TreeInstance }) {
  const {
    tree,
    renderItem,
    checkable,
    labelRender,
    extraRender,
    onItemContextMenu,
    itemClassName,
  } = props;

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
            onItemContextMenu={onItemContextMenu}
            itemClassName={itemClassName}
          />
        );
        return renderItem?.({ item, tree, defaultNode }) ?? defaultNode;
      }}
    </TreeViewport>
  );
}

export function VirtualTreeContent(props: VirtualTreeProps & { tree: TreeInstance }) {
  const {
    tree,
    renderItem,
    height,
    overscan,
    checkable,
    labelRender,
    extraRender,
    onItemContextMenu,
    itemClassName,
  } = props;

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
            onItemContextMenu={onItemContextMenu}
            itemClassName={itemClassName}
          />
        );
        return renderItem?.({ item, tree, defaultNode }) ?? defaultNode;
      }}
    </TreeVirtualViewport>
  );
}

export function DraggableTreeContent(props: DraggableTreeProps & { tree: TreeInstance }) {
  const {
    tree,
    renderItem,
    onTreeChange,
    checkable,
    labelRender,
    extraRender,
    onItemContextMenu,
    itemClassName,
  } = props;
  const dragStartPoint = useRef({ x: 0, y: 0 });
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
            onItemContextMenu={onItemContextMenu}
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

export function DraggableVirtualTreeContent(
  props: DraggableTreeProps & { height: number; overscan?: number; tree: TreeInstance },
) {
  const {
    tree,
    renderItem,
    onTreeChange,
    height,
    overscan,
    checkable,
    labelRender,
    extraRender,
    onItemContextMenu,
    itemClassName,
  } = props;
  const dragStartPoint = useRef({ x: 0, y: 0 });
  const dropIntent = tree.getSelectorValue<DropIntent>("dnd.dropIntent");

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
            onItemContextMenu={onItemContextMenu}
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
    </TreeVirtualViewport>
  );
}
