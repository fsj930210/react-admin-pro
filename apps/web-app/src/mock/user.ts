import { HttpResponse, http } from "msw";

const SUCCESS_CODE = '0000000000';
export default [
	http.post("/api/rap/user/info",  ({ request }) => {
		const token = request.headers.get('authorization') ?? '';
		if (!token) {
			return HttpResponse.json({ code: '4010000000', message: 'unauthorized', data: null });
		}
		const username = token.split(' ')[1] || '';
		const user = {
			id: '1', 
			username, 
			gender: 1,
			avatar: '',
			phone: '13333333333'
		}
		return HttpResponse.json({ code: SUCCESS_CODE, message: 'success', data: user });
	}),
];
