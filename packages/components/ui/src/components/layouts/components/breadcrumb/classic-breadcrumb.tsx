import {
  Breadcrumb as BreadcrumbBase,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@rap/components-base/breadcrumb";

export function ClassicBreadcrumb({ list }: { list: { label: string; href: string }[] }) {
  return (
    <BreadcrumbBase className="p-1">
      <BreadcrumbList>
        {
          list.map((item, index) => (
            <BreadcrumbItem key={item.href}>
              {
                index === list.length - 1 ? (
                  <BreadcrumbPage className="leading-[2.15]">
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <>
                    <BreadcrumbLink className="leading-[2.15]" href={item.href}>
                      {item.label}
                    </BreadcrumbLink>
                    <BreadcrumbSeparator />
                  </>
                )
              }
            </BreadcrumbItem>
          ))
        }
      </BreadcrumbList>
    </BreadcrumbBase>
  )
}