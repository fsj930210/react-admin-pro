import type { MenuItem } from "@/layouts/hooks/useMenuService";

export type BreadcrumbItem = MenuItem;
export type BreadcrumbType = 'parallelogram' | 'capsule' | 'classic' | 'ribbon';
export type BreadcrumbMode = 'flat' | 'menu';

export interface BreadcrumbItemProps {
	data: BreadcrumbItem[];
	mode?: BreadcrumbMode;
	onBreadcrumbItemClick?: (item: BreadcrumbItem) => void;
}
