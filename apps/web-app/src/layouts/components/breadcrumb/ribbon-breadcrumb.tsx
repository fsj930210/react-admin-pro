import {
  Breadcrumb as BreadcrumbBase,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@rap/components-base/breadcrumb";
import { cn } from "@rap/utils";

export function RibbonBreadcrumb({ list }: { list: { label: string; href: string }[] }) {
  return (
    <BreadcrumbBase className="p-1">
      <BreadcrumbList className="w-[max-content] flex-items-center border border-layout-breadcrumb-border rounded-sm overflow-hidden">
        {
          list.map((item, index) => (
            <BreadcrumbItem key={item.href}>
              {
                index === list.length - 1 ? (
                  <BreadcrumbPage className="inline-flex items-center gap-0.5 px-4 py-0.5 text-sm leading-[1.75] bg-layout-breadcrumb hover:bg-layout-breadcrumb-accent transition-all duration-300 ribbon-breadcrumb-last">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className={cn('inline-flex items-center gap-0.5 px-4 py-0.5 mr-[calc(-1*10px+-8px)] text-sm leading-[1.75] bg-layout-breadcrumb hover:bg-layout-breadcrumb-accent transition-all duration-300 ribbon-breadcrumb', {
                      'ribbon-breadcrumb-first': index === 0,
                    })}
                    href={item.href}
                  >
                    {item.label}
                  </BreadcrumbLink>
                )
              }
            </BreadcrumbItem>
          ))
        }
      </BreadcrumbList>
    </BreadcrumbBase>
  )
}