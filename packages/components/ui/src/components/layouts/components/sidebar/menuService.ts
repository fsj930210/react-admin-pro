export type MenuOpenMode = 'currentSystemTab' | 'newSystemTab' | 'iframe' | 'newBrowserTab';
export type MenuType = 'menu' | 'dir' | 'button';
export type MenuStatus = 'enabled' | 'disabled';
export type MenuBadge = {
  text: string;
  color: string;
}
export interface MenuItem {
  id: string;
  code: string;
  title: string;
  url: string;
  type: MenuType;
  icon: string;
  parentId: string | null;
  parentCode: string | null;
  hidden: boolean;
  openMode: MenuOpenMode;
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  keepAlive?: boolean;
  isOpenSidebar?: boolean;
  isHome?: boolean;
  isExternal?: boolean;
  badge?: MenuBadge;
  permissions: string | string[];
  order: number;
  isActive: boolean;
  status: MenuStatus;
}