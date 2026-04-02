import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/features/")({
	beforeLoad: () => {
		// eslint-disable-next-line @typescript-eslint/only-throw-error
		throw Route.redirect({
			to: './theme',
		})
	},
});

