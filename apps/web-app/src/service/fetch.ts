import { createFetchClient, type KyOptions } from "@rap/utils/fetch";
import { APP_BASE_PATH } from "@/config";

export const SUCCESS_CODE = "0000000000";

const beforeErrorStatus = () => (error: any) => {
	const { response } = error;
	const clonedResponse = response.clone();
	if (clonedResponse) {
		if (clonedResponse.status === 401) {
			window.location.href = `${APP_BASE_PATH}/login`;
		}
	}
	return error;
};
async function afterResponseJson(_request: Request, _options: KyOptions, response: Response) {
	try {
		const clonedResponse = response.clone();
		if (clonedResponse.status >= 200 && clonedResponse.status < 300) {
			const body = await clonedResponse.json();
			if (body.code === SUCCESS_CODE) {
				return body.data.data;
			}
			return body;
		}
	} catch (e: any) {
		// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
		return Promise.reject(e);
	}
}
const request = createFetchClient({
	silent: false,
	retry: 0,
	defaultJsonConfig: {
		defaultSuccessCode: SUCCESS_CODE,
	},
	hooks: {
		beforeError: [beforeErrorStatus()],
		afterResponse: [afterResponseJson],
	},
});

export default request;
