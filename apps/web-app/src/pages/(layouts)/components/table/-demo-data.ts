export interface DemoUser {
	id: string;
	name: string;
	email: string;
	age: number;
	department: string;
	position: string;
	joinDate: string;
	salary: number;
	status: "active" | "vacation" | "left" | "probation";
	score: number;
	children?: DemoUser[];
}

const departments = ["Engineering", "Product", "Design", "Operations"];
const positions = [
	"Frontend Engineer",
	"Backend Engineer",
	"Product Manager",
	"Designer",
	"Data Analyst",
];
const statuses: DemoUser["status"][] = ["active", "vacation", "left", "probation"];

export function createDemoUsers(count = 80, prefix = "U"): DemoUser[] {
	return Array.from({ length: count }, (_, index) => {
		const id = `${prefix}-${String(index + 1).padStart(4, "0")}`;
		return {
			id,
			name: `User ${index + 1}`,
			email: `user${index + 1}@example.com`,
			age: 22 + (index % 31),
			department: departments[index % departments.length],
			position: positions[index % positions.length],
			joinDate: `202${index % 5}-${String((index % 12) + 1).padStart(2, "0")}-${String((index % 26) + 1).padStart(2, "0")}`,
			salary: 9000 + (index % 24) * 850,
			status: statuses[index % statuses.length],
			score: 60 + (index % 40),
		};
	});
}

export function createTreeUsers() {
	return createDemoUsers(12).map((user, index) => ({
		...user,
		children: createDemoUsers(2, `${user.id}-child`).map((child, childIndex) => ({
			...child,
			name: `${user.name} / Member ${childIndex + 1}`,
			department: user.department,
		})),
		score: 70 + index,
	}));
}

export function delay<T>(value: T, ms = 500) {
	return new Promise<T>((resolve) => {
		setTimeout(() => resolve(value), ms);
	});
}
