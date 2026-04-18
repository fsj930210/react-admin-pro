import { Card } from "@rap/components-base/card";
import { useTheme } from "@rap/components-ui/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { fetchRadarData } from "@/service/dashboard";
import { getRadarChartOption } from "../-utils/chart-options";
import { Chart } from "./Chart";

interface RadarChartProps {
	title?: string;
	height?: number;
}

export const RadarChart: React.FC<RadarChartProps> = ({
	title = "PV/UV Analysis",
	height = 350,
}) => {
	const { theme } = useTheme();
	const isDark = theme === "dark";

	const { data, isLoading, error } = useQuery({
		queryKey: ["radarChartData"],
		queryFn: fetchRadarData,
	});

	if (isLoading) {
		return (
			<Card className="p-6 h-full flex items-center justify-center">
				<div>Loading radar chart data...</div>
			</Card>
		);
	}

	if (error || !data) {
		return (
			<Card className="p-6 h-full flex items-center justify-center">
				<div className="text-red-500">Failed to load radar chart data</div>
			</Card>
		);
	}

	return (
		<Card className="p-6 h-full">
			<h3 className="text-lg font-semibold mb-4">{title}</h3>
			<div className="w-full" style={{ height: `${height}px` }}>
				<Chart
					option={getRadarChartOption(data.data, isDark)}
					style={{ height: "100%", width: "100%" }}
					opts={{ height, width: "auto" }}
				/>
			</div>
		</Card>
	);
};
