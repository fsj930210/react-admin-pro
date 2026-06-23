/** biome-ignore-all lint/correctness/useExhaustiveDependencies: feature arrays must stay stable for TreeRoot so the tree instance is not recreated on every render. */

import { AutoComplete } from "@rap/components-pro/auto-complete";
import { Input } from "@rap/components-pro/input";
import { TreeRoot } from "@rap/components-ui/tree";
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
import {
  useRef,
  useState,
  type DragEventHandler,
  type MouseEventHandler,
  type ReactNode,
} from "react";
import type {
  DraggableTreeProps,
  DropIntent,
  SearchableConfig,
  TreeBaseProps,
  TreeDraggableConfig,
  TreeFeature,
  TreeInstance,
  TreeItemInstance,
  TreeNode,
  TreeSearchOption,
  VirtualTreeProps,
} from "./types";

export function getSearchableOptions(searchable: TreeBaseProps["searchable"]) {
  if (typeof searchable !== "object") return {};
  return {
    onSearch: searchable.onSearch
      ? (keyword: string, matchedKeys: string[], matchedItems: TreeItemInstance[]) =>
          searchable.onSearch?.(keyword, { async: false, matchedKeys, matchedItems })
      : undefined,
  };
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

export function buildDraggableFeatures(props: TreeBaseProps, draggable?: TreeDraggableConfig) {
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
  searchable,
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
  searchable?: TreeBaseProps["searchable"];
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
      <TreeLabel item={item}>{labelRender ?? renderTreeLabel}</TreeLabel>
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

function renderTreeLabel(item: TreeItemInstance) {
  const segments = item.tree.getItemState<{ text: string; matched: boolean }[]>(
    item.key,
    "matchedSegments"
  );
  if (!segments) return item.node.label;

  return segments.map((segment, index) => (
    <span
      // biome-ignore lint/suspicious/noArrayIndexKey: segments are stable text slices for the current label render.
      key={`${item.key}-${index}`}
      className={segment.matched ? "text-destructive" : undefined}
      style={segment.matched ? { color: "var(--destructive)" } : undefined}
    >
      {segment.text}
    </span>
  ));
}

function getSearchConfig(search: SearchableConfig | undefined) {
  return typeof search === "object" ? search : {};
}

function getTreeKeys(nodes: TreeNode[]) {
  const keys: string[] = [];
  const collect = (items: TreeNode[]) => {
    for (const item of items) {
      keys.push(item.key);
      if (item.children) collect(item.children);
    }
  };
  collect(nodes);
  return keys;
}

function SyncTreeSearch({ tree }: { tree: TreeInstance }) {
  const [keyword, setKeyword] = useState("");

  return (
    <Input
      value={keyword}
      placeholder="Search"
      className="mb-2"
      allowClear
      onClear={() => {
        setKeyword("");
        tree.clearSearch?.();
      }}
      onChange={(value) => {
        const nextKeyword = String(value);
        setKeyword(nextKeyword);
        tree.search?.(nextKeyword);
      }}
    />
  );
}

function AsyncSearchTreeContent({
  tree,
  baseProps,
}: {
  tree: TreeInstance;
  baseProps: TreeBaseProps;
}) {
  return (
    <TreeContent
      {...baseProps}
      asyncLoader={undefined}
      searchable={baseProps.searchable}
      tree={tree}
    />
  );
}

function AsyncSearchTree({
  data,
  baseProps,
}: {
  data: TreeNode[];
  baseProps: TreeBaseProps;
}) {
  return (
    <TreeRoot
      data={data}
      features={[
        expandableFeature({ defaultExpandedKeys: getTreeKeys(data) }),
        searchFeature(),
      ]}
      indent={baseProps.indent}
      rowHeight={baseProps.rowHeight}
      isLeaf={(node) => !node.children || node.children.length === 0}
    >
      {(tree) => <AsyncSearchTreeContent tree={tree} baseProps={baseProps} />}
    </TreeRoot>
  );
}

function AsyncTreeSearch({
  search,
  children,
  baseProps,
}: {
  search: SearchableConfig;
  children: ReactNode;
  baseProps: TreeBaseProps;
}) {
  const config = getSearchConfig(search);
  const [keyword, setKeyword] = useState("");
  const [options, setOptions] = useState<TreeSearchOption[]>([]);
  const [searchTreeData, setSearchTreeData] = useState<TreeNode[] | null>(null);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef(0);
  const selectingRef = useRef(false);

  const clearSearch = () => {
    requestIdRef.current += 1;
    setKeyword("");
    setOptions([]);
    setSearchTreeData(null);
    config.onSearch?.("", { async: true, options: [] });
  };

  const handleKeywordChange = async (nextKeyword: string) => {
    setKeyword(nextKeyword);
    setSearchTreeData(null);

    if (!nextKeyword.trim() || !config.searchOptions) {
      clearSearch();
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setLoading(true);
    try {
      const nextOptions = await config.searchOptions(nextKeyword);
      if (requestId !== requestIdRef.current) return;
      setOptions(nextOptions);
      config.onSearch?.(nextKeyword, { async: true, options: nextOptions });
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  };

  const handleSelect = async (option: TreeSearchOption) => {
    if (!config.searchSubtree) return;
    selectingRef.current = true;
    setKeyword(option.label);
    try {
      const nextTree = await config.searchSubtree(option);
      setSearchTreeData(nextTree);
    } finally {
      selectingRef.current = false;
    }
  };

  return (
    <div className="space-y-2">
      <AutoComplete<TreeSearchOption["key"]>
        value={keyword}
        options={options.map((option) => ({
          label: option.label,
          value: option.key,
          raw: option,
        }))}
        placeholder="Search"
        allowClear
        filterOption={false}
        loading={loading}
        onChange={(value) => {
          if (selectingRef.current) return;
          void handleKeywordChange(value);
        }}
        onClear={clearSearch}
        onKeyDown={(event) => {
          if (event.key === "Escape") clearSearch();
        }}
        onSelect={(_, option) => {
          void handleSelect(option.raw as TreeSearchOption);
        }}
        optionRender={(option) => {
          const raw = option.raw as TreeSearchOption;

          return (
            <span className="min-w-0">
              <span className="block truncate">{raw.label}</span>
              {raw.pathLabel && (
                <span className="block truncate text-xs text-muted-foreground">
                  {raw.pathLabel}
                </span>
              )}
            </span>
          );
        }}
      />

      <div hidden={Boolean(searchTreeData)}>{children}</div>
      {searchTreeData && (
        <AsyncSearchTree data={searchTreeData} baseProps={baseProps} />
      )}
    </div>
  );
}

export function TreeSearch({
  tree,
  search,
  asyncLoader,
  baseProps,
  children,
}: {
  tree: TreeInstance;
  search: SearchableConfig | undefined;
  asyncLoader?: TreeBaseProps["asyncLoader"];
  baseProps: TreeBaseProps;
  children: ReactNode;
}) {
  if (!search) return children;
  if (asyncLoader?.loadChildren) {
    return (
      <AsyncTreeSearch search={search} baseProps={baseProps}>
        {children}
      </AsyncTreeSearch>
    );
  }

  return (
    <div className="space-y-2">
      <SyncTreeSearch tree={tree} />
      {children}
    </div>
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
            searchable={props.searchable}
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
            searchable={props.searchable}
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
            searchable={props.searchable}
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
  props: DraggableTreeProps & { height: number; overscan?: number; tree: TreeInstance }
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
            searchable={props.searchable}
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
