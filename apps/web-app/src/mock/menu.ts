import { HttpResponse, http } from "msw";

export const handlers = [
	http.post("/api/rap/login", () => {
		// const body = await request.json()
		return HttpResponse.json({ token: "mock-token" });
	}),
	http.get("/api/rap/menu", () => {
		return HttpResponse.json({ id: 1, name: "Mock User" });
	}),
];
