import { Toaster } from "@rap/components-ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, ErrorComponent, RouterProvider } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import "@bprogress/core/css";
import { BProgress } from "@bprogress/core";
import { ThemeProvider } from "@rap/components-ui/theme-provider";
import { TooltipProvider } from "@rap/components-ui/tooltip";
import { useEventEmitter } from "@rap/hooks/use-event-emitter";
import { useMemo } from "react";
import { APP_BASE_PATH } from "@/config";
import { UIPreferencesEffects, UIPreferencesPreview } from "@/components/app/ui-preferences";
import { uiPreferencesStore, useUIPreferences } from "@/store/ui-preferences";
import { type AppEvent, AppProvider } from "./app-context";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60,
			retry: 0,
		},
		mutations: {
			retry: 0,
		},
	},
});

const router = createRouter({
	routeTree,
	basepath: APP_BASE_PATH, // Set the base path for the router
	// biome-ignore lint:suspicious/noExplicitAny
	defaultErrorComponent: ({ error }: any) => <ErrorComponent error={error} />,
	context: {
		queryClient,
	},
	defaultPreload: "intent",
	// Since we're using React Query, we don't want loader calls to ever be stale
	// This will ensure that the loader is always called when the route is preloaded or visited
	defaultPreloadStaleTime: 0,
	scrollRestoration: true,
});

let isNavigating = false;

router.subscribe("onBeforeNavigate", () => {
	const { preferences } = uiPreferencesStore.store.getState();
	if (preferences.animation.progress && !isNavigating) {
		isNavigating = true;
		BProgress.start();
	}
});

router.subscribe("onResolved", () => {
	if (isNavigating) {
		isNavigating = false;
		BProgress.done();
	}
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}
const App = () => {
	const eventBus = useEventEmitter<AppEvent<unknown>>();
	const preferences = useUIPreferences("preferences");
	const themes = useMemo(
		() => preferences.appearance.availableThemes.filter((theme) => theme !== "system"),
		[preferences.appearance.availableThemes],
	);
	return (
		<ThemeProvider
			scope="root"
			storageKey="rap-web-theme"
			themes={themes}
			colorSchemeMap={{
				"tech-blue": "dark",
				"eco-green": "dark",
			}}
			attribute="class"
			enableSystem={preferences.appearance.followSystem}
			enableColorScheme
			defaultTheme={preferences.appearance.theme}
		>
			<UIPreferencesEffects />
			<div className="size-full overflow-x-hidden">
				<TooltipProvider>
					<AppProvider eventBus={eventBus}>
						<QueryClientProvider client={queryClient}>
							<RouterProvider router={router} />
						</QueryClientProvider>
						<Toaster />
						<UIPreferencesPreview />
					</AppProvider>
				</TooltipProvider>
			</div>
		</ThemeProvider>
	);
};

export default App;
