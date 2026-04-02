import { Card } from "@rap/components-base/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { StatCardData } from "@/service/dashboard";

interface StatCardProps {
	data: StatCardData;
}

export const StatCard: React.FC<StatCardProps> = ({ data }) => {
	return (
		<Card className="p-6">
			<div className="flex justify-between items-start mb-4">
				<h3 className="text-sm font-medium text-muted-foreground">{data.title}</h3>
				<div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${data.trend === "up"
					? "bg-green-100 text-green-700"
					: "bg-red-100 text-red-700"
					}`}>
					{data.trend === "up" ? (
						<TrendingUp className="w-3 h-3" />
					) : (
						<TrendingDown className="w-3 h-3" />
					)}
					{data.trendValue}
				</div>
			</div>
			<div className="text-3xl font-bold mb-4">{data.value}</div>
			<div className="text-sm text-muted-foreground mb-2">{data.description}</div>
			<div className="text-xs text-muted-foreground/70">{data.subDescription}</div>
		</Card>
	);
};
