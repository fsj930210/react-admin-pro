/* eslint-disable @eslint-react/no-array-index-key */
import { useQuery } from "@tanstack/react-query";
import { fetchStatData } from "@/service/dashboard";
import { StatCard } from "./StatCard";

export const StatCards: React.FC = () => {
	const { data, isLoading, error } = useQuery({
		queryKey: ["statData"],
		queryFn: fetchStatData,
	});

	if (isLoading) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{[1, 2, 3, 4].map((index) => (
					<div key={index} className="h-40 bg-white rounded-lg shadow animate-pulse"></div>
				))}
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{[1, 2, 3, 4].map((index) => (
					<div
						key={index}
						className="h-40 bg-white rounded-lg shadow flex items-center justify-center text-red-500"
					>
						Failed to load data
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
			{data.data.map((card, index) => (
				// biome-ignore lint:suspicious/noArrayIndexKey
				<StatCard key={index} data={card} />
			))}
		</div>
	);
};
