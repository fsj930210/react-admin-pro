import { useTheme } from "@rap/components-ui/theme-provider";
import { cn } from "@rap/utils";
import { createFileRoute } from "@tanstack/react-router";
import { BarChart, LineChart, PieChart, RadarChart } from "echarts/charts";
import {
  GridComponent,
  LegendComponent,
  RadarComponent,
  TooltipComponent,
} from "echarts/components";
import * as echarts from "echarts/core";
import type { EChartsOption } from "echarts";
import { CanvasRenderer } from "echarts/renderers";
import {
  Activity,
  ArrowUpRight,
  BadgeCheck,
  CircleDollarSign,
  Clock3,
  Gauge,
  PackageCheck,
  RadioTower,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  UsersRound,
  Zap,
} from "lucide-react";
import { memo, type ReactNode, useEffect, useMemo, useRef } from "react";

echarts.use([
  BarChart,
  GridComponent,
  LegendComponent,
  LineChart,
  PieChart,
  RadarChart,
  RadarComponent,
  TooltipComponent,
  CanvasRenderer,
]);

export const Route = createFileRoute("/(layouts)/dashboard/")({
  component: DashboardPage,
});

const revenueSeries = [42, 48, 45, 58, 64, 72, 78, 82, 90, 96, 101, 112];
const orderSeries = [28, 32, 35, 34, 42, 48, 46, 55, 61, 64, 69, 74];
const monthLabels = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
];

const channelData = [
  { value: 42, name: "自然搜索" },
  { value: 27, name: "内容种草" },
  { value: 18, name: "广告投放" },
  { value: 13, name: "私域转化" },
];

const conversionData = [64, 72, 58, 83, 76, 69, 88];
const categoryData = [186, 142, 118, 96, 84, 66];
const categoryLabels = ["智能硬件", "企业服务", "效率工具", "会员订阅", "开发者", "设计资产"];
const radarIndicators = [
  { name: "获客", max: 100 },
  { name: "转化", max: 100 },
  { name: "留存", max: 100 },
  { name: "履约", max: 100 },
  { name: "毛利", max: 100 },
  { name: "口碑", max: 100 },
];

const topProducts = [
  { name: "AI 协作套件", value: "¥ 486k", growth: "+18.4%", color: "bg-emerald-500" },
  { name: "数据洞察 Pro", value: "¥ 392k", growth: "+12.7%", color: "bg-sky-500" },
  { name: "自动化插件包", value: "¥ 278k", growth: "+9.3%", color: "bg-amber-500" },
  { name: "企业安全审计", value: "¥ 235k", growth: "+7.6%", color: "bg-rose-500" },
];

const liveSignals = [
  { label: "支付成功率", value: "99.18%", icon: BadgeCheck },
  { label: "平均响应", value: "126ms", icon: Zap },
  { label: "待处理工单", value: "18", icon: Clock3 },
];

const palette = {
  blue: "#2563eb",
  cyan: "#06b6d4",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  violet: "#8b5cf6",
  slate: "#64748b",
};

function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const trendOption = useMemo(() => createTrendOption(isDark), [isDark]);
  const channelOption = useMemo(() => createChannelOption(isDark), [isDark]);
  const conversionOption = useMemo(() => createConversionOption(isDark), [isDark]);
  const categoryOption = useMemo(() => createCategoryOption(isDark), [isDark]);
  const qualityOption = useMemo(() => createQualityOption(isDark), [isDark]);

  return (
    <main className="min-h-full bg-[#f5f7fb] text-slate-950 dark:bg-[#080b12] dark:text-slate-50">
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-5 p-4 md:p-6 2xl:p-8">
        <section className="overflow-hidden rounded-[28px] border border-white/70 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#0e1420] dark:shadow-none">
          <div className="grid min-h-[280px] grid-cols-1 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative flex flex-col justify-between gap-8 overflow-hidden bg-[linear-gradient(135deg,#0f172a_0%,#164e63_52%,#365314_100%)] p-6 text-white md:p-8">
              <div className="relative z-10 flex flex-wrap items-center gap-3 text-sm text-white/80">
                <span className="inline-flex h-9 items-center gap-2 rounded-full bg-white/12 px-4 backdrop-blur">
                  <RadioTower className="size-4" />
                  实时运营中心
                </span>
                <span>刷新于 09:48</span>
              </div>
              <div className="relative z-10 max-w-3xl">
                <p className="mb-3 text-sm font-medium text-cyan-100">Revenue Command Center</p>
                <h1 className="text-3xl font-semibold leading-tight md:text-5xl">业务增长驾驶舱</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-white/72">
                  聚合收入、订单、渠道和服务健康度，用更少噪音呈现今天最值得关注的增长信号。
                </p>
              </div>
              <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
                {liveSignals.map((item) => (
                  <SignalPill key={item.label} {...item} />
                ))}
              </div>
              <div className="absolute right-0 top-0 h-full w-1/3 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0))]" />
            </div>
            <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <MetricCard
                icon={<CircleDollarSign className="size-5" />}
                label="本月收入"
                value="¥ 2.86M"
                change="+21.8%"
                tone="emerald"
              />
              <MetricCard
                icon={<ShoppingBag className="size-5" />}
                label="有效订单"
                value="48,392"
                change="+13.2%"
                tone="blue"
              />
              <MetricCard
                icon={<UsersRound className="size-5" />}
                label="活跃客户"
                value="126.8k"
                change="+8.6%"
                tone="amber"
              />
              <MetricCard
                icon={<Gauge className="size-5" />}
                label="履约准时率"
                value="96.4%"
                change="+3.1%"
                tone="rose"
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.45fr)]">
          <ChartPanel
            title="收入与订单趋势"
            subtitle="最近 12 个月核心交易走势"
            action="年度视图"
            className="min-h-[430px]"
          >
            <DashboardChart option={trendOption} className="h-[330px]" />
          </ChartPanel>
          <div className="grid gap-5">
            <InsightPanel />
            <ChartPanel title="渠道贡献" subtitle="成交来源结构" className="min-h-[260px]">
              <DashboardChart option={channelOption} className="h-[210px]" />
            </ChartPanel>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <ChartPanel title="转化漏斗" subtitle="从访问到复购的关键节点">
            <DashboardChart option={conversionOption} className="h-[280px]" />
          </ChartPanel>
          <ChartPanel title="品类收入排行" subtitle="按成交金额排序">
            <DashboardChart option={categoryOption} className="h-[280px]" />
          </ChartPanel>
          <ChartPanel title="运营质量雷达" subtitle="本周综合能力评分">
            <DashboardChart option={qualityOption} className="h-[280px]" />
          </ChartPanel>
        </section>

        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <Panel className="p-5 md:p-6">
            <PanelHeader title="明星产品" subtitle="收入贡献与增长速度" />
            <div className="mt-6 space-y-4">
              {topProducts.map((item, index) => (
                <ProductRow key={item.name} item={item} index={index + 1} />
              ))}
            </div>
          </Panel>
          <Panel className="p-5 md:p-6">
            <PanelHeader title="今日重点动作" subtitle="面向运营团队的优先级队列" />
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
              <ActionItem
                icon={<Sparkles className="size-5" />}
                title="扩量"
                body="自然搜索转化率连续 4 小时高于均线，建议提高内容入口权重。"
              />
              <ActionItem
                icon={<PackageCheck className="size-5" />}
                title="补货"
                body="智能硬件库存可售 5.8 天，需在明日 16:00 前确认追加计划。"
              />
              <ActionItem
                icon={<Activity className="size-5" />}
                title="修复"
                body="企业服务试用激活在移动端下滑 6.2%，优先检查表单链路。"
              />
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

const DashboardChart = memo(function DashboardChart({
  option,
  className,
}: {
  option: EChartsOption;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const optionRef = useRef(option);

  useEffect(() => {
    optionRef.current = option;
    chartRef.current?.setOption(option, true, true);
  }, [option]);

  useEffect(() => {
    let frameId = 0;
    let disposed = false;
    const container = containerRef.current;
    if (!container) return;

    const ensureChart = () => {
      if (disposed) return;

      const width = container.clientWidth;
      const height = container.clientHeight;
      if (width <= 0 || height <= 0) return;

      if (!chartRef.current) {
        chartRef.current = echarts.init(container, undefined, { renderer: "canvas" });
        chartRef.current.setOption(optionRef.current, true, true);
        return;
      }

      chartRef.current.resize();
    };

    const resizeObserver = new ResizeObserver(() => ensureChart());
    resizeObserver.observe(container);
    frameId = window.requestAnimationFrame(ensureChart);

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className={cn("w-full", className)} />;
});

function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <section
      className={cn(
        "rounded-[24px] border border-slate-200/80 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-[#0e1420] dark:shadow-none",
        className
      )}
    >
      {children}
    </section>
  );
}

function ChartPanel({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title: string;
  subtitle: string;
  action?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Panel className={cn("p-5 md:p-6", className)}>
      <PanelHeader title={title} subtitle={subtitle} action={action} />
      <div className="mt-5">{children}</div>
    </Panel>
  );
}

function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-base font-semibold text-slate-950 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
      {action ? (
        <button
          type="button"
          className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
        >
          {action}
          <ArrowUpRight className="size-4" />
        </button>
      ) : null}
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  change,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  change: string;
  tone: "emerald" | "blue" | "amber" | "rose";
}) {
  const toneClass = {
    emerald: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300",
    blue: "bg-sky-50 text-sky-700 dark:bg-sky-500/12 dark:text-sky-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/12 dark:text-amber-300",
    rose: "bg-rose-50 text-rose-700 dark:bg-rose-500/12 dark:text-rose-300",
  }[tone];

  return (
    <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <span className={cn("grid size-11 place-items-center rounded-2xl", toneClass)}>{icon}</span>
        <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-emerald-700 shadow-sm dark:bg-white/8 dark:text-emerald-300">
          <TrendingUp className="size-3.5" />
          {change}
        </span>
      </div>
      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function SignalPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof BadgeCheck;
}) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-sm text-white/70">
        <Icon className="size-4" />
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function InsightPanel() {
  return (
    <Panel className="p-5 md:p-6">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/12 dark:text-emerald-300">
          <Sparkles className="size-5" />
        </span>
        <div>
          <h2 className="text-base font-semibold">增长洞察</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">本周最强驱动因子</p>
        </div>
      </div>
      <p className="mt-6 text-4xl font-semibold text-slate-950 dark:text-white">+18.7%</p>
      <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
        高价值客户复购贡献了 62% 的增量收入，广告投放成本下降 9.4%，整体毛利率保持上行。
      </p>
      <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/8">
        <div className="h-full w-[78%] rounded-full bg-emerald-500" />
      </div>
    </Panel>
  );
}

function ProductRow({ item, index }: { item: (typeof topProducts)[number]; index: number }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 dark:bg-white/[0.04]">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-sm font-semibold text-slate-500 shadow-sm dark:bg-white/8 dark:text-slate-300">
        {index}
      </span>
      <span className={cn("h-10 w-1.5 rounded-full", item.color)} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-slate-900 dark:text-white">{item.name}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">同比增长 {item.growth}</p>
      </div>
      <p className="text-right font-semibold text-slate-950 dark:text-white">{item.value}</p>
    </div>
  );
}

function ActionItem({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-white text-slate-700 shadow-sm dark:bg-white/8 dark:text-slate-200">
          {icon}
        </span>
        <h3 className="font-semibold text-slate-950 dark:text-white">{title}</h3>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">{body}</p>
    </div>
  );
}

function chartText(isDark: boolean) {
  return {
    text: isDark ? "#cbd5e1" : "#475569",
    muted: isDark ? "rgba(148,163,184,0.22)" : "rgba(148,163,184,0.28)",
    panel: isDark ? "#0e1420" : "#ffffff",
  };
}

function createTrendOption(isDark: boolean): EChartsOption {
  const colors = chartText(isDark);

  return {
    color: [palette.cyan, palette.emerald],
    tooltip: {
      trigger: "axis",
      backgroundColor: colors.panel,
      borderColor: colors.muted,
      textStyle: { color: colors.text },
    },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: colors.text },
    },
    grid: { top: 56, left: 48, right: 16, bottom: 36 },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: monthLabels,
      axisTick: { show: false },
      axisLine: { lineStyle: { color: colors.muted } },
      axisLabel: { color: colors.text },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: colors.text, formatter: "{value}k" },
      splitLine: { lineStyle: { color: colors.muted, type: "dashed" } },
    },
    series: [
      {
        name: "收入",
        type: "line",
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 4 },
        areaStyle: { color: "rgba(6,182,212,0.16)" },
        data: revenueSeries,
      },
      {
        name: "订单",
        type: "line",
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 4 },
        areaStyle: { color: "rgba(16,185,129,0.12)" },
        data: orderSeries,
      },
    ],
  };
}

function createChannelOption(isDark: boolean): EChartsOption {
  const colors = chartText(isDark);

  return {
    color: [palette.blue, palette.emerald, palette.amber, palette.rose],
    tooltip: {
      trigger: "item",
      backgroundColor: colors.panel,
      borderColor: colors.muted,
      textStyle: { color: colors.text },
    },
    legend: {
      bottom: 0,
      left: "center",
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: colors.text },
    },
    series: [
      {
        name: "渠道贡献",
        type: "pie",
        radius: ["48%", "72%"],
        center: ["50%", "43%"],
        avoidLabelOverlap: true,
        label: { color: colors.text, formatter: "{d}%" },
        itemStyle: { borderColor: colors.panel, borderWidth: 4, borderRadius: 8 },
        data: channelData,
      },
    ],
  };
}

function createConversionOption(isDark: boolean): EChartsOption {
  const colors = chartText(isDark);

  return {
    color: [palette.blue],
    tooltip: {
      trigger: "axis",
      backgroundColor: colors.panel,
      borderColor: colors.muted,
      textStyle: { color: colors.text },
    },
    grid: { top: 24, left: 46, right: 10, bottom: 40 },
    xAxis: {
      type: "category",
      data: ["访问", "注册", "激活", "试用", "下单", "支付", "复购"],
      axisTick: { show: false },
      axisLine: { lineStyle: { color: colors.muted } },
      axisLabel: { color: colors.text },
    },
    yAxis: {
      type: "value",
      max: 100,
      axisLabel: { color: colors.text, formatter: "{value}%" },
      splitLine: { lineStyle: { color: colors.muted, type: "dashed" } },
    },
    series: [
      {
        name: "转化率",
        type: "bar",
        barWidth: 18,
        itemStyle: { borderRadius: [10, 10, 4, 4], color: palette.blue },
        data: conversionData,
      },
    ],
  };
}

function createCategoryOption(isDark: boolean): EChartsOption {
  const colors = chartText(isDark);

  return {
    color: [palette.amber],
    tooltip: {
      trigger: "axis",
      backgroundColor: colors.panel,
      borderColor: colors.muted,
      textStyle: { color: colors.text },
    },
    grid: { top: 12, left: 86, right: 18, bottom: 32 },
    xAxis: {
      type: "value",
      axisLabel: { color: colors.text },
      splitLine: { lineStyle: { color: colors.muted, type: "dashed" } },
    },
    yAxis: {
      type: "category",
      inverse: true,
      data: categoryLabels,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: colors.text },
    },
    series: [
      {
        name: "收入",
        type: "bar",
        barWidth: 16,
        itemStyle: { borderRadius: [4, 10, 10, 4], color: palette.amber },
        data: categoryData,
      },
    ],
  };
}

function createQualityOption(isDark: boolean): EChartsOption {
  const colors = chartText(isDark);

  return {
    color: [palette.violet, palette.emerald],
    tooltip: {
      backgroundColor: colors.panel,
      borderColor: colors.muted,
      textStyle: { color: colors.text },
    },
    radar: {
      radius: "64%",
      indicator: radarIndicators,
      axisName: { color: colors.text },
      splitLine: { lineStyle: { color: colors.muted } },
      axisLine: { lineStyle: { color: colors.muted } },
      splitArea: {
        areaStyle: {
          color: isDark
            ? ["rgba(255,255,255,0.02)", "rgba(255,255,255,0.05)"]
            : ["rgba(248,250,252,0.88)", "rgba(226,232,240,0.55)"],
        },
      },
    },
    series: [
      {
        name: "运营质量",
        type: "radar",
        symbolSize: 7,
        lineStyle: { width: 3 },
        areaStyle: { opacity: 0.16 },
        data: [
          { value: [88, 79, 84, 91, 76, 86], name: "本周" },
          { value: [78, 72, 81, 86, 70, 79], name: "上周" },
        ],
      },
    ],
  };
}
