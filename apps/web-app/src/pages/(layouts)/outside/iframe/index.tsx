import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/outside/iframe/")({
	beforeLoad: () => {
		// eslint-disable-next-line @typescript-eslint/only-throw-error
		throw Route.redirect({
			// biome-ignore lint:suspicious/noTsIgnore
			// @ts-ignore
			to: "/outside/iframe/react",
		});
	},
});
