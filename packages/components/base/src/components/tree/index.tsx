import { Slot } from "@radix-ui/react-slot";
import { cn } from "@rap/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDownIcon } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { Checkbox } from "../checkbox";
import { TreeContext, useTreeContext } from "./tree-context";
import type {
  DropInfo,
  TreeFeature,
  TreeInstance,
  TreeItemInstance,
  TreeNode,
} from "./types";
import { useTree } from "./useTree";

interface TreeLabelProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  children?: (item: TreeItemInstance) => ReactNode;
  item: TreeItemInstance;
  className?: string;
}
function TreeLabel({ children, item, className, ...props }: TreeLabelProps) {
  return (
    <span
      data-slot="tree-item-label"
      className={cn(
        "flex items-center gap-1 rounded-sm  px-2  text-sm transition-colors data-[leaf=true]:ps-7 hover:bg-accent in-focus-visible:ring-[3px] in-focus-visible:ring-ring/50 in-data-[drag-target=true]:bg-accent in-data-[search-match=true]:bg-blue-400/20! in-data-[selected=true]:bg-accent in-data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      {...props}
    >
      {children?.(item) || item.node.label || null}
    </span>
  );
}
interface TreeExpandIconProps extends React.HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode;
  item: TreeItemInstance;
  className?: string;
}
function TreeExpandIcon({ children, item, className }: TreeExpandIconProps) {
  return (
    !item.isLeaf && (
      <span
        className={cn(
          "size-4 text-muted-foreground in-aria-[expanded=false]:-rotate-90 transition-transform duration-200",
          className
        )}
        onClick={() => {
          if (item.expanded) {
            item.collapse?.(item.key);
          } else {
            item.expand?.(item.key);
          }
        }}
      >
        {children || <ChevronDownIcon className="size-4" />}
      </span>
    )
  );
}
interface TreeCheckProps extends React.HTMLAttributes<HTMLDivElement> {
  item: TreeItemInstance;
  className?: string;
}
function TreeCheckbox({ item, className }: TreeCheckProps) {
  return (
    <Checkbox
      className={cn("size-4", className)}
      checked={item.indeterminate ? "indeterminate" : item.checked}
      onCheckedChange={(checked) => {
        if (item.indeterminate || checked) {
          item.check?.();
        } else {
          item.uncheck?.();
        }
      }}
    />
  );
}
interface TreeItemProps extends React.HTMLAttributes<HTMLDivElement> {
  item: TreeItemInstance;
  indent?: number;
  asChild?: boolean;
}

function TreeItem({
  item,
  className,
  asChild,
  children,
  ...props
}: Omit<TreeItemProps, "indent">) {
  const { indent, rowHeight } = useTreeContext();

  const mergedProps = { ...props };

  const { style: propStyle, ...otherProps } = mergedProps;

  const mergedStyle = {
    ...propStyle,
    height: rowHeight,
    "--tree-padding": `${item.depth * indent}px`,
  } as React.CSSProperties;

  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-slot="tree-item"
      data-key={item.key}
      style={mergedStyle}
      className={cn(
        "flex items-center z-10 ps-(--tree-padding) outline-hidden select-none not-last:pb-0.5 focus:z-20 data-disabled:pointer-events-none data-disabled:opacity-50",
        className
      )}
      data-leaf={item.isLeaf || false}
      data-selected={item.selected || false}
      aria-expanded={item.expanded}
      {...otherProps}
    >
      {children}
    </Comp>
  );
}

interface TreeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  indent?: number;
  rowHeight?: number;
  treeData: TreeNode[];
  features?: TreeFeature[];
  height: number;
  overscan?: number;
  children: (props: {
    item: TreeItemInstance;
    rowHeight: number;
    indent: number;
    tree: TreeInstance;
  }) => ReactNode;
}

function VirtualizedTree({
  indent = 24,
  treeData,
  features,
  className,
  rowHeight = 24,
  height,
  overscan = 5,
  children,
  ...props
}: TreeProps) {
  const mergedProps = { ...props };
  const tree = useTree(treeData, {
    features: [...(features || [])],
  });
  const parentRef = useRef<HTMLDivElement>(null);
  const visibleNodes = tree.getVisibleItems() || [];
  const rowVirtualizer = useVirtualizer({
    count: visibleNodes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });
  const { style: propStyle, ...otherProps } = mergedProps;

  const mergedStyle = {
    ...propStyle,
    height: height,
    overflow: "auto",
    "--tree-indent": `${indent}px`,
  } as React.CSSProperties;

  return (
    <TreeContext value={{ indent, tree, rowHeight }}>
      <div
        ref={parentRef}
        data-slot="tree"
        style={mergedStyle}
        className={cn("overflow-auto", className)}
        {...otherProps}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: `${rowVirtualizer.getTotalSize()}px`,
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualItem) => {
            const item = visibleNodes[virtualItem.index];
            return (
              <div
                key={item.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${rowHeight}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {children?.({ item, rowHeight, indent, tree })}
              </div>
            );
          })}
        </div>
      </div>
    </TreeContext>
  );
}
function Tree({
  indent = 24,
  treeData,
  features,
  className,
  rowHeight = 24,
  children,
  ...props
}: TreeProps) {
  const mergedProps = { ...props };
  const tree = useTree(treeData, {
    features: [...(features || [])],
  });
  const parentRef = useRef<HTMLDivElement>(null);
  const { style: propStyle, ...otherProps } = mergedProps;

  const mergedStyle = {
    ...propStyle,
    "--tree-indent": `${indent}px`,
  } as React.CSSProperties;

  return (
    <TreeContext value={{ indent, tree, rowHeight }}>
      <div
        ref={parentRef}
        data-slot="tree"
        style={mergedStyle}
        className={cn("flex flex-col overflow-auto", className)}
        {...otherProps}
      >
        <div>
          {tree.getVisibleItems().map((item) => {
            return children?.({ item, rowHeight, indent, tree });
          })}
        </div>
      </div>
    </TreeContext>
  );
}
function DropIndicator({ info }: { info?: DropInfo }) {
  const { indent } = useTreeContext();
  if (!info) return null;
  const { rect, dropPosition, dropLevelOffset } = info;
  const left = rect.left + (dropLevelOffset || 0) * indent;
  const width = Math.max(16, rect.width - (dropLevelOffset || 0) * indent);

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left,
    width,
    pointerEvents: "none",
    zIndex: 9999,
    transition: "all 80ms linear",
  };

  if (dropPosition === 0) {
    return (
      <div
        style={{
          ...baseStyle,
          top: rect.top,
          height: rect.height,
          border: "2px dashed #1890ff",
          background: "rgba(24,144,255,0.06)",
          boxSizing: "border-box",
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...baseStyle,
        top: rect.top - 1,
        height: 2,
        background: "#1890ff",
        transform: "translateY(-50%)",
      }}
    />
  );
}

export {
  Tree,
  VirtualizedTree,
  TreeItem,
  TreeLabel,
  TreeExpandIcon,
  TreeCheckbox,
  DropIndicator,
};
