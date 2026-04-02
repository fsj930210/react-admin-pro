import request from "@/service/fetch";

export interface StatCardData {
	title: string;
	value: string | number;
	trend: "up" | "down";
	trendValue: string;
	description: string;
	subDescription: string;
}

export interface LineChartData {
	dates: string[];
	pv: number[];
	uv: number[];
}

export interface PieChartData {
	name: string;
	value: number;
}

export interface RadarChartData {
	indicator: { name: string; max: number }[];
	data: { value: number[]; name: string }[];
}

export const fetchStatData = () => {
	return request.get<StatCardData[]>('/api/rap/dashboard/stat');
};

export const fetchLineChartData = (period = '30d') => {
	return request.get<LineChartData>(`/api/rap/dashboard/linechart?period=${period}`);
};

export const fetchPvUvData = () => {
	return request.get<PieChartData[]>('/api/rap/dashboard/pv-uv');
};

export const fetchRadarData = () => {
	return request.get<RadarChartData>('/api/rap/dashboard/radar');
};
