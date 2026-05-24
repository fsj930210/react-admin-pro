import { HttpResponse, http } from "msw";

const SUCCESS_CODE = "0000000000";

interface User {
	user_id: string;
	name: string;
	email: string;
	age: number;
	department: string;
	position: string;
	phone: string;
	address: string;
	joinDate: string;
	salary: number;
	status: string;
	score: number;
}

const firstNames = [
	"张",
	"李",
	"王",
	"赵",
	"刘",
	"陈",
	"杨",
	"黄",
	"周",
	"吴",
	"徐",
	"孙",
	"马",
	"朱",
	"胡",
];
const lastNames = [
	"伟",
	"强",
	"磊",
	"军",
	"勇",
	"涛",
	"鹏",
	"杰",
	"超",
	"明",
	"辉",
	"亮",
	"宇",
	"浩",
	"轩",
	"泽",
	"文",
	"博",
	"睿",
	"鑫",
];

const departments = [
	"研发部",
	"产品部",
	"设计部",
	"市场部",
	"运营部",
	"财务部",
	"人事部",
	"客服部",
];
const positions = ["经理", "主管", "工程师", "设计师", "专员", "助理", "分析师", "顾问"];
const statuses = ["在职", "休假", "离职", "试用期"];

const generateMockUsers = (): User[] => {
	const users: User[] = [];
	for (let i = 0; i < 100; i++) {
		const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
		const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
		const year = 2020 + Math.floor(Math.random() * 5);
		const month = String(1 + Math.floor(Math.random() * 12)).padStart(2, "0");
		const day = String(1 + Math.floor(Math.random() * 28)).padStart(2, "0");
		users.push({
			user_id: String(10000 + i),
			name: firstName + lastName,
			email: `user${i + 1}@example.com`,
			age: 18 + Math.floor(Math.random() * 50),
			department: departments[Math.floor(Math.random() * departments.length)],
			position: positions[Math.floor(Math.random() * positions.length)],
			phone: `1${3 + Math.floor(Math.random() * 9)}${String(Math.floor(Math.random() * 1000000000)).padStart(9, "0")}`,
			address: `${["北京市", "上海市", "广州市", "深圳市", "杭州市"][Math.floor(Math.random() * 5)]}${["朝阳区", "浦东新区", "天河区", "南山区", "西湖区"][Math.floor(Math.random() * 5)]}${Math.floor(Math.random() * 1000)}号`,
			joinDate: `${year}-${month}-${day}`,
			salary: 5000 + Math.floor(Math.random() * 25000),
			status: statuses[Math.floor(Math.random() * statuses.length)],
			score: Math.floor(Math.random() * 31) + 70,
		});
	}
	return users;
};

const mockUsers = generateMockUsers();

export default [
	http.post("/api/rap/table/users", async ({ request }) => {
		const token = request.headers.get("authorization") ?? "";
		if (!token) {
			return HttpResponse.json(
				{ message: "Not Authorized", code: "401", data: null },
				{ status: 401, statusText: "unauthorized" },
			);
		}

		const body = await request.json();
		const params = body as {
			page?: number;
			pageSize?: number;
			sortBy?: string;
			sortOrder?: string;
			sortFields?: { field: string; order: string }[];
			filterField?: string;
			filterValue?: string;
		};

		const page = params.page ?? 1;
		const pageSize = params.pageSize ?? 10;
		const filterField = params.filterField ?? "";
		const filterValue = params.filterValue ?? "";

		let data = [...mockUsers];

		if (filterField && filterValue) {
			data = data.filter((item) => {
				const fieldValue = String(item[filterField as keyof User]).toLowerCase();
				return fieldValue.includes(filterValue.toLowerCase());
			});
		}

		// 支持多列排序
		if (params.sortFields && params.sortFields.length > 0) {
			data.sort((a, b) => {
				for (const sortField of params.sortFields!) {
					const { field, order } = sortField;
					const aVal = a[field as keyof User];
					const bVal = b[field as keyof User];
					let compare = 0;
					if (typeof aVal === "string" && typeof bVal === "string") {
						compare = aVal.localeCompare(bVal, "zh-CN");
					} else if (typeof aVal === "number" && typeof bVal === "number") {
						compare = aVal - bVal;
					}
					if (compare !== 0) {
						return order === "asc" ? compare : -compare;
					}
				}
				return 0;
			});
		} else if (params.sortBy && params.sortOrder) {
			// 兼容旧的单列排序
			data.sort((a, b) => {
				const aVal = a[params.sortBy! as keyof User];
				const bVal = b[params.sortBy! as keyof User];
				if (typeof aVal === "string" && typeof bVal === "string") {
					return params.sortOrder === "asc"
						? aVal.localeCompare(bVal, "zh-CN")
						: bVal.localeCompare(aVal, "zh-CN");
				}
				if (typeof aVal === "number" && typeof bVal === "number") {
					return params.sortOrder === "asc" ? aVal - bVal : bVal - aVal;
				}
				return 0;
			});
		}

		const total = data.length;
		const startIndex = (page - 1) * pageSize;
		const endIndex = startIndex + pageSize;
		const paginatedData = data.slice(startIndex, endIndex);

		return HttpResponse.json({
			code: SUCCESS_CODE,
			message: "success",
			data: {
				data: paginatedData,
				pagination: {
					total,
					page,
					pageSize,
				},
			},
		});
	}),
];
