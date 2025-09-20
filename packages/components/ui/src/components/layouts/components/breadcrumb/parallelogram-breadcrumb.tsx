import {
  Breadcrumb as BreadcrumbBase,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@rap/components-base/breadcrumb";

export function ParallelogramBreadcrumb({ list }: { list: { label: string; href: string }[] }) {
  return (
    <BreadcrumbBase className="p-1">
      <BreadcrumbList className="w-[max-content] flex-items-center gap-0 sm:gap-0 overflow-hidden">
        {
          list.map((item, index) => (
            <BreadcrumbItem key={item.href}>
              {
                index === list.length - 1 ? (
                  <BreadcrumbPage className="inline-flex items-center gap-0.5 px-4 text-sm leading-[2.15] bg-layout-breadcrumb hover:bg-layout-breadcrumb-accent transition-all duration-300 parallelogram-breadcrumb">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="inline-flex items-center gap-0.5 px-4 mr-[-6px] text-sm leading-[2.15] bg-layout-breadcrumb hover:bg-layout-breadcrumb-accent transition-all duration-300 parallelogram-breadcrumb"
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