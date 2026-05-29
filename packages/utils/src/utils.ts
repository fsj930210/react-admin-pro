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

type RuntimeImportMeta = ImportMeta & {
  env?: {
    MODE?: string;
  };
};

type RuntimeGlobal = typeof globalThis & {
  process?: {
    env?: {
      NODE_ENV?: string;
    };
  };
};

const runtimeMode =
  (import.meta as RuntimeImportMeta).env?.MODE ??
  (globalThis as RuntimeGlobal).process?.env?.NODE_ENV;

export const isDev = runtimeMode === 'development';

export const isBrowser = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
);

export const isObject = (val: unknown): val is Record<PropertyKey, any> => {
  return val !== null && typeof val === 'object';
};

export const isFunction = (val: unknown): val is (...args: any[]) => any => {
  return typeof val === 'function';
};

export const isString = (val: unknown): val is string => {
  return typeof val === 'string';
};

export const isBoolean = (val: unknown): val is boolean => {
  return typeof val === 'boolean';
};

export const isNumber = (val: unknown): val is number => {
  return typeof val === 'number' && !Number.isNaN(val);
};

export const isUndef = (val: unknown): val is undefined => {
  return typeof val === 'undefined';
};

export const isNonNullable = <T>(val: T): val is NonNullable<T> => {
  return val !== undefined && val !== null;
};

export const isThenable = <T>(val: any): val is PromiseLike<T> => {
  return isNonNullable(val) && isFunction(val.then);
};

export * from './compose-refs';
