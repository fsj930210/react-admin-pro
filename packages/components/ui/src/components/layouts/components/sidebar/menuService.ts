export type MenuOpenMode = 'currentSystemTab' | 'newSystemTab' | 'iframe' | 'newBrowserTab';
export type MenuType = 'menu' | 'dir' | 'button';
export type MenuStatus = 'enabled' | 'disabled';
export type MenuBadge = {
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
    this.menus = initialMenus || this.generateMockMenus();
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
  private flattenMenus(menus: MenuItem[], level: number = 0, parentPath: string[] = []): FlatMenuItem[] {
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
      parentId: parentId || null,
      parentCode: parentId ? this.findMenuById(parentId)?.code || null : null
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
      if (!parent.children) {
        parent.children = [];
      }
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
    menu.parentCode = newParentId ? this.findMenuById(newParentId)?.code || null : null;

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
    return flatMenu || null;
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
  getSearchSuggestions(prefix: string, limit: number = 10): string[] {
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
  getMenusByCategory(category?: MenuCategory, includeHidden: boolean = false): Record<MenuCategory | 'uncategorized', MenuItem[]> {
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
  getMenuCategories(includeEmpty: boolean = false): Array<{ category: MenuCategory | 'uncategorized'; count: number; label: string }> {
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
  filterMenusByCategory(category: MenuCategory, includeHidden: boolean = false): MenuItem[] {
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
   * 生成模拟菜单数据 - 完整的企业级菜单系统
   */
  private generateMockMenus(): MenuItem[] {
    return [
      // 首页
      {
        id: 'home',
        code: 'home',
        title: '首页',
        url: '/',
        type: 'menu',
        icon: 'home',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        isHome: true,
        keepAlive: true,
        permissions: [],
        order: 1,
        isActive: true,
        status: 'enabled'
      },
      // 工作台
      {
        id: 'workspace',
        code: 'workspace',
        title: '工作台',
        url: '/workspace',
        type: 'dir',
        icon: 'workspace',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: ['workspace:access'],
        order: 2,
        isActive: true,
        status: 'enabled',
        category: 'application',
        children: [
          {
            id: 'workspace-dashboard',
            code: 'workspace-dashboard',
            title: '我的工作台',
            url: '/workspace/dashboard',
            type: 'menu',
            icon: 'dashboard',
            parentId: 'workspace',
            parentCode: 'workspace',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['workspace:dashboard'],
            order: 1,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'workspace-tasks',
            code: 'workspace-tasks',
            title: '待办事项',
            url: '/workspace/tasks',
            type: 'menu',
            icon: 'tasks',
            parentId: 'workspace',
            parentCode: 'workspace',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['workspace:tasks'],
            order: 2,
            isActive: true,
            status: 'enabled',
            badge: { text: '3', color: 'red' }
          },
          {
            id: 'workspace-calendar',
            code: 'workspace-calendar',
            title: '日程安排',
            url: '/workspace/calendar',
            type: 'menu',
            icon: 'calendar',
            parentId: 'workspace',
            parentCode: 'workspace',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['workspace:calendar'],
            order: 3,
            isActive: true,
            status: 'enabled'
          }
        ]
      },
      // 客户管理
      {
        id: 'customer',
        code: 'customer',
        title: '客户管理',
        url: '/customer',
        type: 'dir',
        icon: 'customers',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: ['customer:access'],
        order: 3,
        isActive: true,
        status: 'enabled',
        children: [
          {
            id: 'customer-list',
            code: 'customer-list',
            title: '客户列表',
            url: '/customer/list',
            type: 'menu',
            icon: 'list',
            parentId: 'customer',
            parentCode: 'customer',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['customer:list'],
            order: 1,
            isActive: true,
            status: 'enabled',
            children: [
              {
                id: 'customer-list-all',
                code: 'customer-list-all',
                title: '全部客户',
                url: '/customer/list/all',
                type: 'menu',
                icon: 'all',
                parentId: 'customer-list',
                parentCode: 'customer-list',
                hidden: false,
                openMode: 'currentSystemTab',
                permissions: ['customer:list:all'],
                order: 1,
                isActive: true,
                status: 'enabled'
              },
              {
                id: 'customer-list-vip',
                code: 'customer-list-vip',
                title: 'VIP客户',
                url: '/customer/list/vip',
                type: 'menu',
                icon: 'vip',
                parentId: 'customer-list',
                parentCode: 'customer-list',
                hidden: false,
                openMode: 'currentSystemTab',
                permissions: ['customer:list:vip'],
                order: 2,
                isActive: true,
                status: 'enabled'
              },
              {
                id: 'customer-list-potential',
                code: 'customer-list-potential',
                title: '潜在客户',
                url: '/customer/list/potential',
                type: 'menu',
                icon: 'potential',
                parentId: 'customer-list',
                parentCode: 'customer-list',
                hidden: false,
                openMode: 'currentSystemTab',
                permissions: ['customer:list:potential'],
                order: 3,
                isActive: true,
                status: 'enabled'
              }
            ]
          },
          {
            id: 'customer-add',
            code: 'customer-add',
            title: '新增客户',
            url: '/customer/add',
            type: 'button',
            icon: 'add',
            parentId: 'customer',
            parentCode: 'customer',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['customer:add'],
            order: 2,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'customer-analysis',
            code: 'customer-analysis',
            title: '客户分析',
            url: '/customer/analysis',
            type: 'menu',
            icon: 'analysis',
            parentId: 'customer',
            parentCode: 'customer',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['customer:analysis'],
            order: 3,
            isActive: true,
            status: 'enabled',
            badge: { text: '新', color: 'green' }
          }
        ]
      },
      // 订单管理
      {
        id: 'order',
        code: 'order',
        title: '订单管理',
        url: '/order',
        type: 'dir',
        icon: 'orders',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: ['order:access'],
        order: 4,
        isActive: true,
        status: 'enabled',
        children: [
          {
            id: 'order-list',
            code: 'order-list',
            title: '订单列表',
            url: '/order/list',
            type: 'menu',
            icon: 'list',
            parentId: 'order',
            parentCode: 'order',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['order:list'],
            order: 1,
            isActive: true,
            status: 'enabled',
            badge: { text: '12', color: 'blue' }
          },
          {
            id: 'order-create',
            code: 'order-create',
            title: '创建订单',
            url: '/order/create',
            type: 'button',
            icon: 'create',
            parentId: 'order',
            parentCode: 'order',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['order:create'],
            order: 2,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'order-refund',
            code: 'order-refund',
            title: '退款管理',
            url: '/order/refund',
            type: 'menu',
            icon: 'refund',
            parentId: 'order',
            parentCode: 'order',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['order:refund'],
            order: 3,
            isActive: true,
            status: 'enabled'
          }
        ]
      },
      // 财务管理
      {
        id: 'finance',
        code: 'finance',
        title: '财务管理',
        url: '/finance',
        type: 'dir',
        icon: 'finance',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: ['finance:access'],
        order: 5,
        isActive: true,
        status: 'enabled',
        children: [
          {
            id: 'finance-overview',
            code: 'finance-overview',
            title: '财务总览',
            url: '/finance/overview',
            type: 'menu',
            icon: 'overview',
            parentId: 'finance',
            parentCode: 'finance',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['finance:overview'],
            order: 1,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'finance-invoice',
            code: 'finance-invoice',
            title: '发票管理',
            url: '/finance/invoice',
            type: 'menu',
            icon: 'invoice',
            parentId: 'finance',
            parentCode: 'finance',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['finance:invoice'],
            order: 2,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'finance-report',
            code: 'finance-report',
            title: '财务报表',
            url: '/finance/report',
            type: 'menu',
            icon: 'report',
            parentId: 'finance',
            parentCode: 'finance',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['finance:report'],
            order: 3,
            isActive: true,
            status: 'enabled',
            children: [
              {
                id: 'finance-report-monthly',
                code: 'finance-report-monthly',
                title: '月度报表',
                url: '/finance/report/monthly',
                type: 'menu',
                icon: 'monthly',
                parentId: 'finance-report',
                parentCode: 'finance-report',
                hidden: false,
                openMode: 'currentSystemTab',
                permissions: ['finance:report:monthly'],
                order: 1,
                isActive: true,
                status: 'enabled'
              },
              {
                id: 'finance-report-quarterly',
                code: 'finance-report-quarterly',
                title: '季度报表',
                url: '/finance/report/quarterly',
                type: 'menu',
                icon: 'quarterly',
                parentId: 'finance-report',
                parentCode: 'finance-report',
                hidden: false,
                openMode: 'currentSystemTab',
                permissions: ['finance:report:quarterly'],
                order: 2,
                isActive: true,
                status: 'enabled'
              },
              {
                id: 'finance-report-annual',
                code: 'finance-report-annual',
                title: '年度报表',
                url: '/finance/report/annual',
                type: 'menu',
                icon: 'annual',
                parentId: 'finance-report',
                parentCode: 'finance-report',
                hidden: false,
                openMode: 'currentSystemTab',
                permissions: ['finance:report:annual'],
                order: 3,
                isActive: true,
                status: 'enabled'
              }
            ]
          }
        ]
      },
      // 库存管理
      {
        id: 'inventory',
        code: 'inventory',
        title: '库存管理',
        url: '/inventory',
        type: 'dir',
        icon: 'inventory',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: ['inventory:access'],
        order: 6,
        isActive: true,
        status: 'enabled',
        children: [
          {
            id: 'inventory-stock',
            code: 'inventory-stock',
            title: '库存查询',
            url: '/inventory/stock',
            type: 'menu',
            icon: 'stock',
            parentId: 'inventory',
            parentCode: 'inventory',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['inventory:stock'],
            order: 1,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'inventory-inbound',
            code: 'inventory-inbound',
            title: '入库管理',
            url: '/inventory/inbound',
            type: 'menu',
            icon: 'inbound',
            parentId: 'inventory',
            parentCode: 'inventory',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['inventory:inbound'],
            order: 2,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'inventory-outbound',
            code: 'inventory-outbound',
            title: '出库管理',
            url: '/inventory/outbound',
            type: 'menu',
            icon: 'outbound',
            parentId: 'inventory',
            parentCode: 'inventory',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['inventory:outbound'],
            order: 3,
            isActive: true,
            status: 'enabled'
          }
        ]
      },
      // 系统管理
      {
        id: 'system',
        code: 'system',
        title: '系统管理',
        url: '/system',
        type: 'dir',
        icon: 'system',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: ['system:access'],
        order: 7,
        isActive: true,
        status: 'enabled',
        category: 'settings',
        children: [
          {
            id: 'system-user',
            code: 'system-user',
            title: '用户管理',
            url: '/system/user',
            type: 'menu',
            icon: 'users',
            parentId: 'system',
            parentCode: 'system',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['system:user'],
            order: 1,
            isActive: true,
            status: 'enabled',
            children: [
              {
                id: 'system-user-list',
                code: 'system-user-list',
                title: '用户列表',
                url: '/system/user/list',
                type: 'menu',
                icon: 'list',
                parentId: 'system-user',
                parentCode: 'system-user',
                hidden: false,
                openMode: 'currentSystemTab',
                permissions: ['system:user:list'],
                order: 1,
                isActive: true,
                status: 'enabled'
              },
              {
                id: 'system-user-create',
                code: 'system-user-create',
                title: '新增用户',
                url: '/system/user/create',
                type: 'button',
                icon: 'add',
                parentId: 'system-user',
                parentCode: 'system-user',
                hidden: false,
                openMode: 'currentSystemTab',
                permissions: ['system:user:create'],
                order: 2,
                isActive: true,
                status: 'enabled'
              }
            ]
          },
          {
            id: 'system-role',
            code: 'system-role',
            title: '角色管理',
            url: '/system/role',
            type: 'menu',
            icon: 'roles',
            parentId: 'system',
            parentCode: 'system',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['system:role'],
            order: 2,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'system-permission',
            code: 'system-permission',
            title: '权限管理',
            url: '/system/permission',
            type: 'menu',
            icon: 'permissions',
            parentId: 'system',
            parentCode: 'system',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['system:permission'],
            order: 3,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'system-menu',
            code: 'system-menu',
            title: '菜单管理',
            url: '/system/menu',
            type: 'menu',
            icon: 'menus',
            parentId: 'system',
            parentCode: 'system',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['system:menu'],
            order: 4,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'system-setting',
            code: 'system-setting',
            title: '系统设置',
            url: '/system/setting',
            type: 'menu',
            icon: 'settings',
            parentId: 'system',
            parentCode: 'system',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['system:setting'],
            order: 5,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'system-log',
            code: 'system-log',
            title: '系统日志',
            url: '/system/log',
            type: 'menu',
            icon: 'log',
            parentId: 'system',
            parentCode: 'system',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['system:log'],
            order: 6,
            isActive: true,
            status: 'enabled'
          }
        ]
      },
      // 报表中心
      {
        id: 'report',
        code: 'report',
        title: '报表中心',
        url: '/report',
        type: 'dir',
        icon: 'report-center',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: ['report:access'],
        order: 8,
        isActive: true,
        status: 'enabled',
        children: [
          {
            id: 'report-sales',
            code: 'report-sales',
            title: '销售报表',
            url: '/report/sales',
            type: 'menu',
            icon: 'sales',
            parentId: 'report',
            parentCode: 'report',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['report:sales'],
            order: 1,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'report-customer',
            code: 'report-customer',
            title: '客户报表',
            url: '/report/customer',
            type: 'menu',
            icon: 'customer-report',
            parentId: 'report',
            parentCode: 'report',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['report:customer'],
            order: 2,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'report-product',
            code: 'report-product',
            title: '产品报表',
            url: '/report/product',
            type: 'menu',
            icon: 'product-report',
            parentId: 'report',
            parentCode: 'report',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['report:product'],
            order: 3,
            isActive: true,
            status: 'enabled'
          }
        ]
      },
      // 帮助中心
      {
        id: 'help',
        code: 'help',
        title: '帮助中心',
        url: '/help',
        type: 'dir',
        icon: 'help',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: [],
        order: 9,
        isActive: true,
        status: 'enabled',
        children: [
          {
            id: 'help-docs',
            code: 'help-docs',
            title: '使用文档',
            url: '/help/docs',
            type: 'menu',
            icon: 'docs',
            parentId: 'help',
            parentCode: 'help',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: [],
            order: 1,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'help-faq',
            code: 'help-faq',
            title: '常见问题',
            url: '/help/faq',
            type: 'menu',
            icon: 'faq',
            parentId: 'help',
            parentCode: 'help',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: [],
            order: 2,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'help-contact',
            code: 'help-contact',
            title: '联系支持',
            url: '/help/contact',
            type: 'menu',
            icon: 'contact',
            parentId: 'help',
            parentCode: 'help',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: [],
            order: 3,
            isActive: true,
            status: 'enabled'
          }
        ]
      },
      // 外部链接
      {
        id: 'external',
        code: 'external',
        title: '外部链接',
        url: 'https://example.com',
        type: 'menu',
        icon: 'external',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'newBrowserTab',
        isExternal: true,
        permissions: [],
        order: 10,
        isActive: true,
        status: 'enabled'
      },
      // 隐藏的测试菜单（用于测试）
      {
        id: 'test-hidden',
        code: 'test-hidden',
        title: '测试菜单',
        url: '/test',
        type: 'menu',
        icon: 'test',
        parentId: null,
        parentCode: null,
        hidden: true,
        openMode: 'currentSystemTab',
        permissions: [],
        order: 999,
        isActive: true,
        status: 'enabled'
      },
      // 禁用的菜单（用于测试）
      {
        id: 'test-disabled',
        code: 'test-disabled',
        title: '禁用菜单',
        url: '/disabled',
        type: 'menu',
        icon: 'disabled',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: [],
        order: 1000,
        isActive: true,
        status: 'disabled'
      }
    ];
  }

  /**
   * 获取模拟数据 - 基础菜单数据
   */
  static getBasicMockData(): MenuItem[] {
    return [
      {
        id: 'menu_basic_1',
        code: 'home',
        title: '首页',
        url: '/',
        type: 'menu',
        icon: 'home',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        isHome: true,
        permissions: [],
        order: 1,
        isActive: true,
        status: 'enabled'
      },
      {
        id: 'menu_basic_2',
        code: 'about',
        title: '关于我们',
        url: '/about',
        type: 'menu',
        icon: 'info',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: [],
        order: 2,
        isActive: true,
        status: 'enabled'
      }
    ];
  }

  /**
   * 获取模拟数据 - 复杂层级菜单
   */
  static getComplexMockData(): MenuItem[] {
    return [
      {
        id: 'complex_1',
        code: 'level1',
        title: '一级菜单',
        url: '/level1',
        type: 'dir',
        icon: 'folder',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: [],
        order: 1,
        isActive: true,
        status: 'enabled',
        children: [
          {
            id: 'complex_1_1',
            code: 'level2-1',
            title: '二级菜单1',
            url: '/level1/level2-1',
            type: 'dir',
            icon: 'folder',
            parentId: 'complex_1',
            parentCode: 'level1',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: [],
            order: 1,
            isActive: true,
            status: 'enabled',
            children: [
              {
                id: 'complex_1_1_1',
                code: 'level3-1-1',
                title: '三级菜单1-1',
                url: '/level1/level2-1/level3-1-1',
                type: 'menu',
                icon: 'file',
                parentId: 'complex_1_1',
                parentCode: 'level2-1',
                hidden: false,
                openMode: 'currentSystemTab',
                permissions: [],
                order: 1,
                isActive: true,
                status: 'enabled'
              },
              {
                id: 'complex_1_1_2',
                code: 'level3-1-2',
                title: '三级菜单1-2',
                url: '/level1/level2-1/level3-1-2',
                type: 'menu',
                icon: 'file',
                parentId: 'complex_1_1',
                parentCode: 'level2-1',
                hidden: false,
                openMode: 'currentSystemTab',
                permissions: [],
                order: 2,
                isActive: true,
                status: 'enabled',
                badge: { text: '新', color: 'green' }
              }
            ]
          },
          {
            id: 'complex_1_2',
            code: 'level2-2',
            title: '二级菜单2',
            url: '/level1/level2-2',
            type: 'menu',
            icon: 'file',
            parentId: 'complex_1',
            parentCode: 'level1',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: [],
            order: 2,
            isActive: true,
            status: 'enabled'
          }
        ]
      }
    ];
  }

  /**
   * 获取模拟数据 - 带权限控制的菜单
   */
  static getPermissionMockData(): MenuItem[] {
    return [
      {
        id: 'perm_1',
        code: 'admin',
        title: '管理员功能',
        url: '/admin',
        type: 'dir',
        icon: 'admin',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: ['admin:access'],
        order: 1,
        isActive: true,
        status: 'enabled',
        children: [
          {
            id: 'perm_1_1',
            code: 'admin-users',
            title: '用户管理',
            url: '/admin/users',
            type: 'menu',
            icon: 'users',
            parentId: 'perm_1',
            parentCode: 'admin',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['admin:users'],
            order: 1,
            isActive: true,
            status: 'enabled'
          },
          {
            id: 'perm_1_2',
            code: 'admin-settings',
            title: '系统设置',
            url: '/admin/settings',
            type: 'menu',
            icon: 'settings',
            parentId: 'perm_1',
            parentCode: 'admin',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['admin:settings'],
            order: 2,
            isActive: true,
            status: 'enabled'
          }
        ]
      },
      {
        id: 'perm_2',
        code: 'user',
        title: '用户功能',
        url: '/user',
        type: 'dir',
        icon: 'user',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: ['user:access'],
        order: 2,
        isActive: true,
        status: 'enabled',
        children: [
          {
            id: 'perm_2_1',
            code: 'user-profile',
            title: '个人资料',
            url: '/user/profile',
            type: 'menu',
            icon: 'profile',
            parentId: 'perm_2',
            parentCode: 'user',
            hidden: false,
            openMode: 'currentSystemTab',
            permissions: ['user:profile'],
            order: 1,
            isActive: true,
            status: 'enabled'
          }
        ]
      }
    ];
  }

  /**
   * 获取模拟数据 - 禁用和隐藏菜单
   */
  static getStatusMockData(): MenuItem[] {
    return [
      {
        id: 'status_1',
        code: 'active-menu',
        title: '正常菜单',
        url: '/active',
        type: 'menu',
        icon: 'check',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: [],
        order: 1,
        isActive: true,
        status: 'enabled'
      },
      {
        id: 'status_2',
        code: 'disabled-menu',
        title: '禁用菜单',
        url: '/disabled',
        type: 'menu',
        icon: 'close',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: [],
        order: 2,
        isActive: true,
        status: 'disabled'
      },
      {
        id: 'status_3',
        code: 'hidden-menu',
        title: '隐藏菜单',
        url: '/hidden',
        type: 'menu',
        icon: 'eye-off',
        parentId: null,
        parentCode: null,
        hidden: true,
        openMode: 'currentSystemTab',
        permissions: [],
        order: 3,
        isActive: true,
        status: 'enabled'
      }
    ];
  }

  /**
   * 获取模拟数据 - 特殊类型菜单
   */
  static getSpecialMockData(): MenuItem[] {
    return [
      {
        id: 'special_1',
        code: 'iframe-menu',
        title: 'IFrame菜单',
        url: 'https://example.com',
        type: 'menu',
        icon: 'iframe',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'iframe',
        permissions: [],
        order: 1,
        isActive: true,
        status: 'enabled',
        showHeader: false,
        showSidebar: false,
        showFooter: false
      },
      {
        id: 'special_2',
        code: 'new-tab-menu',
        title: '新标签页菜单',
        url: 'https://google.com',
        type: 'menu',
        icon: 'external-link',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'newBrowserTab',
        isExternal: true,
        permissions: [],
        order: 2,
        isActive: true,
        status: 'enabled'
      },
      {
        id: 'special_3',
        code: 'button-menu',
        title: '按钮菜单',
        url: '#',
        type: 'button',
        icon: 'button',
        parentId: null,
        parentCode: null,
        hidden: false,
        openMode: 'currentSystemTab',
        permissions: [],
        order: 3,
        isActive: true,
        status: 'enabled'
      }
    ];
  }
}

// 导出默认实例
export const menuService = new MenuService();
