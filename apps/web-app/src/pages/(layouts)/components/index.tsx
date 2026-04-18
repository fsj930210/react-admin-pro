import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/components/")({
	beforeLoad: () => {
		// eslint-disable-next-line @typescript-eslint/only-throw-error
		throw Route.redirect({
			to: "./icon",
		});
	},
});
