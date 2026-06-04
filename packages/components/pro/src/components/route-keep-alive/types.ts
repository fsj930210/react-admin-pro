export interface ScrollPoint {
  left: number;
  top: number;
}

export interface ScrollSnapshot {
  container: ScrollPoint;
  nodes: Record<string, ScrollPoint>;
}

export interface RouteKeepAliveRef {
  refreshTab: (key: string) => void;
  removeTabs: (keys: string[]) => void;
}

export interface TabRouterEntry {
  id: string;
  href: string;
  router: any;
  activityKey: string;
  lastActiveAt: number;
  scrollSnapshot?: ScrollSnapshot;
  unsubscribe?: () => void;
}
