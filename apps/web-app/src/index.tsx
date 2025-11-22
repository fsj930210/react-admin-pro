import { initMock } from "@rap/mock-config";
import { APP_BASE_PATH } from "@/config";
import "@rap/styles/globals.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { handlers as mockHandlers } from "./mock/menu";

const rootEl = document.getElementById("root");
if (rootEl) {
	const root = ReactDOM.createRoot(rootEl);
	initMock(mockHandlers, {
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
