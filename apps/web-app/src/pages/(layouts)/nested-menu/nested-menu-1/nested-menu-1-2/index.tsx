import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/nested-menu/nested-menu-1/nested-menu-1-2/")({
	beforeLoad: () => {
		// eslint-disable-next-line @typescript-eslint/only-throw-error
		throw Route.redirect({
			to: './nested-menu-1-2-1',
		})
	},
});
