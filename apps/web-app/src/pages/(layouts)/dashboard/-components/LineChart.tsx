import { useState } from "react";
import { Card } from "@rap/components-base/card";
import { ToggleGroup, ToggleGroupItem } from "@rap/components-base/toggle-group";
import { useTheme } from "@rap/components-ui/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { Chart } from "./Chart";
import { getLineChartOption } from "../-utils/chart-options";
import { fetchLineChartData } from "@/service/dashboard";

interface LineChartProps {
	height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ height = 400 }) => {
	const { theme } = useTheme();
	const isDark = theme === "dark";
	const [period, setPeriod] = useState("30d");

	const { data, isLoading, error } = useQuery({
		queryKey: ["lineChartData", period],
		queryFn: () => fetchLineChartData(period),
	});

	if (isLoading) {
		return (
			<Card className="p-6 h-full flex items-center justify-center">
				<div>Loading line chart data...</div>
			</Card>
		);
	}

	if (error || !data) {
		return (
			<Card className="p-6 h-full flex items-center justify-center">
				<div className="text-red-500">Failed to load line chart data</div>
			</Card>
		);
	}

	return (
		<Card className="p-6 h-full">
			<div className="flex justify-between items-center mb-6">
				<div>
					<h3 className="text-lg font-semibold">Total Visitors</h3>
					<p className="text-sm text-muted-foreground">Total for the last 3 months</p>
				</div>
				<ToggleGroup type="single" value={period} onValueChange={(value) => setPeriod(value)}>
					<ToggleGroupItem value="90d" className="cursor-pointer">Last 3 months</ToggleGroupItem>
					<ToggleGroupItem value="30d" className="cursor-pointer">Last 30 days</ToggleGroupItem>
					<ToggleGroupItem value="7d" className="cursor-pointer">Last 7 days</ToggleGroupItem>
				</ToggleGroup>
			</div>
			<div className="w-full" style={{ height: `${height}px` }}>
				<Chart
					option={getLineChartOption(data.data, isDark)}
					style={{ height: "100%", width: "100%" }}
					opts={{ height, width: 'auto' }}
				/>
			</div>
		</Card>
	);
};
