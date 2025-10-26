// 基础节点类型
export interface TreeNode {
  key: string;
  label: string;
  children?: TreeNode[];
  disabled?: boolean;
}

// 定义特性类型
export interface TreeFeature {
  name: string;
  depends?: string[];
  confilts?: string[];
  install: (tree: TreeInstance) => void;
}

// 基础TreeInstance接口
export interface TreeInstance {
  nodes: TreeNode[];
  items: Map<string, TreeItemInstance>;
  getItem: (key: string) => TreeItemInstance | undefined;
  updateTree: (nodes: TreeNode[]) => void;
  rebuildTree: () => void;
  subscribe: (callback: () => void) => () => void;
  notify: () => void;
  buildItems: (nodes: TreeNode[], parentKey?: string, depth?: number) => void;
  getVisibleItems: () => TreeItemInstance[];
  onRebuild?: () => void;
  _count: number;
}

export interface TreeItemInstance {
  key: string;
  tree: TreeInstance;
  parentKey?: string;
  node: TreeNode;
  depth: number;
  expanded?: boolean;
  isLeaf?: boolean;
}

export interface CreateTreeOptions {
  features: TreeFeature[];
  isLeafCondition?: (node: TreeNode) => boolean;
}

export type DropPosition = -1 | 0 | 1;
export interface DropInfo {
  dropPosition: DropPosition;
  dropLevelOffset: number; // 与 rc-tree 一样： Math.round((clientX - startMouseX) / indent)
  dropTargetKey: string;
  // rect is relative to tree container (left/top in px, width/height in px)
  rect: { left: number; top: number; width: number; height: number };
}
