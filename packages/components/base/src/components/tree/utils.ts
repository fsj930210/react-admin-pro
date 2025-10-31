/** biome-ignore-all lint:suspicious/noExplicitAny*/

import type { DropPosition, TreeItemInstance, TreeNode } from "./types";
export function defineProperty(
  obj: Record<string, any>,
  key: string,
  descriptor: PropertyDescriptor
) {
  const desc = Object.getOwnPropertyDescriptor(obj, key);
  if (desc && desc.configurable) {
    delete obj[key];
  }
  Object.defineProperty(obj, key, {
    ...desc,
    ...descriptor,
    configurable: true,
  });
}

export function getItemsByKeys(
  items: Map<string, TreeItemInstance>,
  keys: string[]
): TreeItemInstance[] {
  return keys.map((key) => items.get(key) as TreeItemInstance);
}

/**
 * findAndRemove: 在树中找到 key 并移除它，返回被移除的节点与新树（深拷贝处理）
 */
export function findAndRemove(
  key: string,
  treeData: TreeNode[]
): { node: TreeNode | null; tree: TreeNode[] } {
  // 深拷贝以保持不可变（UI 层可以选择直接修改）
  const clone = JSON.parse(JSON.stringify(treeData)) as TreeNode[];
  let removed: TreeNode | null = null;

  function walk(list: TreeNode[]) {
    for (let i = 0; i < list.length; i++) {
      const n = list[i];
      if (n.key === key) {
        removed = list.splice(i, 1)[0];
        return true;
      }
      if (n.children && walk(n.children)) return true;
    }
    return false;
  }

  walk(clone);
  return { node: removed, tree: clone };
}

/**
 * insertNode: 在 treeData 中把 dragNode 插入到以 dropKey 为目标的位置
 * - dropPosition === 0 -> 成为 dropKey 的最后一个子节点
 * - dropPosition === -1 -> 插入到 dropKey 所在数组的 dropKey 之前
 * - dropPosition === 1 -> 插入到 dropKey 所在数组的 dropKey 之后
 *
 * 返回新的树（不修改入参）
 */
export function insertNode(
  dragNode: TreeNode,
  dropKey: string,
  dropPosition: DropPosition,
  treeData: TreeNode[]
): TreeNode[] {
  const clone = JSON.parse(JSON.stringify(treeData)) as TreeNode[];

  function walk(list: TreeNode[]): boolean {
    for (let i = 0; i < list.length; i++) {
      const n = list[i];
      if (n.key === dropKey) {
        if (dropPosition === 0) {
          n.children = n.children || [];
          n.children.push(dragNode);
        } else {
          list.splice(i + (dropPosition === 1 ? 1 : 0), 0, dragNode);
        }
        return true;
      }
      if (n.children && walk(n.children)) return true;
    }
    return false;
  }

  // 如果没有找到 dropKey，追加到根（保守处理）
  if (!walk(clone)) {
    if (dropPosition === 0) {
      // push at root
      clone.push(dragNode);
    } else {
      clone.push(dragNode);
    }
  }

  return clone;
}

/**
 * isDescendant: 判断 candidateKey 是否为 nodeKey 的后代（nodeKey 的子孙）
 */
export function isDescendant(
  nodeKey: string,
  candidateKey: string,
  treeData: TreeNode[]
): boolean {
  const node = findNode(nodeKey, treeData);
  if (!node || !node.children) return false;

  function walk(list: TreeNode[]): boolean {
    for (const n of list) {
      if (n.key === candidateKey) return true;
      if (n.children && walk(n.children)) return true;
    }
    return false;
  }

  return walk(node.children);
}

/**
 * moveNode: remove then insert. If invalid (drop into self/descendant) returns original treeData.
 */
export function moveNode(
  dragKey: string,
  dropKey: string,
  dropPosition: DropPosition,
  treeData: TreeNode[]
): TreeNode[] {
  if (dragKey === dropKey) return treeData;
  // Prevent dropping into own descendant
  if (isDescendant(dragKey, dropKey, treeData)) {
    return treeData;
  }

  const { node: removedNode, tree: afterRemoval } = findAndRemove(
    dragKey,
    treeData
  );
  if (!removedNode) return treeData;

  const afterInsert = insertNode(
    removedNode,
    dropKey,
    dropPosition,
    afterRemoval
  );
  return afterInsert;
}

/** small helper: find node by key (returns reference in the provided tree data) */
export function findNode(key: string, treeData: TreeNode[]): TreeNode | null {
  function walk(list: TreeNode[]): TreeNode | null {
    for (const n of list) {
      if (n.key === key) return n;
      if (n.children) {
        const r = walk(n.children);
        if (r) return r;
      }
    }
    return null;
  }
  return walk(treeData);
}
