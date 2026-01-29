import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 通用树节点接口
 */
export interface TreeNode {
  children?: TreeNode[];
}

/**
 * 通用树遍历方法
 * @param tree 树结构数组
 * @param callback 回调函数，接收当前节点、层级和路径，返回 true 时停止遍历
 * @param traversalType 遍历类型：'dfs' 或 'bfs'
 * @returns 找到的节点或 null
 */
export function traverseTree<T extends TreeNode>(
  tree: T[],
  callback: (node: T, level: number, path: T[]) => boolean | void,
  traversalType: 'dfs' | 'bfs' = 'dfs'
): T | null {
  if (traversalType === 'dfs') {
    const stack: Array<{ node: T; level: number; path: T[] }> = [];
    
    const len = tree.length;
    for (let i = 0; i < len; i++) {
      stack.push({ node: tree[i], level: 0, path: [] });
    }
    
    while (stack.length > 0) {
      const { node, level, path } = stack.pop()!;
      
      const result = callback(node, level, path);
      if (result === true) {
        return node;
      }
      
      if (node.children && node.children.length > 0) {
        const children = node.children as T[];
        const childrenLen = children.length;
        for (let i = childrenLen - 1; i >= 0; i--) {
          stack.push({ 
            node: children[i], 
            level: level + 1, 
            path: [...path, children[i]] 
          });
        }
      }
    }
  } else {
    const queue: Array<{ node: T; level: number; path: T[] }> = [];
    
    const len = tree.length;
    for (let i = 0; i < len; i++) {
      queue.push({ node: tree[i], level: 0, path: [] });
    }
    
    let index = 0;
    while (index < queue.length) {
      const { node, level, path } = queue[index];
      
      const result = callback(node, level, path);
      if (result === true) {
        return node;
      }
      
      if (node.children && node.children.length > 0) {
        const children = node.children as T[];
        const childrenLen = children.length;
        for (let i = 0; i < childrenLen; i++) {
          queue.push({ 
            node: children[i], 
            level: level + 1, 
            path: [...path, children[i]] 
          });
        }
      }
      
      index++;
    }
  }
  
  return null;
}

/**
 * 通用深度优先搜索方法
 * @param tree 树结构数组
 * @param callback 回调函数，接收当前节点、层级和路径，返回 true 时停止搜索并返回当前节点
 * @returns 找到的节点或 null
 */
export function dfsSearch<T extends TreeNode>(
  tree: T[],
  callback: (node: T, level: number, path: T[]) => boolean | void
): T | null {
  return traverseTree(tree, callback, 'dfs');
}

/**
 * 通用广度优先搜索方法
 * @param tree 树结构数组
 * @param callback 回调函数，接收当前节点、层级和路径，返回 true 时停止搜索并返回当前节点
 * @returns 找到的节点或 null
 */
export function bfsSearch<T extends TreeNode>(
  tree: T[],
  callback: (node: T, level: number, path: T[]) => boolean | void
): T | null {
  return traverseTree(tree, callback, 'bfs');
}
