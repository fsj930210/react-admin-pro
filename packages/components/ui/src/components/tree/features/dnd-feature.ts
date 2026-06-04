import type {
  DropIntent,
  DropPosition,
  TreeFeature,
  TreeItemInstance,
  TreeKey,
  TreePoint,
  TreeRect,
} from "../types";

type DndInput = {
  targetKey: TreeKey;
  pointer: TreePoint;
  initialPointer: TreePoint;
  targetRect: TreeRect;
  indent?: number;
};

type CanDropInfo = {
  dragItem: TreeItemInstance;
  dropItem: TreeItemInstance;
  position: DropPosition;
  nextParentKey: TreeKey | null;
  nextIndex: number;
};

type DndFeatureOptions = {
  allowDropInsideLeaf?: boolean;
  maxDepth?: number;
  dropGapRatio?: number;
  insideIndentThreshold?: number;
  canDrag?: (item: TreeItemInstance) => boolean;
  canDrop?: (info: CanDropInfo) => boolean | string;
};

function isDescendant(parentByKey: Map<TreeKey, TreeKey | null>, ancestor: TreeKey, key: TreeKey) {
  let parentKey = parentByKey.get(key) ?? null;
  while (parentKey) {
    if (parentKey === ancestor) return true;
    parentKey = parentByKey.get(parentKey) ?? null;
  }
  return false;
}

function getSubtreeDepth(
  tree: { childrenByKey: Map<TreeKey | null, TreeKey[]> },
  key: TreeKey
): number {
  const children = tree.childrenByKey.get(key) ?? [];
  if (children.length === 0) return 0;
  return 1 + Math.max(...children.map((childKey) => getSubtreeDepth(tree, childKey)));
}

export function dndFeature({
  allowDropInsideLeaf = true,
  maxDepth,
  dropGapRatio = 0.25,
  insideIndentThreshold = 0.5,
  canDrag,
  canDrop,
}: DndFeatureOptions = {}): TreeFeature {
  return {
    name: "dnd-feature",
    install(ctx) {
      const draggingKey = ctx.registerState<TreeKey | null>("dnd.draggingKey", null);
      const dropIntent = ctx.registerState<DropIntent | null>("dnd.dropIntent", null);

      const validate = (intent: DropIntent): DropIntent => {
        const dragItem = ctx.tree.getItem(intent.dragKey);
        const dropItem = ctx.tree.getItem(intent.dropTargetKey);
        if (!dragItem || !dropItem)
          return { ...intent, valid: false, reason: "Drag or drop item was not found." };
        if (dragItem.key === dropItem.key)
          return { ...intent, valid: false, reason: "Cannot drop onto itself." };
        if (
          intent.nextParentKey &&
          isDescendant(ctx.tree.parentByKey, dragItem.key, intent.nextParentKey)
        ) {
          return { ...intent, valid: false, reason: "Cannot drop into its own descendant." };
        }
        if (!allowDropInsideLeaf && intent.position === "inside" && dropItem.isLeaf) {
          return { ...intent, valid: false, reason: "Leaf nodes cannot accept children." };
        }
        if (maxDepth !== undefined) {
          const nextDepth = intent.nextParentKey
            ? (ctx.tree.depthByKey.get(intent.nextParentKey) ?? 0) + 1
            : 0;
          if (nextDepth + getSubtreeDepth(ctx.tree, dragItem.key) > maxDepth) {
            return { ...intent, valid: false, reason: "Drop would exceed maxDepth." };
          }
        }
        const custom = canDrop?.({
          dragItem,
          dropItem,
          position: intent.position,
          nextParentKey: intent.nextParentKey,
          nextIndex: intent.nextIndex,
        });
        if (custom === false || typeof custom === "string") {
          return {
            ...intent,
            valid: false,
            reason: typeof custom === "string" ? custom : "Drop was rejected.",
          };
        }
        return { ...intent, valid: true, reason: undefined };
      };

      const resolveIntent = (input: DndInput): DropIntent | null => {
        const dragKey = draggingKey.get();
        if (!dragKey) return null;
        const dragItem = ctx.tree.getItem(dragKey);
        const dropItem = ctx.tree.getItem(input.targetKey);
        if (!dragItem || !dropItem) return null;

        const topGap = input.targetRect.height * dropGapRatio;
        const bottomGap = input.targetRect.height * dropGapRatio;
        const indent = input.indent ?? ctx.tree.indent;
        const targetStartX = input.targetRect.left + dropItem.depth * indent;
        const horizontalIndent = input.pointer.x - targetStartX;
        const dropLevelOffset = Math.round(horizontalIndent / indent);
        const wantsInside = horizontalIndent >= indent * insideIndentThreshold;
        let position: DropPosition = "after";
        if (input.pointer.y <= input.targetRect.top + topGap) position = "before";
        else if (input.pointer.y >= input.targetRect.bottom - bottomGap) position = "after";
        else position = wantsInside ? "inside" : "after";

        let nextParentKey: TreeKey | null = dropItem.parentKey;
        let nextIndex = dropItem.index + (position === "after" ? 1 : 0);

        if (position === "inside") {
          nextParentKey = dropItem.key;
          nextIndex = ctx.tree.childrenByKey.get(dropItem.key)?.length ?? 0;
        } else if (horizontalIndent < 0) {
          const upLevels = Math.min(dropItem.depth, Math.ceil(Math.abs(horizontalIndent) / indent));
          let currentItem: TreeItemInstance | undefined = dropItem;
          for (let index = 0; index < upLevels; index += 1) {
            if (!currentItem?.parentKey) break;
            currentItem = ctx.tree.getItem(currentItem.parentKey);
          }
          if (currentItem && currentItem.key !== dropItem.key) {
            nextParentKey = currentItem.parentKey;
            nextIndex = currentItem.index + (position === "after" ? 1 : 0);
          }
        }

        return validate({
          dragKey,
          dropTargetKey: dropItem.key,
          position,
          dropLevelOffset,
          nextParentKey,
          nextIndex,
          valid: true,
        });
      };

      ctx.registerAction("dnd.startDrag", (key: TreeKey) => {
        const item = ctx.tree.getItem(key);
        if (!item || item.disabled || canDrag?.(item) === false) return false;
        draggingKey.set(key, { changedKeys: [key], selectorKeys: ["dnd.draggingKey"] });
        dropIntent.set(null, { selectorKeys: ["dnd.dropIntent"] });
        return true;
      });
      ctx.registerAction("dnd.updateDropIntent", (input: DndInput) => {
        const intent = resolveIntent(input);
        dropIntent.set(intent, { selectorKeys: ["dnd.dropIntent"] });
        return intent;
      });
      ctx.registerAction("dnd.cancel", () => {
        const key = draggingKey.get();
        draggingKey.set(null, { changedKeys: key ? [key] : [], selectorKeys: ["dnd.draggingKey"] });
        dropIntent.set(null, { selectorKeys: ["dnd.dropIntent"] });
      });
      ctx.registerSelector("dnd.dropIntent", () => dropIntent.get());
      ctx.registerItemState("dragging", (item) => draggingKey.get() === item.key);
      ctx.registerItemState("dropTarget", (item) => dropIntent.get()?.dropTargetKey === item.key);
    },
  };
}
