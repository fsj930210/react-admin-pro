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

export function useMenuService(initialMenus?: MenuItem[]) {
  const [menus, setMenus] = useState<MenuItem[]>(initialMenus ?? []);
  const [selectedMenu, _setSelectedMenu] = useState<MenuItem | null>(() => getStorageSelectedMenu());

  const setSelectedMenu = (menu: MenuItem | null) => {
    _setSelectedMenu(menu);
    setStorageSelectedMenu(menu);
  };

	const findMenus = (keyword: string): MenuItem[] => {
    if (!keyword.trim()) return [];

    const lowerKeyword = keyword.toLowerCase();
    
    return flatMenus.filter(menu => 
      menu.title.toLowerCase().includes(lowerKeyword) ||
      menu.code.toLowerCase().includes(lowerKeyword) ||
      (menu.url && menu.url.toLowerCase().includes(lowerKeyword))
    );
  };
  const findMenuById = (menuId: string): MenuItem | null => {
    return flatMenus.find(item => item.id === menuId) ?? null;
  };

  const findByUrl = (url: string): MenuItem | null => {
    const normalizeUrl = (url: string) => {
      return url.split('?')[0].split('#')[0].replace(/\/$/, '');
    };

    const targetUrl = normalizeUrl(url);

    return flatMenus.find(menu => normalizeUrl(menu.url ?? '') === targetUrl) ?? null;
  };

  const findByName = (keyword: string): MenuItem[] => {
    const lowerKeyword = keyword.toLowerCase();
    return flatMenus.filter(menu => menu.title.toLowerCase().includes(lowerKeyword));
  };

  const findSearchSuggestions = (prefix: string, limit = 10): string[] => {
    if (!prefix.trim()) return [];

    const lowerPrefix = prefix.toLowerCase();
    const suggestions = new Set<string>();

    flatMenus.forEach(menu => {
      if (menu.title.toLowerCase().startsWith(lowerPrefix)) {
        suggestions.add(menu.title);
      }
      if (menu.code.toLowerCase().startsWith(lowerPrefix)) {
        suggestions.add(menu.code);
      }
    });

    return Array.from(suggestions).slice(0, limit);
  };

  const filterByPermissions = (permissions: string[]): MenuItem[] => {
    const filterMenu = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter((menu) => {
          if (menu.status === 'disabled' || menu.hidden) return false;

          const hasPermission = (() => {
            if (!menu.permissions || menu.permissions.length === 0) return true;

            const menuPermissions = Array.isArray(menu.permissions)
              ? menu.permissions
              : [menu.permissions];

            return menuPermissions.some((permission) => permissions.includes(permission));
          })();

          if (!hasPermission) return false;

          if (menu.children) {
            menu.children = filterMenu(menu.children);
          }

          return true;
        })
        .filter((menu) => {
          if (menu.children && menu.children.length > 0) return true;
          return menu.status !== 'disabled' && !menu.hidden;
        });
    };

    return filterMenu(menus);
  };

  const filterByCategory = (category: MenuCategory, includeHidden = false): MenuItem[] => {
    const filterMenuTree = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter((menu) => {
          if (!includeHidden && menu.hidden) {
            return false;
          }

          const currentMenuMatches = menu.category === category;

          if (menu.children) {
            menu.children = filterMenuTree(menu.children);
          }

          return currentMenuMatches || (menu.children && menu.children.length > 0);
        })
        .filter(Boolean);
    };

    return filterMenuTree(JSON.parse(JSON.stringify(menus)));
  };

  const findByCategory = (category?: MenuCategory, includeHidden = false): Record<MenuCategory | 'uncategorized', MenuItem[]> => {
    const result: Record<MenuCategory | 'uncategorized', MenuItem[]> = {
      application: [],
      system: [],
      uncategorized: [],
    };

    const collectMenusByCategory = (items: MenuItem[]) => {
      items.forEach((menu) => {
        if (!includeHidden && menu.hidden) {
          return;
        }

        if (menu.category) {
          result[menu.category].push(menu);
        } else {
          result.uncategorized.push(menu);
        }

        if (menu.children && menu.children.length > 0) {
          collectMenusByCategory(menu.children);
        }
      });
    };

    collectMenusByCategory(menus);

    if (category) {
      const partialResult: Record<MenuCategory | 'uncategorized', MenuItem[]> = {
        application: [],
        system: [],
        uncategorized: [],
      };
      partialResult[category] = result[category];
      return partialResult;
    }

    return result;
  };

  const findCategories = (includeEmpty = false): { category: MenuCategory | 'uncategorized'; count: number; label: string }[] => {
    const categorizedMenus = findByCategory();
    const categories = [
      { category: 'application' as const, count: categorizedMenus.application.length, label: '应用功能' },
      { category: 'system' as const, count: categorizedMenus.system.length, label: '系统设置' },
      { category: 'uncategorized' as const, count: categorizedMenus.uncategorized.length, label: '未分类' },
    ];

    return includeEmpty ? categories : categories.filter((cat) => cat.count > 0);
  };

  const findBreadcrumb = (menuId: string): MenuItem[] => {
    const breadcrumb: MenuItem[] = [];
    let current = findMenuById(menuId);

    while (current) {
      breadcrumb.unshift(current);
      if (current.parentId) {
        current = findMenuById(current.parentId);
      } else {
        break;
      }
    }

    return breadcrumb;
  };

  const findChildren = (parentId: string): MenuItem[] => {
    const parent = findMenuById(parentId);
    if (!parent || !parent.children) return [];

    const children: MenuItem[] = [];
    const collectChildren = (items: MenuItem[]) => {
      items.forEach((menu) => {
        children.push(menu);
        if (menu.children) {
          collectChildren(menu.children);
        }
      });
    };

    collectChildren(parent.children);
    return children;
  };

  const sortMenus = () => {
    const sortMenu = (items: MenuItem[]): MenuItem[] => {
      return items
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((menu) => {
          if (menu.children) {
            return { ...menu, children: sortMenu(menu.children) };
          }
          return menu;
        });
    };

    setMenus(sortMenu(menus));
  };

  const flatMenus = flattenMenus(menus);

  return {
    menus,
    flatMenus,
    selectedMenu,
    setSelectedMenu,
    findById: findMenuById,
    findMenus,
    findByUrl,
    findByName,
    findSearchSuggestions,
    filterByPermissions,
    filterByCategory,
    findByCategory,
    findCategories,
    findBreadcrumb,
    findChildren,
    sortMenus,
    setMenus,
  };
}