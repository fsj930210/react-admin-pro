import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLayout } from "@/layouts/context/layout-context";
import type { MenuItem } from "@/layouts/types";

export function useNavigationSelection() {
  const navigate = useNavigate();
  const { menuService } = useLayout();
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const [activeMenu, setActiveMenu] = useState<MenuItem | null>(null);

  useEffect(() => {
    queueMicrotask(() => {
      setActiveMenu(menuService.findMenuByUrl(pathname));
    });
  }, [menuService, pathname]);

  const activePath = activeMenu ? [...menuService.findMenuAncestor(activeMenu.id), activeMenu] : [];

  const selectMenu = useMemoizedFn((menu: MenuItem | null) => {
    if (!menu) return;

    const target = menu.type === "dir" ? menuService.findFirstChildMenu(menu) : menu;
    if (!target?.url) return;

    setActiveMenu(target);
    if (target.openMode === "newBrowserTab") {
      window.open(target.fullUrl ?? target.url, "_blank");
      return;
    }

    navigate({ to: target.openMode === "iframe" ? target.url : (target.fullUrl ?? target.url) });
  });

  return {
    activeMenu,
    activePath,
    activeTopMenu: activePath[0] ?? activeMenu,
    activeSecondMenu: activePath[1] ?? null,
    selectMenu,
  };
}
