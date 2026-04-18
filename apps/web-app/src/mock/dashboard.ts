import { HttpResponse, http } from "msw";

const SUCCESS_CODE = "0000000000";

// 统计卡片数据
const statCardsData = [
	{
		title: "Total Revenue",
		value: "$1,250.00",
		trend: "up" as const,
		trendValue: "+12.5%",
		description: "Trending up this month",
		subDescription: "Visitors for the last 6 months",
	},
	{
		title: "New Customers",
		value: "1,234",
		trend: "down" as const,
		trendValue: "-20%",
		description: "Down 20% this period",
		subDescription: "Acquisition needs attention",
	},
	{
		title: "Active Accounts",
		value: "45,678",
		trend: "up" as const,
		trendValue: "+12.5%",
		description: "Strong user retention",
		subDescription: "Engagement exceed targets",
	},
	{
		title: "Growth Rate",
		value: "4.5%",
		trend: "up" as const,
		trendValue: "+4.5%",
		description: "Steady performance increase",
		subDescription: "Meets growth projections",
	},
];

// 折线图数据 - 不同时间范围的数据
const lineChartDataMap = {
	"7d": {
		dates: ["Apr 7", "Apr 13", "Apr 19", "Apr 26", "May 2", "May 8", "May 14"],
		pv: [120, 200, 150, 80, 70, 110, 130],
		uv: [60, 100, 75, 40, 35, 55, 65],
	},
	"30d": {
		dates: [
			"Apr 7",
			"Apr 13",
			"Apr 19",
			"Apr 26",
			"May 2",
			"May 8",
			"May 14",
			"May 21",
			"May 28",
			"Jun 3",
		],
		pv: [120, 200, 150, 80, 70, 110, 130, 180, 160, 140],
		uv: [60, 100, 75, 40, 35, 55, 65, 90, 80, 70],
	},
	"90d": {
		dates: [
			"Apr 7",
			"Apr 13",
			"Apr 19",
			"Apr 26",
			"May 2",
			"May 8",
			"May 14",
			"May 21",
			"May 28",
			"Jun 3",
			"Jun 9",
			"Jun 15",
			"Jun 22",
			"Jun 30",
		],
		pv: [120, 200, 150, 80, 70, 110, 130, 180, 160, 140, 190, 230, 170, 210],
		uv: [60, 100, 75, 40, 35, 55, 65, 90, 80, 70, 95, 115, 85, 105],
	},
};

// PV/UV 饼图数据
const pieChartData = [
	{ name: "PV", value: 1048 },
	{ name: "UV", value: 735 },
	{ name: "Bounce", value: 580 },
	{ name: "New User", value: 484 },
];

// Radar图数据
const radarChartData = {
	indicator: [
		{ name: "Sales", max: 6500 },
		{ name: "Admin", max: 16000 },
		{ name: "Information", max: 30000 },
		{ name: "Technical", max: 38000 },
		{ name: "Support", max: 52000 },
		{ name: "Developer", max: 25000 },
	],
	data: [
		{
			value: [4200, 3000, 20000, 35000, 50000, 18000],
			name: "Allocated",
		},
		{
			value: [5000, 14000, 28000, 26000, 42000, 21000],
			name: "Actual",
		},
	],
};

export default [
	// Stat卡片接口
	http.get("/api/rap/dashboard/stat", ({ request }) => {
		const token = request.headers.get("authorization") ?? "";
		if (!token) {
			return HttpResponse.json(
				{ message: "Not Authorized", code: "401", data: null },
				{ status: 401, statusText: "unauthorized" },
			);
		}

		return HttpResponse.json({ code: SUCCESS_CODE, message: "success", data: statCardsData });
	}),

	// LineChart接口 - 支持不同时间范围
	http.get("/api/rap/dashboard/linechart", ({ request }) => {
		const token = request.headers.get("authorization") ?? "";
		if (!token) {
			return HttpResponse.json(
				{ message: "Not Authorized", code: "401", data: null },
				{ status: 401, statusText: "unauthorized" },
			);
		}

		const url = new URL(request.url);
		const period = url.searchParams.get("period") || "30d";
		const data =
			lineChartDataMap[period as keyof typeof lineChartDataMap] || lineChartDataMap["30d"];

		return HttpResponse.json({ code: SUCCESS_CODE, message: "success", data });
	}),

	// PV/UV 饼图接口
	http.get("/api/rap/dashboard/pv-uv", ({ request }) => {
		const token = request.headers.get("authorization") ?? "";
		if (!token) {
			return HttpResponse.json(
				{ message: "Not Authorized", code: "401", data: null },
				{ status: 401, statusText: "unauthorized" },
			);
		}

		return HttpResponse.json({ code: SUCCESS_CODE, message: "success", data: pieChartData });
	}),

	// Radar图接口
	http.get("/api/rap/dashboard/radar", ({ request }) => {
		const token = request.headers.get("authorization") ?? "";
		if (!token) {
			return HttpResponse.json(
				{ message: "Not Authorized", code: "401", data: null },
				{ status: 401, statusText: "unauthorized" },
			);
		}

		return HttpResponse.json({ code: SUCCESS_CODE, message: "success", data: radarChartData });
	}),
];
