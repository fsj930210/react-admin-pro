import { createContext, type ReactNode, use, useMemo } from "react";
import type { IUserInfoResponseData } from "@/service/auth";
import type { MenuService } from "../service/menuService";
import type { MenuItem } from "../types";

interface LayoutContextValue {
  menuService: MenuService;
  userMenus: MenuItem[];
  userInfo: IUserInfoResponseData | null;
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined);

interface LayoutProviderProps {
  children: ReactNode;
  menuService: MenuService;
  userMenus: MenuItem[];
  userInfo: IUserInfoResponseData | null;
}

export function LayoutProvider({
  children,
  menuService,
  userMenus,
  userInfo,
}: LayoutProviderProps) {
  const contextValue: LayoutContextValue = useMemo(
    () => ({
      menuService,
      userMenus,
      userInfo,
    }),
    [menuService, userInfo, userMenus]
  );

  return <LayoutContext value={contextValue}>{children}</LayoutContext>;
}

export function useLayout() {
  const context = use(LayoutContext);
  if (context === undefined) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
