import { Slot as SlotPrimitive } from "radix-ui";
import { cn } from "@rap/utils";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronDownIcon } from "lucide-react";
import { type ReactNode, useRef } from "react";
import { Checkbox } from "../checkbox";
import { TreeContext, useTreeContext } from "./tree-context";
import type {
	TreeFeature,
	TreeInstance,
	TreeItemInstance,
	TreeNode,
} from "./types";
import { useTree } from "./useTree";
import { dndFeature } from "./features";
import React from "react";
interface TreeProps
	extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
	indent?: number;
	rowHeight?: number;
	treeData: TreeNode[];
	features?: TreeFeature[];
	height?: number;
	overscan?: number;
	isLeafCondition?: (node: TreeNode) => boolean;
	children: (props: {
		item: TreeItemInstance;
		rowHeight: number;
		indent: number;
		tree: TreeInstance;
		draggable?: boolean;
		onDragStart?: (event: React.DragEvent<HTMLElement>) => void;
		onDragEnd?: (event: React.DragEvent<HTMLElement>) => void;
		onDragOver?: (event: React.DragEvent<HTMLElement>) => void;
		onDrop?: (event: React.DragEvent<HTMLElement>) => void;
	}) => ReactNode;
}
function Tree({
	indent = 24,
	treeData,
	features,
	className,
	rowHeight = 24,
	children,
	isLeafCondition,
	...props
}: TreeProps) {
	const mergedProps = { ...props };
	const tree = useTree(treeData, {
		features: [...(features || [])],
		indent,
		isLeafCondition,
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
function VirtualizedTree({
	indent = 24,
	treeData,
	features,
	className,
	rowHeight = 24,
	height,
	overscan = 5,
	isLeafCondition,
	children,
	...props
}: TreeProps) {
	const mergedProps = { ...props };
	const tree = useTree(treeData, {
		features: [...(features || [])],
		indent,
		isLeafCondition,
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
interface DraggableTreeProps extends Omit<TreeProps, 'onDragStart' | 'onDragEnd' | 'onDrop' | 'onDragOver'> {
	onDragStart?: (event: React.DragEvent<HTMLElement>, item: TreeItemInstance) => void;
	onDragEnd?: (event: React.DragEvent<HTMLElement>, item: TreeItemInstance) => void;
	onDrop?: (event: React.DragEvent<HTMLElement>, item: TreeItemInstance, dropInfo: any) => void;
	onDragOver?: (event: React.DragEvent<HTMLElement>, item: TreeItemInstance, dropInfo: any) => void;
	onTreeChange?: (treeData: TreeNode[]) => void;
}

function DraggableTree({
	indent = 24,
	treeData,
	features,
	className,
	rowHeight = 24,
	height,
	overscan = 5,
	isLeafCondition,
	children,
	onDragStart,
	onDragEnd,
	onDrop,
	onDragOver,
	onTreeChange,
	...props
}: DraggableTreeProps) {
	const mergedProps = { ...props };
	const dndFeatureInstance = React.useMemo(() => dndFeature({ onDragStart, onDragEnd, onDrop, onDragOver, onTreeChange }), [onDragStart, onDragEnd, onDrop, onDragOver, onTreeChange]);
	// Create a stable features array by converting to a string and back
	// This prevents new tree instances from being created due to inline array props
	const stableFeatures = React.useMemo(() => {
		if (!features) return [];
		// Use JSON.stringify to create a stable key for the features array
		return features.map((feature) => {
			// Create a stable identifier for each feature
			return {
				...feature,
				name: feature.name,
			};
		});
	}, [features]);
	const mergedFeatures = React.useMemo(() => [...stableFeatures, dndFeatureInstance], [stableFeatures, dndFeatureInstance]);
	const tree = useTree(treeData, {
		features: mergedFeatures,
		indent,
		isLeafCondition,
	});
	const parentRef = useRef<HTMLDivElement>(null);
	const { style: propStyle, ...otherProps } = mergedProps;

	// Local state to track drop information for the DropIndicator
	const [dropInfo, setDropInfo] = React.useState<any>(null);
	const [draggingKey, setDraggingKey] = React.useState<string | null>(null);

	const handleDragStart = (e: React.DragEvent<HTMLElement>, item: TreeItemInstance) => {
		console.log('DraggableTree handleDragStart:', item.key);
		setDraggingKey(item.key);
		item.dragStart?.(e, item);
	};

	const handleDragOver = (e: React.DragEvent<HTMLElement>, item: TreeItemInstance) => {
		console.log('DraggableTree handleDragOver:', item.key);
		e.preventDefault();
		const info = item.dragOver?.(e, parentRef.current, e.currentTarget);
		setDropInfo(info);
	};

	const handleDrop = (e: React.DragEvent<HTMLElement>, item: TreeItemInstance) => {
		console.log('DraggableTree handleDrop:', item.key);
		e.preventDefault();
		item.drop?.(e, item);
		setDropInfo(null);
		setDraggingKey(null);
	};

	const handleDragEnd = (e: React.DragEvent<HTMLElement>, item: TreeItemInstance) => {
		console.log('DraggableTree handleDragEnd:', item.key);
		item.dragEnd?.(e, item);
		setDropInfo(null);
		setDraggingKey(null);
	};

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
						return (
							<div
								key={item.key}
								style={{ position: 'relative', height: `${rowHeight}px` }}
							>
								{children?.({
									item,
									rowHeight,
									indent,
									tree,
									draggable: true,
									onDragStart: (e: React.DragEvent<HTMLElement>) => handleDragStart(e, item),
									onDragOver: (e: React.DragEvent<HTMLElement>) => handleDragOver(e, item),
									onDrop: (e: React.DragEvent<HTMLElement>) => handleDrop(e, item),
									onDragEnd: (e: React.DragEvent<HTMLElement>) => handleDragEnd(e, item),
								})
								}
								{draggingKey && dropInfo?.dropTargetKey === item.key && (
									<DropIndicator
										dropPosition={dropInfo.dropPosition}
										dropLevelOffset={dropInfo.dropLevelOffset}
										indent={indent}
										depth={item.depth}
									/>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</TreeContext>
	);
}
interface TreeItemProps extends React.HTMLAttributes<HTMLDivElement> {
	item: TreeItemInstance;
	indent?: number;
	asChild?: boolean;
}

function TreeItem({ item, className, asChild, children, ...props }: Omit<TreeItemProps, "indent">) {
	const { indent, rowHeight } = useTreeContext();

	const mergedProps = { ...props };

	const { style: propStyle, ...otherProps } = mergedProps;

	const mergedStyle = {
		...propStyle,
		height: rowHeight,
		"--tree-padding": `${item.depth * indent}px`,
	} as React.CSSProperties;

	const Comp = asChild ? SlotPrimitive.Slot : "div";
	return (
		<Comp
			data-slot="tree-item"
			data-key={item.key}
			style={mergedStyle}
			className={cn(
				"group flex items-center z-10 ps-(--tree-padding) outline-hidden select-none not-last:pb-0.5 focus:z-20",
				className
			)}
			data-disabled={item.disabled || false}
			data-leaf={item.isLeaf || false}
			data-selected={item.selected || false}
			data-expanded={item.expanded || false}
			aria-expanded={item.expanded || false}
			aria-disabled={item.disabled || false}
			{...otherProps}
		>
			{children}
		</Comp>
	);
}
interface TreeLabelProps
	extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
	children?: (item: TreeItemInstance) => ReactNode;
	item: TreeItemInstance;
	className?: string;
}
function TreeLabel({ children, item, className, ...props }: TreeLabelProps) {
	return (
		<span
			{...props}
			data-slot="tree-item-label"
			className={cn(
				"flex items-center gap-1 rounded-sm px-2 text-sm group-data-[selected=true]:bg-accent transition-colors group-data-[disabled=true]:opacity-50 data-[leaf=true]:ps-7 hover:bg-accent in-focus-visible:ring-[3px] in-focus-visible:ring-ring/50 in-data-[drag-target=true]:bg-accent in-data-[search-match=true]:bg-blue-400/20! in-data-[selected=true]:bg-accent in-data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
				item.disabled && "cursor-not-allowed",
				className
			)}
			onClick={(e) => {
				if (item.selected) {
					item.unselect?.();
				} else {
					item.select?.();
				}
				props.onClick?.(e);
			}}

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
function TreeExpandIcon({ children, item, className, ...props }: TreeExpandIconProps) {
	return (
		!item.isLeaf && (
			<span
				{...props}
				className={cn(
					"size-4 in-aria-[expanded=false]:-rotate-90 transition-transform duration-200",
					className
				)}
				onClick={(e) => {
					if (item.expanded) {
						item.collapse?.(item.key);
					} else {
						item.expand?.(item.key);
					}
					props.onClick?.(e);
				}}
			>
				{children || <ChevronDownIcon className="size-4" />}
			</span>
		)
	);
}
interface TreeCheckProps extends React.HTMLAttributes<HTMLDivElement> {
	item: TreeItemInstance;
}
function TreeCheckbox({ item, className }: TreeCheckProps) {
	return (
		<Checkbox
			className={cn("size-4", className)}
			checked={item.indeterminate ? "indeterminate" : item.checked}
			disabled={item.disabled}
			onCheckedChange={(checked) => {
				if (item.disabled) return;
				if (item.indeterminate || checked) {
					item.check?.();
				} else {
					item.uncheck?.();
				}
			}}
		/>
	);
}
interface DropIndicatorProps {
	dropPosition: -1 | 0 | 1;
	dropLevelOffset: number;
	indent: number;
	depth: number;
}
function DropIndicator(props: DropIndicatorProps) {

	const { dropPosition, indent, depth } = props;
	const style: React.CSSProperties = {
		pointerEvents: 'none',
		position: 'absolute',
		right: 0,
		backgroundColor: 'var(--primary)',
		height: 2,
		zIndex: 20,
	};
	switch (dropPosition) {
		case -1:
			style.top = 0;
			style.left = depth * indent;
			break;
		case 1:
			style.bottom = 0;
			style.left = depth * indent;
			break;
		case 0:
			style.bottom = 0;
			style.left = (depth + 1) * indent;
			break;
	}
	return <div style={style} />;
}

export {
	Tree,
	VirtualizedTree,
	DraggableTree,
	TreeItem,
	TreeLabel,
	TreeExpandIcon,
	TreeCheckbox,
	DropIndicator,
};
