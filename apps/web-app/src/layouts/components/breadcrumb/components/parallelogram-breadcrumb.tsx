import {
	Breadcrumb as BreadcrumbBase,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
} from "@rap/components-ui/breadcrumb";
import { Icon } from "@rap/components-pro/icon";
import type { BreadcrumbItemProps } from "../types";

export function ParallelogramBreadcrumb({ data, onBreadcrumbItemClick }: BreadcrumbItemProps) {
	return (
		<BreadcrumbBase className="p-1">
			<BreadcrumbList className="w-max flex items-center gap-0 sm:gap-0 overflow-hidden">
				{data.map((item, index) => (
					<BreadcrumbItem key={item.id}>
						{index === data.length - 1 ? (
							<BreadcrumbPage className="inline-flex items-center gap-0.5 px-4 text-sm leading-[2.15] bg-app-breadcrumb hover:bg-app-breadcrumb-accent transition-all duration-300 parallelogram-breadcrumb">
								{item.icon && <Icon icon={item.icon} />}
								{item.title}
							</BreadcrumbPage>
						) : (
							<BreadcrumbLink
								className="inline-flex items-center gap-0.5 px-4 -mr-1.5 text-sm leading-[2.15] bg-app-breadcrumb hover:bg-app-breadcrumb-accent transition-all duration-300 parallelogram-breadcrumb cursor-pointer"
								asChild
							>
								<span onClick={() => onBreadcrumbItemClick?.(item)}>
									{item.icon && <Icon icon={item.icon} />}
									{item.title}
								</span>
							</BreadcrumbLink>
						)}
					</BreadcrumbItem>
				))}
			</BreadcrumbList>
		</BreadcrumbBase>
	);
}
