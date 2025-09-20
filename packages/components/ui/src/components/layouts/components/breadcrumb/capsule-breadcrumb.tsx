import {
  Breadcrumb as BreadcrumbBase,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@rap/components-base/breadcrumb";

export function CapsuleBreadcrumb({ list }: { list: { label: string; href: string }[] }) {
  return (
    <BreadcrumbBase className="p-1">
      <BreadcrumbList className="w-[max-content] flex-items-center gap-0 sm:gap-0 text-layout-breadcrumb-border bg-[currentColor] overflow-hidden border border-[currentColor] rounded-full">
        {
          list.map((item, index) => (
            <BreadcrumbItem key={item.href} className="group text-muted-foreground">
              {
                index === list.length - 1 ? (
                  <BreadcrumbPage className="inline-flex items-center gap-0.5 px-4 pl-8 text-sm leading-[2] bg-layout-breadcrumb hover:bg-layout-breadcrumb-accent transition-all duration-300 capsule-breadcrumb">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="inline-flex items-center gap-0.5 px-4 mr-[-0.52lh] text-sm leading-[2] bg-layout-breadcrumb hover:bg-layout-breadcrumb-accent transition-all duration-300 rounded-r-full group-first:rounded-full group-not-first:pl-8 group-not-first:capsule-breadcrumb"
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