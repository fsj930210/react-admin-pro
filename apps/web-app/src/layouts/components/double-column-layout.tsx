import { useEffect, useState } from 'react';
import { useLocation } from '@tanstack/react-router';

import { Content } from './shared/content';
import { Header } from './shared/header';
import AppLogo from '@/components/app/AppLogo';

import type { MenuItem } from '@/types/menu';

import { getAncestorLevelKey } from '@/layouts/utils/utils';
import useMenuStoreSelector from '@/store/menu';

const DoubleColumnLayout = () => {
  const location = useLocation();
  const { menuItems, flatMenuItems } = useMenuStoreSelector([
    'menuItems',
    'flatMenuItems',
  ]);
  const [firstLevelMenuSelectedKeys, setFirstLevelMenuSelectedKeys] = useState<
    string[]
  >([]);
  const [secondLevelMenuItems, setSecondLevelMenuItems] = useState<MenuItem[]>(
    [],
  );
  const firstLevelMenuItems = menuItems.map((item) => {
    return {
      ...item,
      children: undefined,
    };
  });

  useEffect(() => {
    const selectedItem = flatMenuItems[location.pathname];
    if (selectedItem) {
      const ancestorLevelKeys: string[] = [];
      getAncestorLevelKey(selectedItem, flatMenuItems, ancestorLevelKeys);
      setFirstLevelMenuSelectedKeys(
        ancestorLevelKeys.length > 0
          ? [ancestorLevelKeys[0]]
          : [selectedItem.key],
      );
      const firstLevelMenuItem = flatMenuItems[ancestorLevelKeys[0]];
      if (firstLevelMenuItem?.children) {
        setSecondLevelMenuItems(firstLevelMenuItem.children);
      } else {
        setSecondLevelMenuItems([]);
      }
    }
  }, [location.pathname, flatMenuItems]);

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-950">
      {/* 第一列菜单 */}
      <div className="w-16 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
        {firstLevelMenuItems.map((item) => (
          <button
            key={item.key}
            className={`flex items-center justify-center p-3 transition-colors ${firstLevelMenuSelectedKeys.includes(item.key) ? 'bg-zinc-100 dark:bg-zinc-800 text-primary dark:text-primary' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
            onClick={() => {
              const menuItem = flatMenuItems[item.key];
              if (!menuItem) return;
              setFirstLevelMenuSelectedKeys([item.key]);
              if (menuItem.children) {
                setSecondLevelMenuItems(menuItem.children);
              } else {
                setSecondLevelMenuItems([]);
              }
            }}
          >
            {item.icon}
          </button>
        ))}
      </div>
      
      {/* 第二列菜单 */}
      {secondLevelMenuItems.length > 0 && (
        <div className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              二级菜单
            </h3>
          </div>
          <nav className="p-2">
            {secondLevelMenuItems.map((item) => (
              <button
                key={item.key}
                className="w-full text-left px-3 py-2 text-sm rounded-md transition-colors text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => {
                  // 处理菜单点击
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      )}
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          Logo={<AppLogo />}
          desktopItems={null}
          mobileItems={() => null}
        />
        <Content>
          <div className="h-full">
            {/* 页面内容将通过路由渲染到这里 */}
          </div>
        </Content>
      </div>
    </div>
  );
};

export default DoubleColumnLayout;