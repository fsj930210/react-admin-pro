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
import type { HTMLAttributes, MouseEvent, ReactNode } from "react";

export type RenderItemContext = {
  item: TreeItemInstance;
  tree: TreeInstance;
  defaultNode: ReactNode;
};

export type SearchableConfig =
  | boolean
  | {
      highlightKey?: string;
      onSearch?: (
        keyword: string,
        matchedKeys: TreeKey[],
        matchedItems: TreeItemInstance[],
      ) => void;
    };

export type AsyncLoaderConfig = {
  loadChildren: (node: TreeNode) => Promise<TreeNode[]>;
  onLoadError?: (error: unknown, key: TreeKey) => void;
};

export type TreeVirtualConfig =
  | boolean
  | {
      height?: number;
      overscan?: number;
    };

export type TreeDraggableConfig =
  | boolean
  | {
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
    };

export type TreeBaseProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
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
    info: { expanded: boolean; key: TreeKey; item?: TreeItemInstance },
  ) => void;

  selectable?: boolean | { multiple?: boolean };
  selectedKeys?: TreeKey[];
  defaultSelectedKeys?: TreeKey[];
  onSelectedKeysChange?: (
    keys: TreeKey[],
    info: { selected: boolean; key: TreeKey; item?: TreeItemInstance },
  ) => void;

  checkable?: boolean | { checkStrictly?: boolean };
  checkedKeys?: TreeKey[];
  defaultCheckedKeys?: TreeKey[];
  onCheckedKeysChange?: (
    keys: TreeKey[],
    info: { checked: boolean; key: TreeKey; item?: TreeItemInstance },
  ) => void;

  searchable?: SearchableConfig;
  filter?: (item: TreeItemInstance) => boolean;
  asyncLoader?: AsyncLoaderConfig;

  renderItem?: (context: RenderItemContext) => ReactNode;
  labelRender?: (item: TreeItemInstance) => ReactNode;
  extraRender?: (item: TreeItemInstance, tree: TreeInstance) => ReactNode;
  onItemContextMenu?: (
    event: MouseEvent<HTMLDivElement>,
    context: { item: TreeItemInstance; tree: TreeInstance },
  ) => void;
  itemClassName?: string;
};

export type BasicTreeProps = TreeBaseProps;

export type VirtualTreeProps = TreeBaseProps & {
  height: number;
  overscan?: number;
};

export type DraggableTreeProps = TreeBaseProps & {
  canDrag?: Exclude<TreeDraggableConfig, boolean>["canDrag"];
  canDrop?: Exclude<TreeDraggableConfig, boolean>["canDrop"];
  maxDepth?: number;
  allowDropInsideLeaf?: boolean;
  onTreeChange?: (treeData: TreeNode[], intent?: DropIntent) => void;
};

export type TreeProps = TreeBaseProps & {
  virtual?: TreeVirtualConfig;
  draggable?: TreeDraggableConfig;
  onTreeChange?: (treeData: TreeNode[], intent?: DropIntent) => void;
};

export type {
  DropIntent,
  DropPosition,
  TreeFeature,
  TreeInstance,
  TreeItemInstance,
  TreeKey,
  TreeNode,
};
