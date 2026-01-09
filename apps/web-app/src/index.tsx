import { initMock } from "@rap/mock-config";
import { APP_BASE_PATH } from "@/config";
import "@rap/styles/globals.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

 const getHandelers = () => {
	const modules = (() => {
		// @ts-ignore
		if (typeof __webpack_require__ !== 'undefined') {
			const context = (require as any).context('./mock', false, /\.(ts|js)$/);
			return context.keys().map((key: string) => context(key).default)
		} else {
			const globModules = (import.meta as any).glob('./mock/*.{js,ts}', { eager: true })
			return Object.values(globModules).map((mod: any) => mod.default)
		}
	})()

	const handlers = modules.flat().filter(Boolean)

	return handlers ?? []
}

const rootEl = document.getElementById("root");
if (rootEl) {
	const root = ReactDOM.createRoot(rootEl);
	initMock(getHandelers(), {
		startOptions: {
			serviceWorker: {
				url: `${APP_BASE_PATH}/mockServiceWorker.js`,
			},
		},
		enableMock: import.meta.env.RAP_WEB_APP_ENABLE_MOCK || "",
		currentEnvironment: import.meta.env.MODE || "development",
	}).then(() => {
		root.render(
			<React.StrictMode>
				<App />
			</React.StrictMode>,
		);
	});
}
