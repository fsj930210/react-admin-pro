import { Button } from "@rap/components-ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@rap/components-ui/dialog";
import { Anchor } from "@rap/components-ui/anchor";
import { Icon } from "@rap/components-pro/icon";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useLayout } from "@/layouts/context/layout-context";
import type { MenuItem } from "@/layouts/types";

export const Route = createFileRoute("/(layouts)/overview/")({
	component: OverviewPage,
});

function MenuCard({
	menu,
	className = "",
	iconSize = 24,
	textSize = "text-sm",
	onClick,
}: {
	menu: MenuItem;
	className?: string;
	iconSize?: number;
	textSize?: string;
	onClick?: () => void;
}) {
	return (
		<div
			className={`size-30 bg-muted p-4 rounded-lg hover:shadow-md transition-shadow flex-col-center cursor-pointer ${className}`}
			onClick={onClick}
		>
			<div className="text-2xl mb-2">
				{menu.icon ? (
					<Icon icon={menu.icon} wrapperClassName="text-2xl" />
				) : (
					<Icon icon="lucide:menu" wrapperClassName="text-2xl" />
				)}
			</div>
			<div className={`text-center ${textSize}`}>{menu.title}</div>
		</div>
	);
}

function MenuCategory({
	category,
	menus,
	onMenuClick,
}: {
	category: string;
	menus: MenuItem[];
	onMenuClick: (menu: MenuItem) => void;
}) {
	return (
		<div key={category} id={category} className="mb-8">
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-semibold">{category}</h2>
			</div>
			<div className="flex flex-wrap gap-2">
				{menus.map((menu) => (
					<MenuCard key={menu.id} menu={menu} onClick={() => onMenuClick(menu)} />
				))}
			</div>
		</div>
	);
}

function AddMenuModal({
	categories,
	groupedMenus,
	onAdd,
	quickMenus,
	maxQuickMenus,
}: {
	categories: string[];
	groupedMenus: Record<string, MenuItem[]>;
	onAdd: (menus: MenuItem[]) => void;
	quickMenus: MenuItem[];
	maxQuickMenus: number;
}) {
	const [selectedMenus, setSelectedMenus] = useState<MenuItem[]>([]);
	const [open, setOpen] = useState(false);

	const handleOpenChange = (isOpen: boolean) => {
		setOpen(isOpen);
		if (isOpen) {
			setSelectedMenus([...quickMenus]);
		}
	};

	const handleToggleMenu = (menu: MenuItem) => {
		const isSelected = selectedMenus.some((m) => m.id === menu.id);
		if (isSelected) {
			setSelectedMenus(selectedMenus.filter((m) => m.id !== menu.id));
		} else {
			if (selectedMenus.length >= maxQuickMenus) {
				// Show alert or toast here
				toast.error(`最多只能添加 ${maxQuickMenus} 个快捷菜单`);
				return;
			}
			setSelectedMenus([...selectedMenus, menu]);
		}
	};

	const handleRemoveSelected = (menuId: string) => {
		setSelectedMenus(selectedMenus.filter((m) => m.id !== menuId));
	};

	const handleConfirm = () => {
		onAdd(selectedMenus);
		setSelectedMenus([]);
		setOpen(false);
	};

	const handleCancel = () => {
		setSelectedMenus([]);
		setOpen(false);
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<div className="size-30 bg-muted p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer flex-col-center">
					<div className="text-2xl mb-2">
						<Icon icon="lucide:plus" />
					</div>
					<div className="text-center text-sm">添加</div>
				</div>
			</DialogTrigger>
			<DialogContent
				className="max-w-250 max-h-[80vh] flex flex-col"
				style={{ maxWidth: "1000px" }}
			>
				<DialogHeader>
					<DialogTitle>添加快捷菜单</DialogTitle>
					<p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
						已添加 {quickMenus.length}/{maxQuickMenus} 个快捷菜单
					</p>
					{selectedMenus.length > 0 && (
						<div className="space-y-2">
							<p className="text-sm font-medium">已选中 ({selectedMenus.length})：</p>
							<div className="flex flex-wrap gap-2">
								{selectedMenus.map((menu) => (
									<div
										className="flex items-center p-2 border border-primary rounded"
										key={menu.id}
									>
										{menu.icon ? (
											<Icon icon={menu.icon} wrapperClassName="mr-2" />
										) : (
											<Icon icon="lucide:menu" wrapperClassName="mr-2" />
										)}
										<span>{menu.title}</span>
										<button
											type="button"
											className="ml-2 rounded-xs opacity-70 transition-opacity hover:opacity-100 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
											onClick={() => handleRemoveSelected(menu.id)}
										>
											<Icon icon="lucide:x" />
										</button>
									</div>
								))}
							</div>
						</div>
					)}
				</DialogHeader>
				<div className="flex-1 overflow-y-auto space-y-4">
					{categories.map((category) => (
						<div key={category}>
							<h3 className="font-medium mb-2">{category}</h3>
							<div className="flex flex-wrap gap-2">
								{groupedMenus[category].map((menu: MenuItem) => {
									const isSelected = selectedMenus.some((m) => m.id === menu.id);
									return (
										<MenuCard
											key={menu.id}
											menu={menu}
											className={`border ${isSelected ? "border-primary" : "hover:bg-gray-100 dark:hover:bg-gray-700"}`}
											iconSize={16}
											textSize="text-xs"
											onClick={() => handleToggleMenu(menu)}
										/>
									);
								})}
							</div>
						</div>
					))}
				</div>
				<DialogFooter>
					<Button variant="ghost" onClick={handleCancel}>
						取消
					</Button>
					<Button onClick={handleConfirm} disabled={selectedMenus.length === 0}>
						确定 ({selectedMenus.length})
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function OverviewPage() {
	const { userMenus } = useLayout();
	const navigate = useNavigate();
	const [quickMenus, setQuickMenus] = useState<MenuItem[]>([]);
	const MAX_QUICK_MENUS = 10;

	const handleMenuClick = (menu: MenuItem) => {
		if (menu.type === "menu" && menu.url) {
			if (menu.openMode === "newBrowserTab") {
				window.open(menu.fullUrl ?? menu.url, "_blank");
			} else if (menu.openMode === "iframe") {
				navigate({ to: menu.url });
			} else {
				navigate({ to: menu.fullUrl ?? menu.url });
			}
		}
	};

	const groupedMenus = userMenus.reduce(
		(acc, menu) => {
			if (menu.children && menu.children.length > 0) {
				const category = menu.title || "其他";
				if (!acc[category]) {
					acc[category] = [];
				}
				acc[category].push(...menu.children);
			} else if (menu.type === "menu") {
				const category = menu.title;
				if (!acc[category]) {
					acc[category] = [];
				}
				acc[category].push(menu);
			}
			return acc;
		},
		{} as Record<string, MenuItem[]>,
	);

	const categories = Object.keys(groupedMenus);

	// Handle adding quick menus
	const handleAddQuickMenu = (menus: MenuItem[]) => {
		setQuickMenus(menus);
	};

	return (
		<div className="p-6">
			<div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-muted p-4 rounded-lg shadow flex-col-center">
					<div className="text-sm">总菜单数</div>
					<div className="text-2xl font-bold">{userMenus.length}</div>
				</div>
				<div className="bg-muted p-4 rounded-lg shadow flex-col-center">
					<div className="text-sm">功能模块</div>
					<div className="text-2xl font-bold">{categories.length}</div>
				</div>
				<div className="bg-muted p-4 rounded-lg shadow flex-col-center">
					<div className="text-sm">快捷菜单</div>
					<div className="text-2xl font-bold">
						{quickMenus.length}/{MAX_QUICK_MENUS}
					</div>
				</div>
				<div className="bg-muted p-4 rounded-lg shadow flex-col-center">
					<div className="text-sm">系统状态</div>
					<div className="text-2xl font-bold text-green-500">正常</div>
				</div>
			</div>

			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-4">快捷菜单</h2>
				<div className="flex flex-wrap gap-2">
					{quickMenus.map((menu) => (
						<div key={menu.id}>
							<MenuCard key={menu.id} menu={menu} onClick={() => handleMenuClick(menu)} />
						</div>
					))}
					{quickMenus.length < MAX_QUICK_MENUS && (
						<AddMenuModal
							categories={categories}
							groupedMenus={groupedMenus}
							onAdd={handleAddQuickMenu}
							quickMenus={quickMenus}
							maxQuickMenus={MAX_QUICK_MENUS}
						/>
					)}
				</div>
			</div>

			<div>
				{categories.map((category) => (
					<MenuCategory
						key={category}
						category={category}
						menus={groupedMenus[category]}
						onMenuClick={handleMenuClick}
					/>
				))}
			</div>

			<Anchor items={categories.map((category) => ({ id: category, label: category }))} />
		</div>
	);
}
