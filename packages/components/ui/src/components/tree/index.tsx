import { cn } from "@rap/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown } from "lucide-react";
import { Slot as SlotPrimitive } from "radix-ui";
import { Checkbox } from "../checkbox";
import { TreeContext, useTreeContext } from "./tree-context";
import type {
  CreateTreeOptions,
  DropIntent,
  TreeFeature,
  TreeInstance,
  TreeItemInstance,
  TreeNode,
} from "./types";
import { useTree } from "./useTree";
import {
  useRef,
  type CSSProperties,
  type ComponentProps,
  type HTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

interface TreeRootProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  data?: TreeNode[];
  treeData?: TreeNode[];
  features?: TreeFeature[];
  indent?: number;
  rowHeight?: number;
  isLeaf?: CreateTreeOptions["isLeaf"];
  children: ReactNode | ((tree: TreeInstance) => ReactNode);
}

function TreeRoot({
  data,
  treeData,
  features,
  indent = 24,
  rowHeight = 28,
  isLeaf,
  className,
  style,
  children,
  ...props
}: TreeRootProps) {
  const tree = useTree(data ?? treeData ?? [], { features, indent, isLeaf });
  const mergedStyle = { ...style, "--tree-indent": `${indent}px` } as CSSProperties;

  return (
    <TreeContext value={{ indent, rowHeight, tree }}>
      <div
        data-slot="tree"
        className={cn("flex flex-col overflow-auto", className)}
        style={mergedStyle}
        {...props}
      >
        {typeof children === "function" ? children(tree) : children}
      </div>
    </TreeContext>
  );
}

interface TreeViewportProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  children: (item: TreeItemInstance, tree: TreeInstance) => ReactNode;
}

function TreeViewport({ children, className, ...props }: TreeViewportProps) {
  const { tree } = useTreeContext();
  const items = tree.getVisibleItems();
  return (
    <div data-slot="tree-viewport" className={cn("min-w-0", className)} {...props}>
      {items.map((item) => children(item, tree))}
    </div>
  );
}

interface TreeVirtualViewportProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  height: number;
  overscan?: number;
  children: (item: TreeItemInstance, tree: TreeInstance) => ReactNode;
}

function TreeVirtualViewport({
  height,
  overscan = 5,
  children,
  className,
  style,
  ...props
}: TreeVirtualViewportProps) {
  const { tree, rowHeight } = useTreeContext();
  const parentRef = useRef<HTMLDivElement>(null);
  const items = tree.getVisibleItems();
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      data-slot="tree-virtual-viewport"
      className={cn("overflow-auto", className)}
      style={{ ...style, height }}
      {...props}
    >
      <div style={{ position: "relative", width: "100%", height: rowVirtualizer.getTotalSize() }}>
        {rowVirtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={item.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: rowHeight,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {children(item, tree)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TreeItemProps extends HTMLAttributes<HTMLDivElement> {
  item: TreeItemInstance;
  asChild?: boolean;
}

function TreeItem({ item, className, asChild, children, style, ...props }: TreeItemProps) {
  const { indent, rowHeight, tree } = useTreeContext();
  const Comp = asChild ? SlotPrimitive.Slot : "div";
  const mergedStyle = {
    ...style,
    height: rowHeight,
    "--tree-padding": `${item.depth * indent}px`,
  } as CSSProperties;

  return (
    <Comp
      data-slot="tree-item"
      data-key={item.key}
      data-disabled={item.disabled}
      data-leaf={item.isLeaf}
      data-selected={Boolean(item.selected)}
      data-expanded={Boolean(item.expanded)}
      data-checked={Boolean(item.checked)}
      data-indeterminate={Boolean(item.indeterminate)}
      data-matched={Boolean(tree.getItemState(item.key, "matched"))}
      aria-expanded={!item.isLeaf ? Boolean(item.expanded) : undefined}
      aria-disabled={item.disabled}
      style={mergedStyle}
      className={cn(
        "group flex items-center z-10 ps-(--tree-padding) outline-hidden select-none not-last:pb-0.5 focus:z-20",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}

interface TreeTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  item: TreeItemInstance;
  asChild?: boolean;
}

function TreeTrigger({ item, className, children, asChild, onClick, ...props }: TreeTriggerProps) {
  const { tree } = useTreeContext();
  const Comp = asChild ? SlotPrimitive.Slot : "button";
  if (item.isLeaf) return <span className={cn("size-4 shrink-0", className)} />;
  return (
    <Comp
      type={asChild ? undefined : "button"}
      data-slot="tree-trigger"
      aria-expanded={Boolean(item.expanded)}
      className={cn(
        "inline-flex size-4 shrink-0 items-center justify-center rounded-sm transition-transform aria-[expanded=false]:-rotate-90",
        className
      )}
      onClick={async (event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation();
        if (!item.expanded) await tree.loadChildren?.(item.key);
        tree.toggleExpanded?.(item.key);
        onClick?.(event);
      }}
      {...props}
    >
      {children ?? <ChevronDown className="size-4" />}
    </Comp>
  );
}

interface TreeCheckboxProps extends Omit<
  ComponentProps<typeof Checkbox>,
  "checked" | "onCheckedChange"
> {
  item: TreeItemInstance;
}

function TreeCheckbox({ item, className, ...props }: TreeCheckboxProps) {
  const { tree } = useTreeContext();
  return (
    <Checkbox
      data-slot="tree-checkbox"
      className={cn("size-4", className)}
      checked={item.indeterminate ? "indeterminate" : Boolean(item.checked)}
      disabled={item.disabled}
      onCheckedChange={(checked) => {
        if (item.disabled) return;
        tree.check?.(item.key, checked === true);
      }}
      {...props}
    />
  );
}

interface TreeLabelProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  item: TreeItemInstance;
  children?: ReactNode | ((item: TreeItemInstance) => ReactNode);
  selectOnClick?: boolean;
}

function TreeLabel({
  item,
  className,
  children,
  selectOnClick = true,
  onClick,
  ...props
}: TreeLabelProps) {
  const { tree } = useTreeContext();
  return (
    <span
      data-slot="tree-label"
      className={cn(
        "flex min-w-0 items-center gap-1 rounded-sm px-2 text-sm transition-colors group-data-[disabled=true]:opacity-50 group-data-[selected=true]:bg-accent group-data-[selected=true]:text-accent-foreground hover:bg-accent",
        item.disabled && "cursor-not-allowed",
        className
      )}
      onClick={(event) => {
        if (selectOnClick) tree.select?.(item.key, !item.selected);
        onClick?.(event);
      }}
      {...props}
    >
      {typeof children === "function" ? children(item) : (children ?? item.node.label)}
    </span>
  );
}

interface TreeDropIndicatorProps extends HTMLAttributes<HTMLDivElement> {
  intent?: DropIntent | null;
  item?: TreeItemInstance;
}

function TreeDropIndicator({ intent, item, style, className, ...props }: TreeDropIndicatorProps) {
  const { indent, tree } = useTreeContext();
  if (!intent?.valid) return null;
  if (item && intent.dropTargetKey !== item.key) return null;
  const target = item;
  const parentDepth =
    intent.nextParentKey === null ? -1 : (tree.depthByKey.get(intent.nextParentKey) ?? 0);
  const lineDepth = intent.position === "inside" && target ? target.depth + 1 : parentDepth + 1;
  const titleOffset = 16;
  const left = lineDepth * indent + titleOffset;

  const lineTop = intent.position === "before" ? 0 : undefined;
  const lineBottom = intent.position === "before" ? undefined : 0;
  const transform = intent.position === "before" ? "translateY(-1px)" : "translateY(1px)";
  return (
    <div
      data-slot="tree-drop-indicator"
      data-position={intent.position}
      className={cn("pointer-events-none absolute right-0 z-20 h-0.5 bg-primary", className)}
      style={{
        ...style,
        left,
        top: lineTop,
        bottom: lineBottom,
        transform,
      }}
      {...props}
    />
  );
}

const Tree = TreeRoot;
const TreeExpandIcon = TreeTrigger;
const DropIndicator = TreeDropIndicator;

export {
  DropIndicator,
  Tree,
  TreeCheckbox,
  TreeDropIndicator,
  TreeExpandIcon,
  TreeItem,
  TreeLabel,
  TreeRoot,
  TreeTrigger,
  TreeViewport,
  TreeVirtualViewport,
};
