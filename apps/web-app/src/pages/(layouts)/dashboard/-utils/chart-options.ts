import type { EChartsOption } from "echarts";
import type { LineChartData, PieChartData, RadarChartData } from "@/service/dashboard";

const getThemeColors = (isDark: boolean) => {
	return {
		pvColor: isDark ? "rgba(139, 92, 246, 0.5)" : "rgba(84, 112, 198, 0.5)",
		pvColorLight: isDark ? "rgba(139, 92, 246, 0.05)" : "rgba(84, 112, 198, 0.05)",
		uvColor: isDark ? "rgba(59, 130, 246, 0.5)" : "rgba(102, 126, 234, 0.5)",
		uvColorLight: isDark ? "rgba(59, 130, 246, 0.05)" : "rgba(102, 126, 234, 0.05)",
		text: isDark ? "#e2e8f0" : "#334155",
		axisLine: isDark ? "#475569" : "#e2e8f0",
		grid: isDark ? "#1e293b" : "#f8fafc",
	};
};

export const getLineChartOption = (data: LineChartData, isDark = false): EChartsOption => {
	const colors = getThemeColors(isDark);
	return {
		tooltip: {
			trigger: "axis",
		},
		legend: {
			data: ["PV", "UV"],
			top: 0,
			textStyle: {
				color: colors.text,
			},
		},
		grid: {
			left: "3%",
			right: "4%",
			bottom: "3%",
			top: "15%",
			containLabel: true,
			backgroundColor: colors.grid,
		},
		xAxis: {
			type: "category",
			boundaryGap: false,
			data: data.dates,
			axisLine: {
				lineStyle: {
					color: colors.axisLine,
				},
			},
			axisLabel: {
				color: colors.text,
			},
		},
		yAxis: {
			type: "value",
			axisLine: {
				lineStyle: {
					color: colors.axisLine,
				},
			},
			axisLabel: {
				color: colors.text,
			},
			splitLine: {
				lineStyle: {
					color: colors.axisLine,
				},
			},
		},
		series: [
			{
				name: "PV",
				type: "line",
				smooth: true,
				areaStyle: {
					color: {
						type: "linear",
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{ offset: 0, color: colors.pvColor },
							{ offset: 1, color: colors.pvColorLight },
						],
					},
				},
				data: data.pv,
			},
			{
				name: "UV",
				type: "line",
				smooth: true,
				areaStyle: {
					color: {
						type: "linear",
						x: 0,
						y: 0,
						x2: 0,
						y2: 1,
						colorStops: [
							{ offset: 0, color: colors.uvColor },
							{ offset: 1, color: colors.uvColorLight },
						],
					},
				},
				data: data.uv,
			},
		],
	};
};

export const getPieChartOption = (data: PieChartData[], isDark = false): EChartsOption => {
	const colors = getThemeColors(isDark);
	return {
		tooltip: {
			trigger: "item",
		},
		legend: {
			orient: "vertical",
			left: "left",
			textStyle: {
				color: colors.text,
			},
		},
		series: [
			{
				name: "PV/UV",
				type: "pie",
				radius: "50%",
				data: data,
				emphasis: {
					itemStyle: {
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: "rgba(0, 0, 0, 0.5)",
					},
				},
			},
		],
	};
};

export const getRadarChartOption = (data: RadarChartData, isDark = false): EChartsOption => {
	const colors = getThemeColors(isDark);
	return {
		tooltip: {},
		legend: {
			data: data.data.map((d) => d.name),
			textStyle: {
				color: colors.text,
			},
		},
		radar: {
			indicator: data.indicator,
			axisName: {
				color: colors.text,
			},
			axisLine: {
				lineStyle: {
					color: colors.axisLine,
				},
			},
			splitLine: {
				lineStyle: {
					color: colors.axisLine,
				},
			},
			splitArea: {
				areaStyle: {
					color: [colors.grid],
				},
			},
		},
		series: [
			{
				name: "PV/UV Radar",
				type: "radar",
				data: data.data,
			},
		],
	};
};
