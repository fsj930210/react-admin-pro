import { Badge } from "@rap/components-base/badge";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@rap/components-base/collapsible";
import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarMenuSub,
	SidebarMenuSubButton,
	SidebarMenuSubItem,
	useSidebar
} from "@rap/components-base/sidebar";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@rap/components-base/hover-card";
import { cn } from "@rap/utils";
import { Link, useLocation } from '@tanstack/react-router'
// ExternalLink
import { ChevronRight, type LucideIcon } from "lucide-react";
import { createContext, forwardRef, type ReactNode, useContext, useMemo, useState } from "react";
import DotBadge, { type BadgeProps } from "../../../dot-badge";
export type SidebarMainItemType = "group" | "catalog" | "menu";
// type AnchorTarget = "_blank" | "_parent" | "_self" | "_top" | (string & {}) | undefined;
interface BaseMenuItem {
	label: string;
	value: string;
	isActive?: boolean;
	badge?: string;
	chip?: string;
	icon?: LucideIcon;
	badgeVariants?: BadgeProps["variant"];
	badgeType?: "normal" | "dot";
	badgeText?: string;
	linkProps?: {
		href?: string;
		isExternal?: boolean;
	};
	children?: BaseMenuItem[];
}

export type SidebarMainItem = {
	label: string;
	isGroupLabel?: boolean;
	value: string;
	icon?: LucideIcon;
	children: BaseMenuItem[];
};

interface SidebarCollapsibleContextType {
	expandedKeys: string[];
	onExpandedKeysChange: (keys: string[]) => void;
	collapsed: boolean;
	onCollapsedChange: (collapsed: boolean) => void;
}

const SidebarCollapsibleContext = createContext<SidebarCollapsibleContextType | undefined>(
	undefined,
);

function useSidebarCollapsible() {
	const context = useContext(SidebarCollapsibleContext);
	if (!context) {
		throw new Error("useSidebarCollapsible has to be used within <SidebarCollapsibleContext>");
	}
	return context;
}

function collectActiveItems(items: BaseMenuItem[]): string[] {
	const activeItems: string[] = [];

	function traverse(menuItems: BaseMenuItem[]) {
		menuItems.forEach((item) => {
			if (item.isActive && item.children) {
				activeItems.push(item.value);
			}
			if (item.children) {
				traverse(item.children);
			}
		});
	}

	traverse(items);
	return activeItems;
}

function SidebarCollapsibleProvider({
	children,
	data,
	defaultCollapsed = false,
}: {
	children: ReactNode;
	data: SidebarMainItem[];
	defaultCollapsed?: boolean;
}) {
	const initialExpandedKeys = useMemo(() => {
		const allItems: BaseMenuItem[] = [];
		data.forEach((group) => {
			allItems.push(...group.children);
		});
		return collectActiveItems(allItems);
	}, [data]);

	const [expandedKeys, setExpandedKeys] = useState<string[]>(initialExpandedKeys);
	const [collapsed, setCollapsed] = useState<boolean>(defaultCollapsed);

	const onExpandedKeysChange = useMemo(
		() => (keys: string[]) => {
			setExpandedKeys(keys);
			// console.log("keys", keys);
		},
		[],
	);

	const onCollapsedChange = useMemo(
		() => (value: boolean) => {
			setCollapsed(value);
		},
		[],
	);

	const contextValue = useMemo(
		() => ({
			expandedKeys,
			onExpandedKeysChange,
			collapsed,
			onCollapsedChange,
		}),
		[expandedKeys, onExpandedKeysChange, collapsed, onCollapsedChange],
	);

	return (
		<SidebarCollapsibleContext.Provider value={contextValue}>
			{children}
		</SidebarCollapsibleContext.Provider>
	);
}

export function SidebarMain({ data }: { data: SidebarMainItem[] }) {

	return (
		<SidebarCollapsibleProvider data={data}>
			{data.map((item) => (
				<SidebarGroup key={item.value}>
					{item.isGroupLabel ? (
						<>
							<SidebarGroupLabel>{item.label}</SidebarGroupLabel>
							<SidebarMenu>
								{item.children.map((child) => (
									<SidebarMenuOption key={child.value} item={child} />
								))}
							</SidebarMenu>
						</>
					) : (
						<SidebarMenu>
							<SidebarMenuOption key={item.value} item={item}></SidebarMenuOption>
						</SidebarMenu>
					)}
				</SidebarGroup>
			))}
		</SidebarCollapsibleProvider>
	);
}

function SidebarMenuOption({ item, level = 0 }: { item: BaseMenuItem; level?: number }) {
	const { state } = useSidebar()
	const { expandedKeys, onExpandedKeysChange, collapsed } = useSidebarCollapsible();

	// 判断是否有子菜单
	const hasChildren = item.children && item.children.length > 0;

	const isOpen = useMemo(() => expandedKeys.includes(item.value), [expandedKeys, item.value]);
	
	// 根据层级选择对应的组件
	const ItemComponent = level === 0 ? SidebarMenuItem : SidebarMenuSubItem;
	const ButtonComponent = level === 0 ? SidebarMenuButton : SidebarMenuSubButton;

	const handleClickCollapsibleTrigger = () => {
		// 当侧边栏折叠时，阻止展开操作
		if (collapsed) return;

		if (isOpen) {
			// 从 expandedKeys 中移除当前项
			const keys = expandedKeys.filter((key) => key !== item.value);
			onExpandedKeysChange(keys);
		} else {
			// 添加到 expandedKeys
			const keys = Array.from(new Set([...expandedKeys, item.value]));
			onExpandedKeysChange(keys);
		}
	};
	const href = useLocation({ select: (location) => location.href })
	if(state === "collapsed"){
		return (
			<SidebarMenuCollapsedDropdown item={item} href={href} />
		)
	}
	// 无子菜单时，渲染普通菜单项
	if (!hasChildren) {
		return (
			<ItemComponent>
				{level === 0 ? (
					<SidebarMenuLink href={href} item={item} />
				) : (
					<SidebarMenuSubButton asChild isActive={checkIsActive(href, item)}>
						<Link to={item.value}>
							{item.icon && <item.icon />}
							<span>{item.label}</span>
							{item.badgeType === "dot" && (
								<DotBadge variant={item.badgeVariants || "default"} className="ml-auto" />
							)}
							{item.badgeType === "normal" && (
								<Badge variant="default" className="ml-auto">
									{item.badgeText}
								</Badge>
							)}
						</Link>
					</SidebarMenuSubButton>
				)}
			</ItemComponent>
		);
	}

	return (
		<Collapsible
			key={item.value}
			asChild
			open={!collapsed && isOpen}
			onOpenChange={handleClickCollapsibleTrigger}
			className="group/collapsible"
		>
			<ItemComponent>
				<CollapsibleTrigger asChild>
					<ButtonComponent className="cursor-pointer" >
						{item.icon && <item.icon />}
						<span>{item.label}</span>
						{item.badgeType === "dot" && (
							<DotBadge variant={item.badgeVariants || "default"} className="ml-auto" />
						)}
						{item.badgeType === "normal" && (
							<Badge variant="default" className="ml-auto">
								{item.badgeText}
							</Badge>
						)}
						<SidebarMenuCollapsibleIcn open={isOpen} hasMargin={!item.badgeType} />
					</ButtonComponent>
				</CollapsibleTrigger>
				<CollapsibleContent className="CollapsibleContent">
					<SidebarMenuSub className="pr-0 mr-0">
						{item.children?.map((subItem) => (
							<SidebarMenuOption key={subItem.value} item={subItem} level={level + 1} />
						))}
					</SidebarMenuSub>
				</CollapsibleContent>
			</ItemComponent>
		</Collapsible>
	);
}

function SidebarMenuCollapsibleIcn({
	open,
	hasMargin = true,
}: {
	open: boolean;
	hasMargin?: boolean;
}) {
	return (
		<ChevronRight
			className={cn(
				"shrink-0 transition-transform duration-200",
				"data-[state=open]:rotate-90",
				hasMargin && "ml-auto",
			)}
			data-state={open ? "open" : "closed"}
		></ChevronRight>
	);
}

const SidebarMenuLink = forwardRef<
	HTMLButtonElement,
	{ item: BaseMenuItem; trailing?: ReactNode; href: string } & React.ComponentPropsWithoutRef<"button">
>(({ item, trailing, className, href, ...props }, ref) => {
	const mergCls = useMemo(() => {
		return cn("cursor-pointer flex", className);
	}, [className]);
	return (
		<SidebarMenuButton asChild isActive={checkIsActive(href, item)} className={mergCls} ref={ref} {...props}>
		<Link to={item.value}>
			{item.icon && <item.icon />}
			<span>{item.label}</span>
					{item.badgeType === "dot" && (
						<DotBadge variant={item.badgeVariants || "default"} className="ml-auto" />
					)}
					{item.badgeType === "normal" && (
						<Badge variant="default" className="ml-auto">
							{item.badgeText}
						</Badge>
					)}
			</Link>
		</SidebarMenuButton>
	);
});

function checkIsActive(href: string, item: BaseMenuItem, mainNav = false) {
  return (
    href === item.value || // /endpint?search=param
    href.split('?')[0] === item.value || // endpoint
    !!item?.children?.filter((i) => i.value === href).length || // if child nav is active
    (mainNav &&
      href.split('/')[1] !== '' &&
      href.split('/')[1] === item?.value?.split('/')[1])
  )
}

SidebarMenuLink.displayName = "SidebarMenuLink";

function SidebarMenuCollapsedDropdown({item, href}: {item: BaseMenuItem, href: string}){
	const hasChildren = item.children && item.children.length > 0;
	if(!hasChildren){
		return (
			<SidebarMenuButton tooltip={item.label} asChild isActive={checkIsActive(href, item)}>
				<Link to={item.value}>
					{item.icon && <item.icon />}
				</Link>
			</SidebarMenuButton>
			)
	}
	else {
		return (
			<HoverCard openDelay={200} closeDelay={100}>
		    <HoverCardTrigger>
					<SidebarMenuButton className="cursor-pointer">
						{item.icon && <item.icon />}
					</SidebarMenuButton> 
				</HoverCardTrigger>
				<HoverCardContent side="right" align="start" className="w-54 p-1">
					{
						item.children?.map((child) => (
							<HoverCardMenuItem key={child.value} item={child} href={href} level={0} />
						))
					}
				</HoverCardContent>
			</HoverCard>
		)
	}

}

// 递归组件：在折叠状态的 HoverCard 中渲染菜单项
function HoverCardMenuItem({ item, href, level }: { item: BaseMenuItem; href: string; level: number }) {
	const hasChildren = item.children && item.children.length > 0;

	// 如果没有子菜单，直接渲染为链接
	if (!hasChildren) {
		return (
			<SidebarMenuButton 
				className="cursor-pointer w-full justify-start" 
				asChild 
				isActive={checkIsActive(href, item)}
			>
				<Link to={item.value}>
					{item.icon && <item.icon />}
					<span>{item.label}</span>
					{item.badgeType === "dot" && (
						<DotBadge variant={item.badgeVariants || "default"} className="ml-auto" />
					)}
					{item.badgeType === "normal" && (
						<Badge variant="default" className="ml-auto">
							{item.badgeText}
						</Badge>
					)}
				</Link>
			</SidebarMenuButton>
		);
	}

	// 有子菜单时，使用嵌套的 HoverCard
	return (
		<HoverCard openDelay={200} closeDelay={100}>
			<HoverCardTrigger asChild>
				<SidebarMenuButton className="cursor-pointer w-full justify-start">
					{item.icon && <item.icon />}
					<span>{item.label}</span>
					{item.badgeType === "dot" && (
						<DotBadge variant={item.badgeVariants || "default"} className="ml-auto" />
					)}
					{item.badgeType === "normal" && (
						<Badge variant="default" className="ml-auto">
							{item.badgeText}
						</Badge>
					)}
					<ChevronRight className="ml-auto shrink-0" />
				</SidebarMenuButton>
			</HoverCardTrigger>
			<HoverCardContent side="right" align="start" className="w-54 p-1">
				{item.children?.map((child) => (
					<HoverCardMenuItem key={child.value} item={child} href={href} level={level + 1} />
				))}
			</HoverCardContent>
		</HoverCard>
	);
}