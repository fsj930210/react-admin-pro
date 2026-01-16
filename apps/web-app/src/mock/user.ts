import { HttpResponse, http } from "msw";

const SUCCESS_CODE = '0000000000';
export default [
	http.get("/api/rap/user/info",  ({ request }) => {
		const token = request.headers.get('authorization') ?? '';
		if (!token) {
			return HttpResponse.json({ message: 'Not Authorized', code: '401', data: null });
		}
		const username = token.split(' ')[1] || '';
		const user = {
			id: '1', 
			username, 
			gender: 1,
			avatar: '/rap-web-app/shadcn.jpg',
			phone: '13333333333',
			email: 'shadcn@example.com',
		}
		return HttpResponse.json({ code: SUCCESS_CODE, message: 'success', data: user });
	}),
];
