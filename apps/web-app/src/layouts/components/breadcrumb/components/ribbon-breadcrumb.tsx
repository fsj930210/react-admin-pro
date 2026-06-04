import { Icon } from "@rap/components-pro/icon";
import {
  Breadcrumb as BreadcrumbBase,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@rap/components-ui/breadcrumb";
import { cn } from "@rap/utils";
import type { BreadcrumbItemProps } from "../types";

export function RibbonBreadcrumb({ data, onBreadcrumbItemClick }: BreadcrumbItemProps) {
  return (
    <BreadcrumbBase className="p-1">
      <BreadcrumbList className="w-max flex items-center border border-app-breadcrumb-border rounded-sm overflow-hidden">
        {data.map((item, index) => (
          <BreadcrumbItem key={item.id}>
            {index === data.length - 1 ? (
              <BreadcrumbPage
                className={cn(
                  "inline-flex items-center gap-0.5 px-4 py-0.5 text-sm leading-[1.75] bg-app-breadcrumb hover:bg-app-breadcrumb-accent transition-all duration-300",
                  {
                    "ribbon-breadcrumb-last": data.length > 1,
                  }
                )}
              >
                {item.icon && <Icon icon={item.icon} />}
                {item.title}
              </BreadcrumbPage>
            ) : (
              <BreadcrumbLink
                className={cn(
                  "inline-flex items-center gap-0.5 px-4 py-0.5 mr-[calc(-1*10px+-8px)] text-sm leading-[1.75] bg-app-breadcrumb hover:bg-app-breadcrumb-accent transition-all duration-300 ribbon-breadcrumb cursor-pointer",
                  {
                    "ribbon-breadcrumb-first": index === 0,
                  }
                )}
                asChild
              >
                <button type="button" onClick={() => onBreadcrumbItemClick?.(item)}>
                  {item.icon && <Icon icon={item.icon} />}
                  {item.title}
                </button>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </BreadcrumbBase>
  );
}
