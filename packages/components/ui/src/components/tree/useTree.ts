import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { createTree } from "./features/core";
import type { CreateTreeOptions, TreeInstance, TreeKey, TreeNode } from "./types";

export function useTree(nodes: TreeNode[] = [], options: CreateTreeOptions = {}) {
  const featureKey = useMemo(
    () => (options.features ?? []).map((feature) => feature.name).join("|"),
    [options.features]
  );
  const treeRef = useRef<TreeInstance | null>(null);
  const optionsRef = useRef(options);

  if (
    !treeRef.current ||
    optionsRef.current.indent !== options.indent ||
    optionsRef.current.isLeaf !== options.isLeaf ||
    optionsRef.current.features !== options.features ||
    (optionsRef.current.features ?? []).map((feature) => feature.name).join("|") !== featureKey
  ) {
    optionsRef.current = options;
    treeRef.current = createTree(nodes, options);
  }

  const tree = treeRef.current;
  useSyncExternalStore(
    tree.subscribe,
    () => tree._count,
    () => tree._count
  );

  useEffect(() => {
    tree.updateTree(nodes);
  }, [nodes, tree]);

  return tree;
}

export function useTreeSelector<T>(tree: TreeInstance, selectorKey: string, getSnapshot: () => T) {
  return useSyncExternalStore(
    (callback) => tree.subscribeSelector(selectorKey, callback),
    getSnapshot,
    getSnapshot
  );
}

export function useTreeItem<T>(tree: TreeInstance, key: TreeKey, getSnapshot: () => T) {
  return useSyncExternalStore(
    (callback) => tree.subscribeNode(key, callback),
    getSnapshot,
    getSnapshot
  );
}
