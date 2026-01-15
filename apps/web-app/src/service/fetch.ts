import { createHttpClient, type HttpClient } from "@rap/utils/fetch";

const baseFetch: HttpClient = createHttpClient({
	silent: false,
	onError: (error) => {
		console.error(error, 'baseFetch error');
	},
});

export default baseFetch;
