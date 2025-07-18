import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "@rap/styles/globals.css";
import "@rap/styles/utility.css";

const rootEl = document.getElementById("root");
if (rootEl) {
	const root = ReactDOM.createRoot(rootEl);
	root.render(
		<React.StrictMode>
			<App />
		</React.StrictMode>,
	);
}
