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

export function ClassicBreadcrumb({ data, onBreadcrumbItemClick, mode }: BreadcrumbItemProps) {
	return (
		<BreadcrumbBase className="p-1">
			<BreadcrumbList>
				{data.map((item, index) => (
					<BreadcrumbItem key={item.id}>
						{index === data.length - 1 ? (
							<BreadcrumbPage className="leading-[2.15]">{item.title}</BreadcrumbPage>
						) : (
							<>
								{mode === "menu" && item.type === "dir" ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<BreadcrumbLink
												className="leading-[2.15] cursor-pointer flex items-center gap-1"
												asChild
											>
												<span>
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
														className="cursor-pointer"
													>
														{child.title}
													</DropdownMenuItem>
												))}
										</DropdownMenuContent>
									</DropdownMenu>
								) : (
									<BreadcrumbLink className="leading-[2.15] cursor-pointer" asChild>
										<span onClick={() => onBreadcrumbItemClick?.(item)}>{item.title}</span>
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
