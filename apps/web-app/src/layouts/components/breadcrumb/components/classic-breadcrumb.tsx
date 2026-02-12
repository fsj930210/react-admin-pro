import {
	Breadcrumb as BreadcrumbBase,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@rap/components-base/breadcrumb";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@rap/components-base/dropdown-menu";
import { ChevronDown } from "lucide-react";
import type { BreadcrumbItemProps } from "../types";
import Icon from "@rap/components-ui/icon";

export function ClassicBreadcrumb({ data, onBreadcrumbItemClick, mode }: BreadcrumbItemProps) {
	return (
		<BreadcrumbBase className="p-1">
			<BreadcrumbList>
				{data.map((item, index) => (
					<BreadcrumbItem key={item.id}>
						{index === data.length - 1 ? (
							<BreadcrumbPage className="flex items-center gap-1 leading-[2.15]">
								{item.icon && <Icon icon={item.icon} />}
								{item.title}
							</BreadcrumbPage>
						) : (
							<>
								{mode === "menu" && item.type === "dir" ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<BreadcrumbLink
												className="leading-[2.15] cursor-pointer flex items-center gap-1"
												asChild
											>
												<span className="flex items-center gap-1">
													{item.icon && <Icon icon={item.icon} />}
													{item.title}
													<ChevronDown className="h-4 w-4" />
												</span>
											</BreadcrumbLink>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start">
											{item.children
												?.filter((child) => child.id !== data[data.length - 1]?.id)
												.map((child) => (
													<DropdownMenuItem
														key={child.id}
														onClick={() => onBreadcrumbItemClick?.(child)}
														className="flex gap-1 cursor-pointer"
													>
														{child.icon && <Icon icon={child.icon} />}
														{child.title}
													</DropdownMenuItem>
												))}
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<BreadcrumbLink className="leading-[2.15] cursor-pointer" asChild>
										<span className="flex items-center gap-1" onClick={() => onBreadcrumbItemClick?.(item)}>
											{item.icon && <Icon icon={item.icon} />}
											{item.title}
										</span>
									</BreadcrumbLink>
								)}
								<BreadcrumbSeparator />
							</>
						)}
					</BreadcrumbItem>
				))}
			</BreadcrumbList>
		</BreadcrumbBase>
	);
}
