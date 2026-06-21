import { HttpResponse, http } from "msw";

const SUCCESS_CODE = "0000000000";
const departments = ["研发中心", "产品中心", "设计中心", "市场中心", "客户成功部", "财务部"];
const positions = ["前端工程师", "后端工程师", "产品经理", "交互设计师", "数据分析师", "客户顾问"];
const statuses = ["active", "probation", "vacation"] as const;
const surnames = ["陈", "林", "周", "吴", "郑", "王", "冯", "沈", "韩", "许", "唐", "邓"];
const names = ["知远", "若溪", "景明", "星河", "嘉言", "清和", "思齐", "云舟", "书宁", "亦安"];

export interface ProDataGridEmployee {
  employee_id: string;
  username: string;
  email: string;
  department: string;
  position: string;
  status: (typeof statuses)[number];
  joined_at: string;
  performance: number;
}

const employees: ProDataGridEmployee[] = Array.from({ length: 72 }, (_, index) => {
  const sequence = index + 1;
  const month = String((index % 12) + 1).padStart(2, "0");
  const day = String(((index * 7) % 27) + 1).padStart(2, "0");
  return {
    employee_id: `EMP-${String(sequence).padStart(4, "0")}`,
    username: `${surnames[index % surnames.length]}${names[(index * 3) % names.length]}`,
    email: `employee.${sequence}@rap-example.cn`,
    department: departments[(index * 5) % departments.length],
    position: positions[(index * 7) % positions.length],
    status: statuses[index % statuses.length],
    joined_at: `${2021 + (index % 5)}-${month}-${day}`,
    performance: 60 + ((index * 13) % 41),
  };
});

export default [
  http.post("/api/rap/pro-data-grid/employees", async ({ request }) => {
    const body = (await request.json()) as {
      current?: number;
      page_size?: number;
      keyword?: string;
      employee_id?: string;
      username?: string;
      email?: string;
      department_code?: string;
      position?: string;
      status?: string | string[];
      joined_start?: string;
      joined_end?: string;
      performance_min?: number;
      performance_max?: number;
      order_field?: keyof ProDataGridEmployee;
      order_direction?: "asc" | "desc";
    };
    const current = Math.max(1, body.current ?? 1);
    const pageSize = Math.max(1, body.page_size ?? 10);
    let records = [...employees];
    const keyword = body.keyword?.trim().toLowerCase();
    if (keyword) {
      records = records.filter((item) =>
        [item.employee_id, item.username, item.email, item.department, item.position].some(
          (value) => value.toLowerCase().includes(keyword)
        )
      );
    }
    if (body.username) records = records.filter((item) => item.username.includes(body.username!));
    if (body.employee_id)
      records = records.filter((item) => item.employee_id.includes(body.employee_id!));
    if (body.email) records = records.filter((item) => item.email.includes(body.email!));
    if (body.department_code) {
      records = records.filter((item) => item.department === body.department_code);
    }
    if (body.position) records = records.filter((item) => item.position === body.position);
    if (body.status) {
      const values = Array.isArray(body.status) ? body.status : [body.status];
      records = records.filter((item) => values.includes(item.status));
    }
    if (body.joined_start) records = records.filter((item) => item.joined_at >= body.joined_start!);
    if (body.joined_end) records = records.filter((item) => item.joined_at <= body.joined_end!);
    if (body.performance_min != null)
      records = records.filter((item) => item.performance >= body.performance_min!);
    if (body.performance_max != null)
      records = records.filter((item) => item.performance <= body.performance_max!);
    if (body.order_field && body.order_direction) {
      const direction = body.order_direction === "asc" ? 1 : -1;
      records.sort((left, right) => {
        const a = left[body.order_field!];
        const b = right[body.order_field!];
        return (
          (typeof a === "number" && typeof b === "number"
            ? a - b
            : String(a).localeCompare(String(b), "zh-CN")) * direction
        );
      });
    }
    const total_count = records.length;
    const start = (current - 1) * pageSize;
    await new Promise((resolve) => setTimeout(resolve, 350));
    return HttpResponse.json({
      code: SUCCESS_CODE,
      message: "success",
      data: {
        records: records.slice(start, start + pageSize),
        total_count,
        current,
        page_size: pageSize,
      },
    });
  }),
];
