import React from "react";
import type {
  DropInfo,
  DropPosition,
  TreeFeature,
  TreeInstance,
  TreeItemInstance,
  TreeNode,
} from "../types";
import { isDescendant, moveNode } from "../utils";

declare module "../types.ts" {
  interface TreeInstance {
    getDraggingKey?: () => string | null;
  }
  interface TreeItemInstance {
    dragStart?: (
      event: React.DragEvent<HTMLElement>,
      item: TreeItemInstance
    ) => void;
    dragEnd?: (
      event: React.DragEvent<HTMLElement>,
      item: TreeItemInstance
    ) => void;
    drop?: (
      event: React.DragEvent<HTMLElement>,
      item: TreeItemInstance
    ) => void;
    dragOver?: (
      event: React.DragEvent<HTMLElement>,
      treeContainerEl: HTMLElement | null,
      targetEl?: HTMLElement | null
    ) => DropInfo | null;
  }
}

type DndFeatureOptions = {
  onDragStart?: (
    event: React.DragEvent<HTMLElement>,
    item: TreeItemInstance
  ) => void;
  onDragEnd?: (
    event: React.DragEvent<HTMLElement>,
    item: TreeItemInstance
  ) => void;
  onDrop?: (
    event: React.DragEvent<HTMLElement>,
    item: TreeItemInstance,
    dropInfo: DropInfo
  ) => void;
  onDragOver?: (
    event: React.DragEvent<HTMLElement>,
    item: TreeItemInstance,
    dropInfo: DropInfo
  ) => void;
  onTreeChange?: (treeData: TreeNode[]) => void;
};

export function dndFeature({
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
  onTreeChange,
}: DndFeatureOptions): TreeFeature {
  return {
    name: "dnd-feature",
    install(tree: TreeInstance) {


      // Store drag state in the tree instance to preserve it across feature reinstallations
      if (!tree.dragState) {
        tree.dragState = {
          startMouse: null,
          draggingKey: null,
          dropInfo: null,
          dragNodeDepth: null,
        };
      }

      let { startMouse, draggingKey, dropInfo, dragNodeDepth } = tree.dragState;

      const handleDragStart = (
        event: React.DragEvent<HTMLElement>,
        item: TreeItemInstance
      ) => {

        if (item.disabled) {
          event.preventDefault();
          return;
        }
        const { clientX, clientY } = event;
        startMouse = { x: clientX, y: clientY };
        draggingKey = item.key;
        dragNodeDepth = item.depth;
        dropInfo = null;
        
        // Update the tree's drag state
        if (tree.dragState) {
          tree.dragState.startMouse = startMouse;
          tree.dragState.draggingKey = draggingKey;
          tree.dragState.dragNodeDepth = dragNodeDepth;
          tree.dragState.dropInfo = dropInfo;
        }
        
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", item.key);
        
        onDragStart?.(event, item);
      };

      const handleDragEnd = (
        event: React.DragEvent<HTMLElement>,
        item: TreeItemInstance
      ) => {
        resetDragState();
        onDragEnd?.(event, item);
      };

      const handleDragOver = (
        event: React.DragEvent<HTMLElement>,
        item: TreeItemInstance,
        treeContainerEl: HTMLElement | null,
        targetEl?: HTMLElement | null
      ) => {
        event.preventDefault();
        
        if (item.disabled || !draggingKey || !startMouse) {
          return null;
        }
        
        if (draggingKey === item.key) {
          return null;
        }
        
        if (isDescendant(draggingKey, item.key, tree.nodes)) {
          return null;
        }

        const target =
          targetEl ||
          (document.querySelector(
            `[data-key="${item.key}"]`
          ) as HTMLElement | null);
        
        dropInfo = updateDragPosition(event, target, treeContainerEl, item);
        
        // Update the tree's drag state
        if (tree.dragState) {
          tree.dragState.dropInfo = dropInfo;
        }
        
        if (dropInfo) {
          event.dataTransfer.dropEffect = "move";
          onDragOver?.(event, item, dropInfo);
        }
        
        return dropInfo;
      };

      const handleDrop = (
        event: React.DragEvent<HTMLElement>,
        item: TreeItemInstance
      ) => {
        event.preventDefault();
        
        if (item.disabled) {
          handleDragEnd(event, item);
          return;
        }
        
        if (!dropInfo) {
          handleDragEnd(event, item);
          return;
        }
        
        if (!draggingKey) {
          handleDragEnd(event, item);
          return;
        }
        
        // 处理节点移动（参考 rc-tree 实现）
        const { dropPosition, dropTargetKey } = dropInfo;
        
        // 调用工具函数移动节点（修正参数顺序）
        const newTreeData = moveNode(
          draggingKey,
          dropTargetKey,
          dropPosition,
          tree.nodes
        );
        
        // 更新树数据
        tree.updateTree(newTreeData);
        
        // 调用回调
        onDrop?.(event, item, dropInfo);
        onTreeChange?.(newTreeData);
        
        // 重置状态
        resetDragState();
      };

      const updateDragPosition = (
        event: React.DragEvent<HTMLElement>,
        targetEl: HTMLElement | null,
        treeContainerEl: HTMLElement | null,
        targetItem: TreeItemInstance
      ): DropInfo | null => {
        if (!startMouse || !draggingKey || !dragNodeDepth) return null;
        if (!targetEl || !treeContainerEl) return null;

        const targetRect = targetEl.getBoundingClientRect();
        const treeRect = treeContainerEl.getBoundingClientRect();
        const { clientX, clientY } = event;

        // 从 tree 实例获取 indent（固定值）
        const indent = tree.indent || 20;

        // 计算水平层级偏移（rc-tree 核心算法）
        const dropLevelOffset = Math.round(
          (clientX - startMouse.x) / indent
        );

        // 计算目标节点的实际层级
        let targetDepth = targetItem.depth;
        
        // 计算垂直位置（rc-tree 核心算法）
        const gap = targetRect.height * 0.25;
        const offsetY = clientY - targetRect.top;
        
        let dropPosition: DropPosition;
        if (offsetY <= gap) {
          dropPosition = -1; // 插入到目标之前
        } else if (offsetY >= targetRect.height - gap) {
          dropPosition = 1;  // 插入到目标之后
        } else {
          dropPosition = 0;  // 成为目标的子节点
        }

        // rc-tree 复杂的层级调整逻辑
        if (dropPosition === 0) {
          // 成为子节点时，层级应该是目标层级 + 1
          targetDepth += 1;
        }

        // 层级边界检查
        const maxDepth = getMaxDepth(tree.nodes);
        const minDepth = 0;
        
        if (targetDepth < minDepth) {
          targetDepth = minDepth;
        }
        if (targetDepth > maxDepth) {
          targetDepth = maxDepth;
        }

        // 计算放置指示器位置（rc-tree 算法）
        const rectTop =
          dropPosition === 1
            ? targetRect.bottom - treeRect.top
            : targetRect.top - treeRect.top;
            
        const rectHeight =
          dropPosition === 0
            ? targetRect.height
            : Math.min(2, targetRect.height);

        const rect = {
          left: targetRect.left - treeRect.left + (targetDepth * indent),
          top: rectTop,
          width: targetRect.width - (targetDepth * indent),
          height: rectHeight,
        };

        return {
          dropPosition,
          dropLevelOffset,
          dropTargetKey: targetItem.key,
          rect,
        };
      };

      // 获取树的最大深度
      function getMaxDepth(nodes: TreeNode[]): number {
        let maxDepth = 0;
        
        function traverse(node: TreeNode, depth: number) {
          if (depth > maxDepth) {
            maxDepth = depth;
          }
          if (node.children && node.children.length > 0) {
            node.children.forEach(child => traverse(child, depth + 1));
          }
        }
        
        nodes.forEach(node => traverse(node, 0));
        return maxDepth;
      }

      function resetDragState() {
        draggingKey = null;
        startMouse = null;
        dropInfo = null;
        dragNodeDepth = null;
        // Update the tree's drag state
        if (tree.dragState) {
          tree.dragState.draggingKey = null;
          tree.dragState.startMouse = null;
          tree.dragState.dropInfo = null;
          tree.dragState.dragNodeDepth = null;
        }
      }

      tree.getDraggingKey = () => draggingKey;

      function init() {
        tree.items.forEach((item) => {
          item.dragStart = (e: React.DragEvent<HTMLElement>, dragItem: TreeItemInstance) =>
            handleDragStart(e, dragItem);
          item.dragEnd = (e: React.DragEvent<HTMLElement>, dragItem: TreeItemInstance) =>
            handleDragEnd(e, dragItem);
          item.dragOver = (
            e: React.DragEvent<HTMLElement>,
            treeContainerEl: HTMLElement | null,
            targetEl?: HTMLElement | null
          ) => handleDragOver(e, item, treeContainerEl, targetEl);
          item.drop = (e: React.DragEvent<HTMLElement>, dropItem: TreeItemInstance) => handleDrop(e, dropItem);
        });
      }

      init();

      if (!tree.onRebuild) tree.onRebuild = [];
      tree.onRebuild.push(() => {
        init();
        if (draggingKey) {
          resetDragState();
        }
      });
    },
  };
}