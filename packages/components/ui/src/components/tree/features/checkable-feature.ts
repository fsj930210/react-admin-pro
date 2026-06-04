import type { TreeFeature, TreeItemInstance, TreeKey } from "../types";

export interface CheckableOptions {
  checkedKeys?: TreeKey[];
  defaultCheckedKeys?: TreeKey[];
  checkStrictly?: boolean;
  onCheckedKeysChange?: (
    keys: TreeKey[],
    info: { checked: boolean; key: TreeKey; item?: TreeItemInstance }
  ) => void;
  onCheck?: (
    checkedKeys: TreeKey[],
    checkedItems: TreeItemInstance[],
    checkInfo: { checked: boolean; node: TreeItemInstance }
  ) => void;
}

function collectDescendantKeys(
  tree: { childrenByKey: Map<TreeKey | null, TreeKey[]> },
  key: TreeKey
): TreeKey[] {
  const result: TreeKey[] = [];
  const walk = (currentKey: TreeKey) => {
    for (const childKey of tree.childrenByKey.get(currentKey) ?? []) {
      result.push(childKey);
      walk(childKey);
    }
  };
  walk(key);
  return result;
}

function collectAncestorKeys(
  tree: { parentByKey: Map<TreeKey, TreeKey | null> },
  key: TreeKey
): TreeKey[] {
  const result: TreeKey[] = [];
  let parentKey = tree.parentByKey.get(key) ?? null;
  while (parentKey) {
    result.push(parentKey);
    parentKey = tree.parentByKey.get(parentKey) ?? null;
  }
  return result;
}

export function checkableFeature({
  checkedKeys,
  defaultCheckedKeys,
  checkStrictly = false,
  onCheckedKeysChange,
  onCheck,
}: CheckableOptions = {}): TreeFeature {
  return {
    name: "checkable-feature",
    install(ctx) {
      const isControlled = checkedKeys !== undefined;
      const store = ctx.registerState<Set<TreeKey>>(
        "checkable.checkedKeys",
        new Set(checkedKeys ?? defaultCheckedKeys ?? [])
      );
      let indeterminateCache = new Map<TreeKey, boolean>();

      const getSet = () => new Set(isControlled ? checkedKeys : store.get());
      const rebuildIndeterminate = (set = getSet()) => {
        const cache = new Map<TreeKey, boolean>();
        const visit = (key: TreeKey): { checkedCount: number; total: number; partial: boolean } => {
          const children = ctx.tree.childrenByKey.get(key) ?? [];
          if (children.length === 0) {
            return { checkedCount: set.has(key) ? 1 : 0, total: 1, partial: false };
          }
          let checkedCount = 0;
          let partial = false;
          for (const childKey of children) {
            const child = visit(childKey);
            if (set.has(childKey)) checkedCount += 1;
            if (child.partial || (child.checkedCount > 0 && child.checkedCount < child.total))
              partial = true;
          }
          const indeterminate =
            !checkStrictly && ((checkedCount > 0 && checkedCount < children.length) || partial);
          cache.set(key, indeterminate);
          return { checkedCount, total: children.length, partial: indeterminate };
        };
        for (const rootKey of ctx.tree.childrenByKey.get(null) ?? []) visit(rootKey);
        indeterminateCache = cache;
      };

      const commit = (
        next: Set<TreeKey>,
        key: TreeKey,
        checked: boolean,
        changedKeys: TreeKey[]
      ) => {
        rebuildIndeterminate(next);
        if (!isControlled) {
          store.set(next, { changedKeys, selectorKeys: ["checkedKeys"] });
        } else {
          ctx.notify({ changedKeys, selectorKeys: ["checkedKeys"] });
        }
        const keys = Array.from(next);
        const item = ctx.tree.getItem(key);
        onCheckedKeysChange?.(keys, { checked, key, item });
        if (item) {
          onCheck?.(
            keys,
            keys.map((itemKey) => ctx.tree.getItem(itemKey)).filter(Boolean) as TreeItemInstance[],
            { checked, node: item }
          );
        }
      };

      const check = (key: TreeKey, checked = true) => {
        const item = ctx.tree.getItem(key);
        if (!item || item.disabled) return;
        const next = getSet();
        const changedKeys = new Set<TreeKey>([key]);

        if (checkStrictly) {
          if (checked) next.add(key);
          else next.delete(key);
        } else {
          const keys = [key, ...collectDescendantKeys(ctx.tree, key)];
          for (const itemKey of keys) {
            const current = ctx.tree.getItem(itemKey);
            if (current?.disabled) continue;
            changedKeys.add(itemKey);
            if (checked) next.add(itemKey);
            else next.delete(itemKey);
          }

          for (const ancestorKey of collectAncestorKeys(ctx.tree, key)) {
            changedKeys.add(ancestorKey);
            const children = ctx.tree.childrenByKey.get(ancestorKey) ?? [];
            const enabledChildren = children.filter(
              (childKey) => !ctx.tree.getItem(childKey)?.disabled
            );
            if (
              enabledChildren.length > 0 &&
              enabledChildren.every((childKey) => next.has(childKey))
            ) {
              next.add(ancestorKey);
            } else {
              next.delete(ancestorKey);
            }
          }
        }

        commit(next, key, checked, Array.from(changedKeys));
      };

      ctx.tree.check = check;
      ctx.tree.uncheck = (key) => check(key, false);
      ctx.tree.getCheckedKeys = () => Array.from(getSet());
      ctx.tree.updateCheckedKeys = (keys) => {
        const next = new Set(keys);
        rebuildIndeterminate(next);
        if (!isControlled) store.set(next, { changedKeys: keys, selectorKeys: ["checkedKeys"] });
        onCheckedKeysChange?.(keys, { checked: true, key: keys[0] ?? "", item: undefined });
      };

      ctx.registerItemState("checked", (item) => getSet().has(item.key));
      ctx.registerItemState("indeterminate", (item) => indeterminateCache.get(item.key) ?? false);
      ctx.onRebuild(() => rebuildIndeterminate());
      rebuildIndeterminate();
    },
  };
}
