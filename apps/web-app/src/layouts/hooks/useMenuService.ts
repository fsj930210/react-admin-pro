import { useState, useMemo, useEffect, useRef } from 'react';
import { pinyin } from 'pinyin-pro';
import {  useNavigate, useRouterState } from '@tanstack/react-router';
export type MenuOpenMode = 'currentSystemTab' | 'newSystemTab' | 'iframe' | 'newBrowserTab';
export type MenuType = 'menu' | 'dir' | 'button';
export type MenuStatus = 'enabled' | 'disabled';
export type MenuBadgeType = 'text' | 'dot' | 'badge';
export type MenuBadgeColor = 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'custom';

export interface MenuBadge {
  type?: MenuBadgeType;
  text?: string;
  color?: MenuBadgeColor;
  customColor?: string;
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

const flattenMenus = (menuList: MenuItem[] = [], level = 0, parentPath: string[] = []): FlatMenuItem[] => {
  const result: FlatMenuItem[] = [];

  if (!menuList) return result;

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
  menus?: MenuItem[];
  defaultOpenKeys?: string[];
  defaultSelectedMenu?: MenuItem | null;
  multiOpen?: boolean;
	pinyinSearch?: boolean;
}

export function useMenuService(params?: UseMenuServiceParams) {
  const { 
		menus = [], 
		defaultOpenKeys, 
		defaultSelectedMenu, 
		multiOpen = true, 
		pinyinSearch = true 
	} = params ?? {};
	const isMenuItemClickRef = useRef(false);
  const navigate = useNavigate();
	const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(() => 
    defaultSelectedMenu ?? getStorageSelectedMenu()
  );
  const [openKeys, setOpenKeys] = useState<string[]>(() =>
    defaultOpenKeys ?? calcOpenKeys(defaultSelectedMenu ?? getStorageSelectedMenu(), menus)
  );
  
  const flatMenus = useMemo(() => {
    return flattenMenus(menus);
  }, [menus]);

  const updateSelectedMenu = (menu: MenuItem | null) => {
    setSelectedMenu(menu);
    setStorageSelectedMenu(menu);
  };

  const updateOpenKeysByMenu = (selectedMenu: MenuItem | null) => {
    const openKeys = calcOpenKeys(selectedMenu, menus);
    setOpenKeys(openKeys);
  };
  
  const toggleMenuOpen = (menuId: string) => {
    setOpenKeys(prevKeys => {
      if (prevKeys.includes(menuId)) {
        return prevKeys.filter(key => key !== menuId);
      } else {
        if (multiOpen) {
          const menu = findMenuById(menuId);
          if (menu) {
            const currentFlatMenus = flattenMenus(menus);
            const siblingMenus = currentFlatMenus.filter(item => item.parentId === menu.parentId);
            const siblingMenuIds = siblingMenus.map(item => item.id);
            return [...prevKeys.filter(key => !siblingMenuIds.includes(key)), menuId];
          }
        }
        return [...prevKeys, menuId];
      }
    });
  };

  const findMenuById = (menuId: string): MenuItem | null => {
    const currentFlatMenus = flattenMenus(menus);
    return currentFlatMenus.find(item => item.id === menuId) ?? null;
  };

  const findMenuByUrl = (url: string): MenuItem | null => {
    const normalizeUrl = (url: string) => {
      return url.split('?')[0].split('#')[0].replace(/\/$/, '');
    };

    const targetUrl = normalizeUrl(url);
    const currentFlatMenus = flattenMenus(menus);
    return currentFlatMenus.find(menu => normalizeUrl(menu.url ?? '') === targetUrl) ?? null;
  };

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

  const getTextMatchTexts = (searchKeyword: string, sourceText: string) => {
    const matchTexts: string[] = [];
    if (!searchKeyword || !sourceText) return matchTexts;
    const key = searchKeyword.trim().toLowerCase();
    const textLower = sourceText.toLowerCase();
    const keyLen = key.length;
    let start = 0;
    while ((start = textLower.indexOf(key, start)) > -1) {
      const realText = sourceText.substring(start, start + keyLen);
      if (!matchTexts.includes(realText)) {
        matchTexts.push(realText);
      }
      start += keyLen;
    }
    return matchTexts;
  };

  const getPinyinMatchTexts = (searchKeyword: string, sourceText: string) => {
    const matchTexts: string[] = [];
    if (!searchKeyword || !sourceText) return matchTexts;
    const key = searchKeyword.trim().toLowerCase();
    const keyLen = key.length;
    const pyArr = pinyin(sourceText, { type: 'array', toneType: 'none', v: true });
    const charArr = sourceText.split('');
    const yunMuWhiteList = ['an','ang','ong','eng','ing','ian','iao','uan','uang','uen','uei','iong'];
    const isOnlyYunMu = yunMuWhiteList.includes(key);
    charArr.forEach((char, idx) => {
      const currPy = pyArr[idx] || '';
      if (currPy === key && char && !matchTexts.includes(char)) {
        matchTexts.push(char);
      }
    });
    if (isOnlyYunMu && matchTexts.length === 0) {
      charArr.forEach((char, idx) => {
        const currPy = pyArr[idx] || '';
        if (currPy === key && char) matchTexts.push(char);
      });
    }

    if (keyLen > 1 && !isOnlyYunMu && matchTexts.length === 0) {
      for (let i = 0; i < pyArr.length; i++) {
        let currPy = '';
        let currChar = '';
        for (let j = i; j < pyArr.length; j++) {
          currPy += pyArr[j];
          currChar += charArr[j];
          if (currPy === key) {
            if (!matchTexts.includes(currChar)) {
              matchTexts.push(currChar);
            }
            break;
          }
          if (currPy.length > keyLen) break;
        }
      }
    }
    return [...new Set(matchTexts)].filter(Boolean);
  };

  const searchMenusReturnList = (keyword: string) => {
    const currentFlatMenus = flattenMenus(menus);
    if (!keyword.trim()) return { menus: currentFlatMenus, searchKeywords: [] };

    const searchKeyword = keyword.toLowerCase().trim();
    const searchKeywords: string[] = [];

    const matchedMenus = currentFlatMenus.filter(item => {
      const titleMatchTexts = getTextMatchTexts(searchKeyword, item.title);
      const codeMatchTexts = getTextMatchTexts(searchKeyword, item.code);
      const pinyinMatchTexts = pinyinSearch ? getPinyinMatchTexts(searchKeyword, item.title) : [];
      
      const match = titleMatchTexts.length > 0 || codeMatchTexts.length > 0 || pinyinMatchTexts.length > 0;
      
      if (match) {
        searchKeywords.push(...titleMatchTexts, ...codeMatchTexts, ...pinyinMatchTexts);
      }
      
      return match;
    });
    
    return { menus: matchedMenus, searchKeywords: Array.from(new Set(searchKeywords)) };
  };

  const searchMenusReturnTree = (keyword: string) => {
    if (!keyword.trim()) return { menus: menus, expandKeys: [], searchKeywords: [] };
    const searchKeyword = keyword.toLowerCase().trim();
    
    const searchMenuItems = (items: MenuItem[]) => {
      const expandKeys: string[] = [];
      const searchKeywords: string[] = [];

      const searchInMenu = (menuItems: MenuItem[]): MenuItem[] => {
        const matchedItems: MenuItem[] = [];

        for (const item of menuItems) {
          const titleMatchTexts = getTextMatchTexts(searchKeyword, item.title);
          const pinyinMatchTexts = pinyinSearch ? getPinyinMatchTexts(searchKeyword, item.title) : [];
          const match = titleMatchTexts.length > 0 || pinyinMatchTexts.length > 0;

          let matchedChildren: MenuItem[] = [];
          if (item.children && item.children.length > 0) {
            matchedChildren = searchInMenu(item.children);
          }

          if (match || matchedChildren.length > 0) {
            if (matchedChildren.length > 0) {
              expandKeys.push(item.id);
            }
            
            matchedItems.push({
              ...item,
              children: matchedChildren.length > 0 ? matchedChildren : item.children
            });
            
            searchKeywords.push(...titleMatchTexts, ...pinyinMatchTexts);
          }
        }

        return matchedItems;
      };

      const matchedMenus = searchInMenu(items);
      
      return {
        matchedMenus,
        expandKeys,
        searchKeywords: Array.from(new Set(searchKeywords))
      };
    };
    
    const { matchedMenus, expandKeys, searchKeywords } = searchMenuItems(menus);

    return { menus: matchedMenus, expandKeys, searchKeywords };
  };
	

	const handleMenuItemClick = (menuItem: MenuItem | null) => {
		if (!menuItem) return;
		if (menuItem.type === 'dir') {
			toggleMenuOpen(menuItem.id);
			return;
		}
		if (menuItem.type === 'menu' && menuItem.url) {
			if (menuItem.openMode === 'newBrowserTab') {
				window.open(menuItem.url, '_blank');
			} else {
				navigate({ to: menuItem.url });
			}
			updateSelectedMenu(menuItem);
			isMenuItemClickRef.current = true;
		}
	}
	useEffect(() => {
		if (isMenuItemClickRef.current) {
			isMenuItemClickRef.current = false;
			return;
		}
		const selectedMenu = findMenuByUrl(pathname);
		queueMicrotask(() => {
			if (selectedMenu) {
				updateSelectedMenu(selectedMenu)
				updateOpenKeysByMenu(selectedMenu)
			}
		});
	}, [pathname])

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
		updateOpenKeysByMenu,
		updateOpenKeys: setOpenKeys,
    searchMenusReturnList,
    searchMenusReturnTree,
		handleMenuItemClick,
  };
}