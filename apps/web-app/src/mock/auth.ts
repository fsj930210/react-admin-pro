import { HttpResponse, http } from "msw";

const SUCCESS_CODE = "0000000000";
export default [
	http.post("/api/rap/login", async ({ request }) => {
		const body = (await request.json()) as { username: string };
		const { username } = body;
		return HttpResponse.json({ code: SUCCESS_CODE, message: "success", data: { token: username } });
	}),
	http.post("/api/rap/logout", () => {
		return HttpResponse.json({ code: SUCCESS_CODE, message: "success", data: null });
	}),
];
