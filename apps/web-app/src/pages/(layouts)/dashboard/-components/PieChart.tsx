import { Card } from "@rap/components-ui/card";
import { useTheme } from "@rap/components-ui/theme-provider";
import { useQuery } from "@tanstack/react-query";
import { fetchPvUvData } from "@/service/dashboard";
import { getPieChartOption } from "../-utils/chart-options";
import { Chart } from "./Chart";

interface PieChartProps {
	title?: string;
	height?: number;
}

export const PieChart: React.FC<PieChartProps> = ({
	title = "PV/UV Distribution",
	height = 350,
}) => {
	const { theme } = useTheme();
	const isDark = theme === "dark";

	const { data, isLoading, error } = useQuery({
		queryKey: ["pieChartData"],
		queryFn: fetchPvUvData,
	});

	if (isLoading) {
		return (
			<Card className="p-6 h-full flex items-center justify-center">
				<div>Loading pie chart data...</div>
			</Card>
		);
	}

	if (error || !data) {
		return (
			<Card className="p-6 h-full flex items-center justify-center">
				<div className="text-red-500">Failed to load pie chart data</div>
			</Card>
		);
	}

	return (
		<Card className="p-6 h-full">
			<h3 className="text-lg font-semibold mb-4">{title}</h3>
			<div className="w-full" style={{ height: `${height}px` }}>
				<Chart
					option={getPieChartOption(data.data, isDark)}
					style={{ height: "100%", width: "100%" }}
					opts={{ height, width: "auto" }}
				/>
			</div>
		</Card>
	);
};
