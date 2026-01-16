import { createFetchClient } from "@rap/utils/fetch";

const request = createFetchClient({
	silent: false,
	// onError: (error: any) => {
	// 	console.error(error, 'request error');
	// },
});

export default request;
