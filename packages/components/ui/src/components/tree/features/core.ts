import type {
  CreateTreeOptions,
  DropPosition,
  TreeFeature,
  TreeFeatureContext,
  TreeInstance,
  TreeItemInstance,
  TreeItemStateGetter,
  TreeKey,
  TreeMutationResult,
  TreeNode,
  TreeNotifyOptions,
  TreeStateStore,
  TreeVisiblePipeline,
} from "../types";
import { createContext } from "react";

type Listener = () => void;

type CoreInternals = {
  stateStores: Map<string, TreeStateStore<unknown>>;
  selectors: Map<string, (tree: ReturnType<typeof createTree>) => unknown>;
  itemStates: Map<string, TreeItemStateGetter>;
  visiblePipelines: Map<string, TreeVisiblePipeline>;
  actionGuards: Map<
    string,
    ((payload: unknown, tree: ReturnType<typeof createTree>) => boolean | string)[]
  >;
  rebuildEffects: Listener[];
  disposeEffects: Listener[];
  globalListeners: Set<Listener>;
  nodeListeners: Map<TreeKey, Set<Listener>>;
  selectorListeners: Map<string, Set<Listener>>;
  visibleCache: TreeItemInstance[] | null;
  visibleVersion: number;
  batching: number;
  pendingNotify: TreeNotifyOptions | null;
};

function uniqueKeys(keys: TreeKey[]) {
  return Array.from(new Set(keys));
}

function createResult(
  ok: boolean,
  changedKeys: TreeKey[] = [],
  structureChanged = false,
  reason?: string
): TreeMutationResult {
  return { ok, changedKeys: uniqueKeys(changedKeys), structureChanged, reason };
}

export function resolveFeatures(features: TreeFeature[] = []): TreeFeature[] {
  const byName = new Map<string, TreeFeature>();

  for (const feature of features) {
    if (byName.has(feature.name)) {
      throw new Error(`Tree feature "${feature.name}" is registered more than once.`);
    }
    byName.set(feature.name, feature);
  }

  for (const feature of features) {
    for (const conflict of [...(feature.conflicts ?? []), ...(feature.confilts ?? [])]) {
      if (byName.has(conflict)) {
        throw new Error(`Tree feature "${feature.name}" conflicts with "${conflict}".`);
      }
    }
  }

  const resolved: TreeFeature[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(feature: TreeFeature) {
    if (visited.has(feature.name)) return;
    if (visiting.has(feature.name)) {
      throw new Error(`Circular tree feature dependency detected at "${feature.name}".`);
    }

    visiting.add(feature.name);
    for (const dependency of feature.depends ?? []) {
      const dependencyFeature = byName.get(dependency);
      if (!dependencyFeature) {
        throw new Error(`Tree feature "${feature.name}" depends on missing "${dependency}".`);
      }
      visit(dependencyFeature);
    }
    visiting.delete(feature.name);
    visited.add(feature.name);
    resolved.push(feature);
  }

  for (const feature of features) visit(feature);
  return resolved;
}

function isDescendant(
  tree: { parentByKey: Map<TreeKey, TreeKey | null> },
  ancestor: TreeKey,
  key: TreeKey
) {
  let parentKey = tree.parentByKey.get(key);
  while (parentKey) {
    if (parentKey === ancestor) return true;
    parentKey = tree.parentByKey.get(parentKey) ?? null;
  }
  return false;
}

function cloneWithUpdatedNode(
  nodes: TreeNode[],
  key: TreeKey,
  updater: (node: TreeNode) => TreeNode
): { nodes: TreeNode[]; changed: boolean; structureChanged: boolean } {
  let changed = false;
  let structureChanged = false;

  const nextNodes = nodes.map((node) => {
    if (node.key === key) {
      const nextNode = updater(node);
      changed = nextNode !== node;
      structureChanged = nextNode.children !== node.children;
      return nextNode;
    }

    if (!node.children) return node;
    const childResult = cloneWithUpdatedNode(node.children, key, updater);
    if (!childResult.changed) return node;
    changed = true;
    structureChanged = structureChanged || childResult.structureChanged;
    return { ...node, children: childResult.nodes };
  });

  return { nodes: nextNodes, changed, structureChanged };
}

function cloneWithInsertedNode(
  nodes: TreeNode[],
  parentKey: TreeKey | null,
  node: TreeNode,
  index?: number
): { nodes: TreeNode[]; changed: boolean } {
  if (parentKey === null) {
    const nextNodes = [...nodes];
    nextNodes.splice(index ?? nextNodes.length, 0, node);
    return { nodes: nextNodes, changed: true };
  }

  let changed = false;
  const nextNodes = nodes.map((current) => {
    if (current.key === parentKey) {
      const children = [...(current.children ?? [])];
      children.splice(index ?? children.length, 0, node);
      changed = true;
      return { ...current, children };
    }

    if (!current.children) return current;
    const childResult = cloneWithInsertedNode(current.children, parentKey, node, index);
    if (!childResult.changed) return current;
    changed = true;
    return { ...current, children: childResult.nodes };
  });

  return { nodes: nextNodes, changed };
}

function cloneWithRemovedNode(
  nodes: TreeNode[],
  key: TreeKey
): { nodes: TreeNode[]; removed: TreeNode | null; removedKeys: TreeKey[] } {
  let removed: TreeNode | null = null;
  let removedKeys: TreeKey[] = [];
  const nextNodes: TreeNode[] = [];

  for (const node of nodes) {
    if (node.key === key) {
      removed = node;
      removedKeys = collectNodeKeys(node);
      continue;
    }

    if (!node.children) {
      nextNodes.push(node);
      continue;
    }

    const childResult = cloneWithRemovedNode(node.children, key);
    if (childResult.removed) {
      removed = childResult.removed;
      removedKeys = childResult.removedKeys;
      nextNodes.push({ ...node, children: childResult.nodes });
    } else {
      nextNodes.push(node);
    }
  }

  return { nodes: nextNodes, removed, removedKeys };
}

function collectNodeKeys(node: TreeNode): TreeKey[] {
  return [node.key, ...(node.children ?? []).flatMap(collectNodeKeys)];
}

export function createTree(nodes: TreeNode[] = [], options: CreateTreeOptions = {}) {
  const tree: TreeInstance = {
    nodes,
    indent: options.indent ?? 24,
    items: new Map<TreeKey, TreeItemInstance>(),
    nodeByKey: new Map<TreeKey, TreeNode>(),
    parentByKey: new Map<TreeKey, TreeKey | null>(),
    childrenByKey: new Map<TreeKey | null, TreeKey[]>(),
    depthByKey: new Map<TreeKey, number>(),
    orderedKeys: [] as TreeKey[],
    actions: {},
    _count: 0,

    getItem(key: TreeKey) {
      return this.items.get(key);
    },
    getItemState<T = unknown>(key: TreeKey, stateKey: string): T | undefined {
      const item = this.items.get(key);
      const getter = internals.itemStates.get(stateKey);
      return item && getter ? (getter(item, tree) as T) : undefined;
    },
    getSelectorValue<T = unknown>(key: string) {
      return internals.selectors.get(key)?.(tree) as T | undefined;
    },
    getVisibleItems() {
      if (internals.visibleCache) return internals.visibleCache;
      let items = this.orderedKeys
        .map((key) => this.items.get(key))
        .filter(Boolean) as TreeItemInstance[];
      for (const pipeline of internals.visiblePipelines.values()) {
        items = pipeline(items, tree);
      }
      internals.visibleCache = items;
      return items;
    },
    updateTree(nextNodes: TreeNode[]) {
      this.nodes = nextNodes;
      rebuildIndexes();
      return commit(createResult(true, nextNodes.flatMap(collectNodeKeys), true), {
        structureChanged: true,
        visibleChanged: true,
      });
    },
    updateNode(key: TreeKey, patch: Partial<TreeNode> | ((node: TreeNode) => TreeNode)) {
      const previous = this.nodeByKey.get(key);
      if (!previous) return createResult(false, [], false, `Node "${key}" was not found.`);

      const result = cloneWithUpdatedNode(this.nodes, key, (node) =>
        typeof patch === "function" ? patch(node) : { ...node, ...patch }
      );
      if (!result.changed) return createResult(true, [], false);

      this.nodes = result.nodes;
      if (result.structureChanged) {
        rebuildIndexes();
      } else {
        const nextNode = findNodeByKey(this.nodes, key);
        const item = this.items.get(key);
        if (nextNode && item) {
          this.nodeByKey.set(key, nextNode);
          item.node = nextNode;
          item.disabled = Boolean(nextNode.disabled);
          item.isLeaf = resolveIsLeaf(nextNode);
        }
      }

      return commit(createResult(true, [key], result.structureChanged), {
        changedKeys: [key],
        structureChanged: result.structureChanged,
        visibleChanged: result.structureChanged,
      });
    },
    insertNode(parentKey: TreeKey | null, node: TreeNode, index?: number) {
      if (this.nodeByKey.has(node.key)) {
        return createResult(false, [], false, `Node "${node.key}" already exists.`);
      }
      if (parentKey !== null && !this.nodeByKey.has(parentKey)) {
        return createResult(false, [], false, `Parent node "${parentKey}" was not found.`);
      }

      const result = cloneWithInsertedNode(this.nodes, parentKey, node, index);
      if (!result.changed) return createResult(false, [], false, "Insert target was not found.");
      this.nodes = result.nodes;
      rebuildIndexes();
      return commit(createResult(true, [node.key, ...(parentKey ? [parentKey] : [])], true), {
        changedKeys: [node.key, ...(parentKey ? [parentKey] : [])],
        structureChanged: true,
        visibleChanged: true,
      });
    },
    removeNode(key: TreeKey) {
      if (!this.nodeByKey.has(key))
        return createResult(false, [], false, `Node "${key}" was not found.`);
      const result = cloneWithRemovedNode(this.nodes, key);
      if (!result.removed) return createResult(false, [], false, `Node "${key}" was not found.`);
      const parentKey = this.parentByKey.get(key) ?? null;
      this.nodes = result.nodes;
      rebuildIndexes();
      return commit(
        createResult(true, [...result.removedKeys, ...(parentKey ? [parentKey] : [])], true),
        {
          changedKeys: [...result.removedKeys, ...(parentKey ? [parentKey] : [])],
          structureChanged: true,
          visibleChanged: true,
        }
      );
    },
    moveNode(sourceKey: TreeKey, targetKey: TreeKey, position: DropPosition, index?: number) {
      if (sourceKey === targetKey)
        return createResult(false, [], false, "Cannot move a node onto itself.");
      if (!this.nodeByKey.has(sourceKey))
        return createResult(false, [], false, `Node "${sourceKey}" was not found.`);
      if (!this.nodeByKey.has(targetKey))
        return createResult(false, [], false, `Node "${targetKey}" was not found.`);
      if (isDescendant(this, sourceKey, targetKey)) {
        return createResult(false, [], false, "Cannot move a node into its own descendant.");
      }

      const targetParent = this.parentByKey.get(targetKey) ?? null;
      const siblings = this.childrenByKey.get(targetParent) ?? [];
      const targetIndex = siblings.indexOf(targetKey);
      const nextParentKey = position === "inside" ? targetKey : targetParent;
      let nextIndex =
        position === "inside"
          ? (index ?? this.childrenByKey.get(targetKey)?.length ?? 0)
          : targetIndex;
      if (position === "after") nextIndex = targetIndex + 1;

      const removed = cloneWithRemovedNode(this.nodes, sourceKey);
      if (!removed.removed)
        return createResult(false, [], false, `Node "${sourceKey}" was not found.`);

      if (nextParentKey === targetParent) {
        const previousSourceIndex = siblings.indexOf(sourceKey);
        if (previousSourceIndex !== -1 && previousSourceIndex < nextIndex) nextIndex -= 1;
      }

      const inserted = cloneWithInsertedNode(
        removed.nodes,
        nextParentKey,
        removed.removed,
        nextIndex
      );
      if (!inserted.changed) return createResult(false, [], false, "Move target was not found.");

      const previousParent = this.parentByKey.get(sourceKey) ?? null;
      this.nodes = inserted.nodes;
      rebuildIndexes();
      return commit(
        createResult(
          true,
          uniqueKeys(
            [sourceKey, targetKey, previousParent, nextParentKey].filter(Boolean) as TreeKey[]
          ),
          true
        ),
        {
          changedKeys: uniqueKeys(
            [sourceKey, targetKey, previousParent, nextParentKey].filter(Boolean) as TreeKey[]
          ),
          structureChanged: true,
          visibleChanged: true,
        }
      );
    },
    replaceChildren(parentKey: TreeKey | null, children: TreeNode[]) {
      if (parentKey === null) {
        this.nodes = children;
      } else {
        const result = cloneWithUpdatedNode(this.nodes, parentKey, (node) => ({
          ...node,
          children,
        }));
        if (!result.changed)
          return createResult(false, [], false, `Parent node "${parentKey}" was not found.`);
        this.nodes = result.nodes;
      }
      rebuildIndexes();
      return commit(
        createResult(
          true,
          [parentKey, ...children.map((child) => child.key)].filter(Boolean) as TreeKey[],
          true
        ),
        {
          changedKeys: [parentKey, ...children.map((child) => child.key)].filter(
            Boolean
          ) as TreeKey[],
          structureChanged: true,
          visibleChanged: true,
        }
      );
    },
    batch(fn: () => void) {
      internals.batching += 1;
      try {
        fn();
      } finally {
        internals.batching -= 1;
        if (internals.batching === 0 && internals.pendingNotify) {
          const pending = internals.pendingNotify;
          internals.pendingNotify = null;
          flushNotify(pending);
        }
      }
    },
    subscribe(callback: Listener) {
      internals.globalListeners.add(callback);
      return () => internals.globalListeners.delete(callback);
    },
    subscribeNode(key: TreeKey, callback: Listener) {
      const listeners = internals.nodeListeners.get(key) ?? new Set<Listener>();
      listeners.add(callback);
      internals.nodeListeners.set(key, listeners);
      return () => listeners.delete(callback);
    },
    subscribeSelector(key: string, callback: Listener) {
      const listeners = internals.selectorListeners.get(key) ?? new Set<Listener>();
      listeners.add(callback);
      internals.selectorListeners.set(key, listeners);
      return () => listeners.delete(callback);
    },
    notify(options?: TreeNotifyOptions) {
      notify(options);
    },
    invalidateVisible() {
      internals.visibleCache = null;
      internals.visibleVersion += 1;
    },
  };

  const internals: CoreInternals = {
    stateStores: new Map(),
    selectors: new Map(),
    itemStates: new Map(),
    visiblePipelines: new Map(),
    actionGuards: new Map(),
    rebuildEffects: [],
    disposeEffects: [],
    globalListeners: new Set(),
    nodeListeners: new Map(),
    selectorListeners: new Map(),
    visibleCache: null,
    visibleVersion: 0,
    batching: 0,
    pendingNotify: null,
  };

  function findNodeByKey(list: TreeNode[], key: TreeKey): TreeNode | undefined {
    for (const node of list) {
      if (node.key === key) return node;
      const child = node.children ? findNodeByKey(node.children, key) : undefined;
      if (child) return child;
    }
    return undefined;
  }

  function resolveIsLeaf(node: TreeNode) {
    if (typeof options.isLeaf === "function") return options.isLeaf(node);
    if (typeof options.isLeaf === "boolean") return options.isLeaf;
    if (node.isLeaf !== undefined) return node.isLeaf;
    return !node.children || node.children.length === 0;
  }

  function defineItemStates(item: TreeItemInstance) {
    for (const [key, getter] of internals.itemStates) {
      Object.defineProperty(item, key, {
        configurable: true,
        enumerable: true,
        get: () => getter(item, tree),
      });
    }
  }

  function rebuildIndexes() {
    const previousItems = new Map(tree.items);
    tree.items.clear();
    tree.nodeByKey.clear();
    tree.parentByKey.clear();
    tree.childrenByKey.clear();
    tree.depthByKey.clear();
    tree.orderedKeys = [];

    function walk(list: TreeNode[], parentKey: TreeKey | null, depth: number) {
      tree.childrenByKey.set(
        parentKey,
        list.map((node) => node.key)
      );
      list.forEach((node, index) => {
        const previous = previousItems.get(node.key);
        const item: TreeItemInstance =
          previous ??
          ({
            key: node.key,
            tree,
            parentKey,
            node,
            depth,
            index,
            disabled: Boolean(node.disabled),
            isLeaf: resolveIsLeaf(node),
          } as TreeItemInstance);
        item.parentKey = parentKey;
        item.node = node;
        item.depth = depth;
        item.index = index;
        item.disabled = Boolean(node.disabled);
        item.isLeaf = resolveIsLeaf(node);
        tree.items.set(node.key, item);
        tree.nodeByKey.set(node.key, node);
        tree.parentByKey.set(node.key, parentKey);
        tree.depthByKey.set(node.key, depth);
        tree.orderedKeys.push(node.key);
        defineItemStates(item);
        if (node.children) walk(node.children, node.key, depth + 1);
      });
    }

    walk(tree.nodes, null, 0);
    tree.invalidateVisible();
    for (const effect of internals.rebuildEffects) effect();
  }

  function mergeNotifyOptions(
    previous: TreeNotifyOptions | null,
    next?: TreeNotifyOptions
  ): TreeNotifyOptions {
    return {
      changedKeys: uniqueKeys([...(previous?.changedKeys ?? []), ...(next?.changedKeys ?? [])]),
      structureChanged: Boolean(previous?.structureChanged || next?.structureChanged),
      visibleChanged: Boolean(previous?.visibleChanged || next?.visibleChanged),
      selectorKeys: uniqueKeys([...(previous?.selectorKeys ?? []), ...(next?.selectorKeys ?? [])]),
    };
  }

  function flushNotify(options: TreeNotifyOptions = {}) {
    if (options.visibleChanged || options.structureChanged) tree.invalidateVisible();
    tree._count += 1;
    for (const listener of internals.globalListeners) listener();
    for (const key of options.changedKeys ?? []) {
      for (const listener of internals.nodeListeners.get(key) ?? []) listener();
    }
    for (const key of options.selectorKeys ?? []) {
      for (const listener of internals.selectorListeners.get(key) ?? []) listener();
    }
    if (options.visibleChanged || options.structureChanged) {
      for (const listener of internals.selectorListeners.get("visibleItems") ?? []) listener();
    }
  }

  function notify(options?: TreeNotifyOptions) {
    if (internals.batching > 0) {
      internals.pendingNotify = mergeNotifyOptions(internals.pendingNotify, options);
      return;
    }
    flushNotify(options);
  }

  function commit(result: TreeMutationResult, notifyOptions?: TreeNotifyOptions) {
    if (result.ok) notify(notifyOptions);
    return result;
  }

  function createContext(): TreeFeatureContext {
    return {
      tree,
      registerState<T>(key: string, initialValue: T) {
        if (internals.stateStores.has(key)) {
          throw new Error(`Tree feature state "${key}" is already registered.`);
        }
        let value = initialValue;
        const store: TreeStateStore<T> = {
          get: () => value,
          set: (next, notifyOptions) => {
            value = typeof next === "function" ? (next as (previous: T) => T)(value) : next;
            notify({ selectorKeys: [key], ...notifyOptions });
          },
        };
        internals.stateStores.set(key, store as TreeStateStore<unknown>);
        return store;
      },
      registerAction<TArgs extends unknown[], TResult>(
        key: string,
        action: (...args: TArgs) => TResult
      ) {
        if (tree.actions[key]) throw new Error(`Tree action "${key}" is already registered.`);
        tree.actions[key] = action as TreeInstance["actions"][string];
        return action;
      },
      registerSelector<T>(key: string, selector: (currentTree: typeof tree) => T) {
        if (internals.selectors.has(key))
          throw new Error(`Tree selector "${key}" is already registered.`);
        internals.selectors.set(key, selector as (currentTree: typeof tree) => unknown);
      },
      registerItemState<T>(key: string, getValue: TreeItemStateGetter<T>) {
        if (internals.itemStates.has(key))
          throw new Error(`Tree item state "${key}" is already registered.`);
        internals.itemStates.set(key, getValue as TreeItemStateGetter);
        for (const item of tree.items.values()) defineItemStates(item);
      },
      registerVisiblePipeline(name: string, pipeline: TreeVisiblePipeline) {
        if (internals.visiblePipelines.has(name)) {
          throw new Error(`Tree visible pipeline "${name}" is already registered.`);
        }
        internals.visiblePipelines.set(name, pipeline);
        tree.invalidateVisible();
      },
      registerActionGuard(actionKey, guard) {
        const guards = internals.actionGuards.get(actionKey) ?? [];
        guards.push(guard as (payload: unknown, currentTree: typeof tree) => boolean | string);
        internals.actionGuards.set(actionKey, guards);
      },
      onRebuild(effect) {
        internals.rebuildEffects.push(effect);
      },
      onDispose(effect) {
        internals.disposeEffects.push(effect);
      },
      invalidateVisible: tree.invalidateVisible,
      notify,
    };
  }

  rebuildIndexes();
  const context = createContext();
  for (const feature of resolveFeatures(options.features)) {
    feature.install(context);
  }
  rebuildIndexes();

  return tree;
}
