import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/nested-menu/")({
	beforeLoad: () => {
		// eslint-disable-next-line @typescript-eslint/only-throw-error
		throw Route.redirect({
			to: "./nested-menu-3",
		});
	},
});
