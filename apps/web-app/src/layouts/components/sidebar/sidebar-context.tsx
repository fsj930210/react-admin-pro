import  { createContext, use, useEffect, type ReactNode } from 'react';
import { useMenuService, type MenuItem } from '../../hooks/useMenuService';

export interface SidebarContextValue {
  menus: MenuItem[];
  flatMenus: MenuItem[];
  selectedMenu: MenuItem | null;
  setSelectedMenu: (menu: MenuItem | null) => void;

  setMenus: (menus: MenuItem[]) => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export interface SidebarProviderProps {
  children: ReactNode;
  initialMenus?: MenuItem[];
}

export function LayoutSidebarProvider({ children, initialMenus = [] }: SidebarProviderProps) {
  const {
    menus,
    flatMenus,
    selectedMenu,
    setSelectedMenu,
    setMenus,
  } = useMenuService(initialMenus);
  useEffect(() => {
    setMenus(initialMenus);
  }, [initialMenus]);
  const contextValue: SidebarContextValue = {
    menus,
    flatMenus,
    selectedMenu,
    setSelectedMenu,
    setMenus,
  };

  return (
    <SidebarContext value={contextValue}>
      {children}
    </SidebarContext>
  );
}

export function useSidebar() {
  const context = use(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}