import { Slot } from "@radix-ui/react-slot";
import { cn } from "@rap/utils";
import { ChevronDownIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Checkbox } from "../checkbox";
import { TreeContext, useTreeContext } from "./tree-context";
import type {
	TreeFeature,
	TreeInstance,
	TreeItemInstance,
	TreeNode,
} from "./types";
import { useTree } from "./useTree";

interface TreeRootProps {
	nodes: TreeNode[];
	features?: TreeFeature[];
	children: ({
		tree,
		indent,
	}: {
		tree: TreeInstance;
		indent: number;
	}) => ReactNode;
	indent?: number;
}
function TreeRoot({ nodes, features, children, indent = 20 }: TreeRootProps) {
	const tree = useTree(nodes, {
		features: [...(features || [])],
	});
	return (
		<TreeContext value={{ indent, tree }}>
			{children({ tree, indent })}
		</TreeContext>
	);
}

interface TreeLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
	children?: ReactNode;
	item: TreeItemInstance;
	className?: string;
}
function TreeLabel({ children, item, className, ...props }: TreeLabelProps) {
	return (
		<span
			data-slot="tree-item-label"
			className={cn(
				"flex items-center gap-1 rounded-sm bg-background px-2 py-1.5 text-sm transition-colors data-[leaf=true]:ps-7 hover:bg-accent in-focus-visible:ring-[3px] in-focus-visible:ring-ring/50 in-data-[drag-target=true]:bg-accent in-data-[search-match=true]:bg-blue-400/20! in-data-[selected=true]:bg-accent in-data-[selected=true]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			{...props}
		>
			{children || item.node.label || null}
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
					className,
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
interface TreeCheckIconProps extends React.HTMLAttributes<HTMLDivElement> {
	item: TreeItemInstance;
	className?: string;
}
function TreeCheckIcon({ item, className }: TreeCheckIconProps) {
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
	const { indent } = useTreeContext();

	const mergedProps = { ...props };

	const { style: propStyle, ...otherProps } = mergedProps;

	const mergedStyle = {
		...propStyle,
		"--tree-padding": `${item.depth * indent}px`,
	} as React.CSSProperties;

	const Comp = asChild ? Slot : "div";

	return (
		<Comp
			data-slot="tree-item"
			style={mergedStyle}
			className={cn(
				"flex-items-center z-10 ps-(--tree-padding) outline-hidden select-none not-last:pb-0.5 focus:z-20 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
				className,
			)}
			data-leaf={!item.isLeaf || false}
			data-selected={item.selected || false}
			aria-expanded={item.expanded}
			{...otherProps}
		>
			{children}
		</Comp>
	);
}

interface TreeProps extends React.HTMLAttributes<HTMLDivElement> {
	indent?: number;
	tree?: TreeInstance;
}

function Tree({ indent = 20, tree, className, ...props }: TreeProps) {
	const mergedProps = { ...props };

	const { style: propStyle, ...otherProps } = mergedProps;

	const mergedStyle = {
		...propStyle,
		"--tree-indent": `${indent}px`,
	} as React.CSSProperties;

	return (
		<div
			data-slot="tree"
			style={mergedStyle}
			className={cn("flex flex-col", className)}
			{...otherProps}
		/>
	);
}

export { Tree, TreeItem, TreeLabel, TreeRoot, TreeExpandIcon, TreeCheckIcon };
