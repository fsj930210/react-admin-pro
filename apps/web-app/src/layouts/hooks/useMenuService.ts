import { useState } from 'react';

export type MenuOpenMode = 'currentSystemTab' | 'newSystemTab' | 'iframe' | 'newBrowserTab';
export type MenuType = 'menu' | 'dir' | 'button';
export type MenuStatus = 'enabled' | 'disabled';
export interface MenuBadge {
  text: string;
  color: string;
}

export type MenuCategory = 'application' | 'system';

export interface MenuItem {
  id: string;
  code: string;
  title: string;
  url?: string;
  type: MenuType;
  icon?: string;
  parentId: string | null;
  parentCode: string | null;
  hidden: boolean;
  openMode?: MenuOpenMode;
  showHeader?: boolean;
  showSidebar?: boolean;
  showFooter?: boolean;
  keepAlive?: boolean;
  isOpenSidebar?: boolean;
  isHome?: boolean;
  isExternal?: boolean;
  badge?: MenuBadge;
  permissions: string | string[];
  order?: number;
  status: MenuStatus;
  children?: MenuItem[];
  category?: MenuCategory;
}

export interface FlatMenuItem extends MenuItem {
  level: number;
  path: string[];
}

const MENU_STORAGE_KEY = 'rap-selected-menu';

const getStorageSelectedMenu = (): MenuItem | null => {
  try {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(MENU_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as MenuItem;
  } catch {
    console.warn('Failed to parse selected menu from localStorage');
    return null;
  }
};

const setStorageSelectedMenu = (menu: MenuItem | null): void => {
  try {
    if (typeof window === 'undefined') return;
    if (menu === null) {
      localStorage.removeItem(MENU_STORAGE_KEY);
      return;
    }
    const serialized = JSON.stringify(menu);
    localStorage.setItem(MENU_STORAGE_KEY, serialized);
  } catch (error) {
    console.warn('Failed to save selected menu to localStorage:', error);
  }
};

// 根据选中的菜单计算初始应该展开的菜单项
const calcOpenKeys = (selectedMenu: MenuItem | null, menus: MenuItem[]): string[] => {
  if (!selectedMenu) return [];
  
  const openKeys: string[] = [];
  let current = selectedMenu;
  
  // 使用扁平菜单列表来提高查找效率
  const flatMenusList = flattenMenus(menus);
  
  // 向上遍历，找到所有父级菜单
  while (current && current.parentId) {
    const parent = flatMenusList.find(menu => menu.id === current.parentId);
    if (parent) {
      openKeys.push(parent.id);
      current = parent;
    } else {
      break;
    }
  }
  
  return openKeys;
};

const flattenMenus = (menuList: MenuItem[], level = 0, parentPath: string[] = []): FlatMenuItem[] => {
  const result: FlatMenuItem[] = [];

  menuList.forEach((menu) => {
    const currentPath = [...parentPath, menu.code];
    const flatMenu: FlatMenuItem = {
      ...menu,
      level,
      path: currentPath,
    };

    result.push(flatMenu);

    if (menu.children && menu.children.length > 0) {
      result.push(...flattenMenus(menu.children, level + 1, currentPath));
    }
  });

  return result;
};

interface UseMenuServiceParams {
  defaultMenus?: MenuItem[];
  defaultOpenKeys?: string[];
  defaultSelectedMenu?: MenuItem | null;
  menuMutex?: boolean; // 控制菜单是否互斥展开
}

export function useMenuService(params?: UseMenuServiceParams) {
  const { defaultMenus, defaultOpenKeys, defaultSelectedMenu, menuMutex = true } = params ?? {};
  
  const [menus, setMenus] = useState<MenuItem[]>(defaultMenus ?? []);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(() => 
    defaultSelectedMenu ?? getStorageSelectedMenu()
  );
  const [openKeys, setOpenKeys] = useState<string[]>(() => 
    defaultOpenKeys ?? calcOpenKeys(defaultSelectedMenu ?? getStorageSelectedMenu(), defaultMenus ?? [])
  );

  const updateSelectedMenu = (menu: MenuItem | null) => {
    setSelectedMenu(menu);
    setStorageSelectedMenu(menu);
  };

  const updateOpenKeysByMenu = (selectedMenu: MenuItem | null) => {
    const flatMenus = flattenMenus(menus);
    const openKeys = calcOpenKeys(selectedMenu, flatMenus);
    setOpenKeys(openKeys);
  };
  const toggleMenuOpen = (menuId: string) => {
    setOpenKeys(prevKeys => {
      if (prevKeys.includes(menuId)) {
        // 关闭当前菜单
        return prevKeys.filter(key => key !== menuId);
      } else {
        if (menuMutex) {
          // 菜单互斥：只展开当前菜单的同级菜单，关闭其他同级菜单
          const menu = findMenuById(menuId);
          if (menu) {
            // 找到所有同级菜单（相同parentId的菜单）
            const siblingMenus = flatMenus.filter(item => item.parentId === menu.parentId);
            const siblingMenuIds = siblingMenus.map(item => item.id);
            
            // 保留非同级菜单的展开状态，只关闭同级菜单并展开当前菜单
            return [...prevKeys.filter(key => !siblingMenuIds.includes(key)), menuId];
          }
        }
        // 非互斥模式：直接添加当前菜单到展开列表
        return [...prevKeys, menuId];
      }
    });
  };

  const findMenuById = (menuId: string): MenuItem | null => {
    return flatMenus.find(item => item.id === menuId) ?? null;
  };

  const findMenuByUrl = (url: string): MenuItem | null => {
    const normalizeUrl = (url: string) => {
      return url.split('?')[0].split('#')[0].replace(/\/$/, '');
    };

    const targetUrl = normalizeUrl(url);

    return flatMenus.find(menu => normalizeUrl(menu.url ?? '') === targetUrl) ?? null;
  };


  // const filterByPermissions = (permissions: string[]): MenuItem[] => {
  //   const filterMenu = (items: MenuItem[]): MenuItem[] => {
  //     return items
  //       .filter((menu) => {
  //         if (menu.status === 'disabled' || menu.hidden) return false;

  //         const hasPermission = (() => {
  //           if (!menu.permissions || menu.permissions.length === 0) return true;

  //           const menuPermissions = Array.isArray(menu.permissions)
  //             ? menu.permissions
  //             : [menu.permissions];

  //           return menuPermissions.some((permission) => permissions.includes(permission));
  //         })();

  //         if (!hasPermission) return false;

  //         if (menu.children) {
  //           menu.children = filterMenu(menu.children);
  //         }

  //         return true;
  //       })
  //       .filter((menu) => {
  //         if (menu.children && menu.children.length > 0) return true;
  //         return menu.status !== 'disabled' && !menu.hidden;
  //       });
  //   };

  //   return filterMenu(menus);
  // };


  const findMenuAncestor = (menuId: string): MenuItem[] => {
    const ancestor: MenuItem[] = [];
    let current = findMenuById(menuId);

    while (current) {
      ancestor.unshift(current);
      if (current.parentId) {
        current = findMenuById(current.parentId);
      } else {
        break;
      }
    }

    return ancestor;
  };

  const flatMenus = flattenMenus(menus);

  return {
    menus,
    flatMenus,
    selectedMenu,
    openKeys,
    findMenuById,
    findMenuByUrl,
		findMenuAncestor,
    toggleMenuOpen,
    updateSelectedMenu,
    updateMenus: setMenus,
		updateOpenKeysByMenu,
		updateOpenKeys: setOpenKeys
  };
}
