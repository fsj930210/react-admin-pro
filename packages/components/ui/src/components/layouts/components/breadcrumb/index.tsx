
// import { RibbonBreadcrumb } from "./ribbon-breadcrumb";
import { ParallelogramBreadcrumb } from "./parallelogram-breadcrumb";
// import { CapsuleBreadcrumb } from "./capsule-breadcrumb";
// import { ClassicBreadcrumb } from "./classic-breadcrumb";
const breadcrumbList = [
  {
    label: '首页',
    href: '/',
  },
  {
    label: '概览',
    href: '/overview',
  },
  {
    label: 'Echarts高级图表',
    href: '/echarts',
  },
  {
    label: '设置',
    href: '/settings',
  },
]

export function Breadcrumb() {
  return (
    <ParallelogramBreadcrumb list={breadcrumbList} />
  )
}