import { ChromeLikeTabItem } from "./components/chrome-like-tabs";
export type LayoutTabItem = {
  label: string;
  value: string;
};

export type LayoutTabItemProps = {
  tab: LayoutTabItem;
};
const data: LayoutTabItem[] = [
  {
    label: "概览",
    value: "overview",
  },
  {
    label: "分析",
    value: "analysis",
  },
  {
    label: "监控",
    value: "monitor",
  },
  {
    label: "设置",
    value: "settings",
  },
  {
    label: "帮助",
    value: "help",
  },
  {
    label: "关于",
    value: "about",
  },
  {
    label: "联系",
    value: "contact",
  },
  {
    label: "隐私",
    value: "privacy",
  },
  {
    label: "条款",
    value: "terms",
  },
  {
    label: "组件",
    value: "components",
  },
  {
    label: "echarts高级图表",
    value: "echarts-advance-charts",
  },
  {
    label: "echarts基础图表",
    value: "echarts-basic-charts",
  },
  {
    label: "echarts自定义图表",
    value: "echarts-custom-charts",
  },
  {
    label: "echarts地图",
    value: "echarts-map",
  },
  {
    label: "按钮权限",
    value: "button-permissions",
  },
  {
    label: "菜单权限",
    value: "menu-permissions",
  },
  {
    label: "路由权限",
    value: "route-permissions",
  },
];

export function LayoutTabs() {
  return (
    <ol className="flex-items-center h-9 overflow-x-auto no-scrollbar bg-layout-tabs">
      {data.map((item) => (
        <ChromeLikeTabItem key={item.value} tab={item} />
      ))}
    </ol>
  );
}
