import type { DropPosition, TreeNode } from "./types";

export function findNode(key: string, treeData: TreeNode[]): TreeNode | null {
  for (const node of treeData) {
    if (node.key === key) return node;
    const child = node.children ? findNode(key, node.children) : null;
    if (child) return child;
  }
  return null;
}

export function isDescendant(nodeKey: string, candidateKey: string, treeData: TreeNode[]): boolean {
  const node = findNode(nodeKey, treeData);
  if (!node?.children) return false;
  return Boolean(findNode(candidateKey, node.children));
}

export function findAndRemove(
  key: string,
  treeData: TreeNode[]
): { node: TreeNode | null; tree: TreeNode[] } {
  let removed: TreeNode | null = null;
  const tree: TreeNode[] = [];
  for (const node of treeData) {
    if (node.key === key) {
      removed = node;
      continue;
    }
    if (node.children) {
      const result = findAndRemove(key, node.children);
      if (result.node) {
        removed = result.node;
        tree.push({ ...node, children: result.tree });
        continue;
      }
    }
    tree.push(node);
  }
  return { node: removed, tree };
}

export function insertNode(
  dragNode: TreeNode,
  dropKey: string,
  dropPosition: DropPosition,
  treeData: TreeNode[]
): TreeNode[] {
  if (dropPosition === "inside") {
    return treeData.map((node) => {
      if (node.key === dropKey) return { ...node, children: [...(node.children ?? []), dragNode] };
      return node.children
        ? { ...node, children: insertNode(dragNode, dropKey, dropPosition, node.children) }
        : node;
    });
  }

  const result: TreeNode[] = [];
  for (const node of treeData) {
    if (node.key === dropKey && dropPosition === "before") result.push(dragNode);
    if (node.children)
      result.push({
        ...node,
        children: insertNode(dragNode, dropKey, dropPosition, node.children),
      });
    else result.push(node);
    if (node.key === dropKey && dropPosition === "after") result.push(dragNode);
  }
  return result;
}

export function moveNode(
  dragKey: string,
  dropKey: string,
  dropPosition: DropPosition,
  treeData: TreeNode[]
): TreeNode[] {
  if (dragKey === dropKey || isDescendant(dragKey, dropKey, treeData)) return treeData;
  const { node, tree } = findAndRemove(dragKey, treeData);
  return node ? insertNode(node, dropKey, dropPosition, tree) : treeData;
}
