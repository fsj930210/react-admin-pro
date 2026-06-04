import { Match, RouterContextProvider } from "@tanstack/react-router";
import { Suspense, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { getContentMatch } from "./route-match";
import { useRouterStore } from "./use-router-store";
import type { TabRouterEntry } from "./types";

interface TabRouteRendererProps {
  tab: TabRouterEntry;
  fallback?: ReactNode;
  layoutRouteId?: string;
}

export function TabRouteRenderer({ fallback, layoutRouteId, tab }: TabRouteRendererProps) {
  return (
    <RouterContextProvider router={tab.router}>
      <TabRouteMatch fallback={fallback} layoutRouteId={layoutRouteId} tab={tab} />
    </RouterContextProvider>
  );
}

function TabRouteMatch({ fallback, layoutRouteId, tab }: TabRouteRendererProps) {
  const selectMatches = useCallback((matches: any[]) => matches ?? [], []);
  const selectBoolean = useCallback((value: boolean) => Boolean(value), []);
  const matches = useRouterStore(tab.router.stores.matches, selectMatches);
  const isLoading = useRouterStore(tab.router.stores.isLoading, selectBoolean);
  const hasPending = useRouterStore(tab.router.stores.hasPending, selectBoolean);

  const matchId = useMemo(() => {
    const match = getContentMatch(matches, tab.router, layoutRouteId);
    return match?.id;
  }, [layoutRouteId, matches, tab.router]);

  if (!matchId || isLoading || hasPending) return fallback ?? null;

  return (
    <Suspense fallback={fallback ?? null}>
      <Match matchId={matchId} />
    </Suspense>
  );
}
