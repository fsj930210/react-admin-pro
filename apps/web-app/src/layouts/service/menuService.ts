export type MenuOpenMode = 'currentSystemTab' | 'newSystemTab' | 'iframe' | 'newBrowserTab';
export type MenuType = 'menu' | 'dir' | 'button';
export type MenuStatus = 'enabled' | 'disabled';
export interface MenuBadge {
  text: string;
  color: string;
}

export type MenuCategory = 'application' |'settings';
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
  children?: MenuItem[];
  category?: MenuCategory
}

export interface FlatMenuItem extends MenuItem {
  level: number;
  path: string[];
}

export class MenuService {
  private menus: MenuItem[] = [];
  private flatMenus: FlatMenuItem[] = [];

  constructor(initialMenus?: MenuItem[]) {
    this.menus = initialMenus ?? [];
    this.updateFlatMenus();
  }

  /**
   * 获取所有菜单（树形结构）
   */
  getMenus(): MenuItem[] {
    return this.menus;
  }

  /**
   * 获取铺平的菜单数组
   */
  getFlatMenus(): FlatMenuItem[] {
    return this.flatMenus;
  }

  /**
   * 更新铺平菜单数组
   */
  private updateFlatMenus(): void {
    this.flatMenus = this.flattenMenus(this.menus);
  }

  /**
   * 递归铺平菜单树
   */
  private flattenMenus(menus: MenuItem[], level = 0, parentPath: string[] = []): FlatMenuItem[] {
    const result: FlatMenuItem[] = [];

    menus.forEach(menu => {
      const currentPath = [...parentPath, menu.code];
      const flatMenu: FlatMenuItem = {
        ...menu,
        level,
        path: currentPath
      };

      result.push(flatMenu);

      if (menu.children && menu.children.length > 0) {
        result.push(...this.flattenMenus(menu.children, level + 1, currentPath));
      }
    });

    return result;
  }

  /**
   * 添加菜单
   */
  addMenu(menu: Omit<MenuItem, 'id'>, parentId?: string): MenuItem {
    const newMenu: MenuItem = {
      ...menu,
      id: this.generateId(),
      parentId: parentId ?? null,
      parentCode: parentId ? this.findMenuById(parentId)?.code ?? null : null
    };

    if (parentId) {
      this.addToParent(newMenu, parentId);
    } else {
      this.menus.push(newMenu);
    }

    this.updateFlatMenus();
    return newMenu;
  }

  /**
   * 将菜单添加到父菜单
   */
  private addToParent(menu: MenuItem, parentId: string): void {
    const parent = this.findMenuById(parentId);
    if (parent) {
      parent.children ??= [];
      parent.children.push(menu);
      parent.children.sort((a, b) => a.order - b.order);
    }
  }

  /**
   * 删除菜单
   */
  deleteMenu(menuId: string): boolean {
    const index = this.findIndexInMenus(menuId, this.menus);
    if (index !== -1) {
      this.menus.splice(index, 1);
      this.updateFlatMenus();
      return true;
    }

    // 在子菜单中查找并删除
    for (const menu of this.menus) {
      if (this.deleteFromChildren(menuId, menu.children)) {
        this.updateFlatMenus();
        return true;
      }
    }

    return false;
  }

  /**
   * 从子菜单中删除
   */
  private deleteFromChildren(menuId: string, children?: MenuItem[]): boolean {
    if (!children) return false;

    const index = children.findIndex(child => child.id === menuId);
    if (index !== -1) {
      children.splice(index, 1);
      return true;
    }

    for (const child of children) {
      if (this.deleteFromChildren(menuId, child.children)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 更新菜单
   */
  updateMenu(menuId: string, updates: Partial<MenuItem>): boolean {
    const menu = this.findMenuById(menuId);
    if (!menu) return false;

    Object.assign(menu, updates);

    // 如果更新了父菜单，需要重新组织结构
    if (updates.parentId !== undefined && updates.parentId !== menu.parentId) {
      this.reorganizeMenu(menu, updates.parentId);
    }

    this.updateFlatMenus();
    return true;
  }

  /**
   * 重新组织菜单结构
   */
  private reorganizeMenu(menu: MenuItem, newParentId: string | null): void {
    // 从原父菜单中移除
    if (menu.parentId) {
      this.removeFromParent(menu.id, menu.parentId);
    } else {
      const index = this.menus.findIndex(m => m.id === menu.id);
      if (index !== -1) {
        this.menus.splice(index, 1);
      }
    }

    // 添加到新父菜单
    menu.parentId = newParentId;
    menu.parentCode = newParentId ? this.findMenuById(newParentId)?.code ?? null : null;

    if (newParentId) {
      this.addToParent(menu, newParentId);
    } else {
      this.menus.push(menu);
    }
  }

  /**
   * 从父菜单中移除
   */
  private removeFromParent(menuId: string, parentId: string): void {
    const parent = this.findMenuById(parentId);
    if (parent && parent.children) {
      const index = parent.children.findIndex(child => child.id === menuId);
      if (index !== -1) {
        parent.children.splice(index, 1);
      }
    }
  }

  /**
   * 根据ID查找菜单
   */
  findMenuById(menuId: string): MenuItem | null {
    return this.searchInMenus(menuId, this.menus);
  }

  /**
   * 根据code查找菜单
   */
  findMenuByCode(menuCode: string): MenuItem | null {
    const flatMenu = this.flatMenus.find(menu => menu.code === menuCode);
    return flatMenu ?? null;
  }

  /**
   * 递归搜索菜单
   */
  private searchInMenus(menuId: string, menus: MenuItem[]): MenuItem | null {
    for (const menu of menus) {
      if (menu.id === menuId) {
        return menu;
      }
      if (menu.children) {
        const found = this.searchInMenus(menuId, menu.children);
        if (found) return found;
      }
    }
    return null;
  }

  /**
   * 查找菜单在数组中的索引
   */
  private findIndexInMenus(menuId: string, menus: MenuItem[]): number {
    return menus.findIndex(menu => menu.id === menuId);
  }

  /**
   * 获取菜单的面包屑路径
   */
  getMenuBreadcrumb(menuId: string): MenuItem[] {
    const breadcrumb: MenuItem[] = [];
    let current = this.findMenuById(menuId);

    while (current) {
      breadcrumb.unshift(current);
      if (current.parentId) {
        current = this.findMenuById(current.parentId);
      } else {
        break;
      }
    }

    return breadcrumb;
  }

  /**
   * 获取指定父菜单下的所有子菜单（包括孙子菜单）
   */
  getAllChildren(parentId: string): MenuItem[] {
    const parent = this.findMenuById(parentId);
    if (!parent || !parent.children) return [];

    const children: MenuItem[] = [];
    const collectChildren = (menus: MenuItem[]) => {
      menus.forEach(menu => {
        children.push(menu);
        if (menu.children) {
          collectChildren(menu.children);
        }
      });
    };

    collectChildren(parent.children);
    return children;
  }

  /**
   * 根据权限过滤菜单
   */
  filterMenusByPermissions(permissions: string[]): MenuItem[] {
    const filterMenu = (menus: MenuItem[]): MenuItem[] => {
      return menus.filter(menu => {
        if (menu.status === 'disabled' || menu.hidden) return false;

        const hasPermission = this.checkMenuPermission(menu, permissions);
        if (!hasPermission) return false;

        if (menu.children) {
          menu.children = filterMenu(menu.children);
        }

        return true;
      });
    };

    return filterMenu(this.menus);
  }

  /**
   * 检查菜单权限
   */
  private checkMenuPermission(menu: MenuItem, userPermissions: string[]): boolean {
    if (!menu.permissions || menu.permissions.length === 0) return true;

    const menuPermissions = Array.isArray(menu.permissions)
      ? menu.permissions
      : [menu.permissions];

    return menuPermissions.some(permission =>
      userPermissions.includes(permission)
    );
  }

  /**
   * 排序菜单
   */
  sortMenus(): void {
    const sortMenu = (menus: MenuItem[]) => {
      menus.sort((a, b) => a.order - b.order);
      menus.forEach(menu => {
        if (menu.children) {
          sortMenu(menu.children);
        }
      });
    };

    sortMenu(this.menus);
    this.updateFlatMenus();
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 根据URL或名称搜索菜单
   */
  searchMenus(keyword: string): MenuItem[] {
    if (!keyword.trim()) return [];

    const lowerKeyword = keyword.toLowerCase();
    const results: MenuItem[] = [];

    const searchInMenus = (menus: MenuItem[]) => {
      menus.forEach(menu => {
        // 检查标题匹配
        if (menu.title.toLowerCase().includes(lowerKeyword)) {
          results.push(menu);
        }
        // 检查URL匹配
        else if (menu.url.toLowerCase().includes(lowerKeyword)) {
          results.push(menu);
        }
        // 检查代码匹配
        else if (menu.code.toLowerCase().includes(lowerKeyword)) {
          results.push(menu);
        }

        // 递归搜索子菜单
        if (menu.children) {
          searchInMenus(menu.children);
        }
      });
    };

    searchInMenus(this.menus);

    // 去重（同一个菜单可能因为多个条件匹配而被重复添加）
    const uniqueResults = results.filter((menu, index, self) =>
      index === self.findIndex(m => m.id === menu.id)
    );

    return uniqueResults;
  }

  /**
   * 根据URL搜索菜单（精确匹配）
   */
  searchByUrl(url: string): MenuItem | null {
    const normalizeUrl = (url: string) => {
      // 移除查询参数和哈希
      return url.split('?')[0].split('#')[0].replace(/\/$/, '');
    };

    const targetUrl = normalizeUrl(url);

    const findInMenus = (menus: MenuItem[]): MenuItem | null => {
      for (const menu of menus) {
        const menuUrl = normalizeUrl(menu.url);

        if (menuUrl === targetUrl) {
          return menu;
        }

        if (menu.children) {
          const found = findInMenus(menu.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findInMenus(this.menus);
  }

  /**
   * 根据名称模糊搜索菜单
   */
  searchByName(keyword: string): MenuItem[] {
    return this.searchMenus(keyword).filter(menu =>
      menu.title.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * 获取搜索建议（基于输入的前缀）
   */
  getSearchSuggestions(prefix: string, limit = 10): string[] {
    if (!prefix.trim()) return [];

    const lowerPrefix = prefix.toLowerCase();
    const suggestions = new Set<string>();

    const collectSuggestions = (menus: MenuItem[]) => {
      menus.forEach(menu => {
        // 添加标题建议
        if (menu.title.toLowerCase().startsWith(lowerPrefix)) {
          suggestions.add(menu.title);
        }
        // 添加代码建议
        if (menu.code.toLowerCase().startsWith(lowerPrefix)) {
          suggestions.add(menu.code);
        }

        if (menu.children) {
          collectSuggestions(menu.children);
        }
      });
    };

    collectSuggestions(this.menus);

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * 根据分类获取菜单
   * @param category 菜单分类，如果不提供则返回所有分类的菜单
   * @param includeHidden 是否包含隐藏的菜单，默认为 false
   * @returns 按分类组织的菜单对象
   */
  getMenusByCategory(category?: MenuCategory, includeHidden = false): Record<MenuCategory | 'uncategorized', MenuItem[]> {
    const result: Record<MenuCategory | 'uncategorized', MenuItem[]> = {
      application: [],
      settings: [],
      uncategorized: []
    };

    const collectMenusByCategory = (menus: MenuItem[]) => {
      menus.forEach(menu => {
        // 跳过隐藏菜单（除非明确要求包含）
        if (!includeHidden && menu.hidden) {
          return;
        }

        // 根据分类分组
        if (menu.category) {
          result[menu.category].push(menu);
        } else {
          result.uncategorized.push(menu);
        }

        // 递归处理子菜单
        if (menu.children && menu.children.length > 0) {
          collectMenusByCategory(menu.children);
        }
      });
    };

    collectMenusByCategory(this.menus);

    // 如果指定了分类，只返回该分类的菜单
    if (category) {
      const partialResult: Record<MenuCategory | 'uncategorized', MenuItem[]> = {
        application: [],
        settings: [],
        uncategorized: []
      };
      partialResult[category] = result[category];
      return partialResult;
    }

    return result;
  }

  /**
   * 获取所有可用的菜单分类
   * @param includeEmpty 是否包含空的分类，默认为 false
   * @returns 分类列表及其菜单数量
   */
  getMenuCategories(includeEmpty = false): { category: MenuCategory | 'uncategorized'; count: number; label: string }[] {
    const categorizedMenus = this.getMenusByCategory();
    const categories = [
      { category: 'application' as const, count: categorizedMenus.application.length, label: '应用功能' },
      { category: 'settings' as const, count: categorizedMenus.settings.length, label: '系统设置' },
      { category: 'uncategorized' as const, count: categorizedMenus.uncategorized.length, label: '未分类' }
    ];

    return includeEmpty ? categories : categories.filter(cat => cat.count > 0);
  }

  /**
   * 根据分类筛选菜单（返回树形结构）
   * @param category 菜单分类
   * @param includeHidden 是否包含隐藏的菜单，默认为 false
   * @returns 符合条件的菜单树
   */
  filterMenusByCategory(category: MenuCategory, includeHidden = false): MenuItem[] {
    const filterMenuTree = (menus: MenuItem[]): MenuItem[] => {
      return menus.filter(menu => {
        // 跳过隐藏菜单（除非明确要求包含）
        if (!includeHidden && menu.hidden) {
          return false;
        }

        // 检查当前菜单是否匹配分类
        const currentMenuMatches = menu.category === category;

        // 递归处理子菜单
        if (menu.children) {
          menu.children = filterMenuTree(menu.children);
        }

        // 如果当前菜单匹配分类，或者有匹配的子菜单，则保留
        return currentMenuMatches || (menu.children && menu.children.length > 0);
      });
    };

    return filterMenuTree(JSON.parse(JSON.stringify(this.menus)));
  }


  /**
   * 从API加载菜单数据并创建MenuService实例
   * @param fetchMenus 获取菜单数据的函数
   * @returns Promise<MenuService> 包含菜单数据的MenuService实例
   */
  static async createWithApi(fetchMenus: () => Promise<MenuItem[]>): Promise<MenuService> {
    const menus = await fetchMenus();
    const service = new MenuService(menus);
    return service;
  }

  /**
   * 从API刷新菜单数据
   * @param fetchMenus 获取菜单数据的函数
   * @returns Promise<boolean> 是否刷新成功
   */
  async refreshFromApi(fetchMenus: () => Promise<MenuItem[]>): Promise<boolean> {
    try {
      const menus = await fetchMenus();
      this.menus = menus;
      this.updateFlatMenus();
      return true;
    } catch (error) {
      console.error('Failed to refresh menus from API:', error);
      return false;
    }
  }
}

// 导出默认实例
export const menuService = new MenuService();
