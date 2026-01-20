import { APP_BASE_PATH } from "@/config";
import { createFetchClient,  } from "@rap/utils/fetch";


const beforeErrorStatus = () => (error: any) => {
	const { response } = error;
	const clonedResponse =  response.clone();
	if (clonedResponse) {
		if (clonedResponse.status === 401) {
			window.location.href = `${APP_BASE_PATH}/login`;
		}
	}
	return error;
}
const request = createFetchClient({
	silent: false,
	retry: 0,
	hooks: {
		beforeError: [
			beforeErrorStatus(),
		]
	}
});

export default request;
