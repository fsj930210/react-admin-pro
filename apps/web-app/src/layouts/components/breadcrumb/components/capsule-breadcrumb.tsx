import {
	Breadcrumb as BreadcrumbBase,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
} from "@rap/components-base/breadcrumb";
import type { BreadcrumbItemProps } from "../types";
import Icon from "@rap/components-ui/icon";

export function CapsuleBreadcrumb({ data, onBreadcrumbItemClick }: BreadcrumbItemProps) {
	return (
		<BreadcrumbBase className="p-1">
			<BreadcrumbList className="w-max flex items-center gap-0 sm:gap-0 text-layout-breadcrumb-border bg-[currentColor] overflow-hidden  rounded-full">
				{data.map((item, index) => (
					<BreadcrumbItem
						key={item.id}
						className="group text-muted-foreground z-(--z-index) not-last:-mr-4"
						//@ts-expect-error
						style={{ "--z-index": data.length - index }}
					>
						{index === data.length - 1 ? (
							<BreadcrumbPage className="inline-flex items-center gap-0.5 px-4 border border-layout-breadcrumb-border rounded-full text-sm leading-loose bg-layout-breadcrumb hover:bg-layout-breadcrumb-accent transition-all duration-300 group-not-first:pl-6">
								{item.icon && <Icon icon={item.icon} />}
								{item.title}
							</BreadcrumbPage>
						) : (
							<BreadcrumbLink
								className="inline-flex items-center gap-0.5 px-4 border border-layout-breadcrumb-border rounded-full text-sm leading-loose bg-layout-breadcrumb hover:bg-layout-breadcrumb-accent transition-all duration-300 group-not-first:pl-6 cursor-pointer"
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
