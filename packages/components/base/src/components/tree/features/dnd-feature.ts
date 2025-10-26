import type {
  DropInfo,
  DropPosition,
  TreeFeature,
  TreeInstance,
  TreeItemInstance,
} from "../types";

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
};

export function dndFeature({
  onDragStart,
  onDragEnd,
  onDrop,
  onDragOver,
}: DndFeatureOptions): TreeFeature {
  return {
    name: "dnd-feature",
    install(tree: TreeInstance) {
      let startMouse: { x: number; y: number } | null = null;
      let draggingKey: string | null = null;
      let dropInfo: DropInfo | null = null;
      const handleDragStart = (
        event: React.DragEvent<HTMLElement>,
        item: TreeItemInstance
      ) => {
        const { clientX, clientY } = event;
        startMouse = { x: clientX, y: clientY };
        draggingKey = item.key;
        dropInfo = null;
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
        const target =
          targetEl ||
          (document.querySelector(
            `[data-key="${item.key}"]`
          ) as HTMLElement | null);
        dropInfo = updateDragPosition(event, target, treeContainerEl);
        onDragOver?.(event, item, dropInfo as DropInfo);
        return dropInfo;
      };
      const handleDrop = (
        event: React.DragEvent<HTMLElement>,
        item: TreeItemInstance
      ) => {
        if (!dropInfo) {
          handleDragEnd(event, item);
          dropInfo = null;
          return;
        }
        if (!draggingKey) {
          handleDragEnd(event, item);
          dropInfo = null;
          return;
        }
        onDrop?.(event, item, dropInfo as DropInfo);
      };
      tree.getDraggingKey = () => draggingKey;

      const updateDragPosition = (
        event: { clientX: number; clientY: number },
        targetEl: HTMLElement | null,
        treeContainerEl: HTMLElement | null,
        indent?: number
      ) => {
        if (!startMouse || !draggingKey) return null;
        if (!targetEl || !treeContainerEl) return null;

        const targetRect = targetEl.getBoundingClientRect();
        const treeRect = treeContainerEl.getBoundingClientRect();

        // 水平层级偏移：基于 startMouse.x 与 indent（rc-tree 做法）
        const rawLevel = (event.clientX - startMouse.x) / (indent || 0);
        const dropLevelOffset = Math.round(rawLevel);

        // 垂直位置判断：使用目标高度的 25% 作为前/inner/后 边界（rc-tree）
        const gap = targetRect.height * 0.25;
        const offsetY = event.clientY - targetRect.top;
        let dropPosition: DropPosition;
        if (offsetY <= gap) {
          dropPosition = -1;
        } else if (offsetY >= targetRect.height - gap) {
          dropPosition = 1;
        } else {
          dropPosition = 0;
        }

        // rect 相对于树容器
        const rectTop =
          dropPosition === 1
            ? targetRect.bottom - treeRect.top
            : targetRect.top - treeRect.top;
        const rectHeight =
          dropPosition === 0
            ? targetRect.height
            : Math.min(2, targetRect.height);

        const rect = {
          left: targetRect.left - treeRect.left,
          top: rectTop,
          width: targetRect.width,
          height: rectHeight,
        };

        return {
          dropPosition,
          dropLevelOffset,
          dropTargetKey: (targetEl.getAttribute("data-key") || "") as string,
          rect,
        };
      };

      function resetDragState() {
        draggingKey = null;
        startMouse = null;
        dropInfo = null;
      }
      function init() {
        tree.items.forEach((item) => {
          item.dragStart = (e: React.DragEvent<HTMLElement>) =>
            handleDragStart(e, item);
          item.dragEnd = (e: React.DragEvent<HTMLElement>) =>
            handleDragEnd(e, item);
          item.dragOver = (
            e: React.DragEvent<HTMLElement>,
            treeContainerEl: HTMLElement | null,
            targetEl?: HTMLElement | null
          ) => handleDragOver(e, item, treeContainerEl, targetEl);
          item.drop = (e: React.DragEvent<HTMLElement>) => handleDrop(e, item);
        });
      }
      init();
      tree.onRebuild = () => {
        init();
        // 重建树后重置拖拽状态
        if (draggingKey) {
          resetDragState();
        }
      };
    },
  };
}
