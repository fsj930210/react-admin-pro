import { useEffect, useState } from 'react';
import { useLocation } from '@tanstack/react-router';

import { Content } from './shared/content';
import { Header } from './shared/header';
import AppLogo from '@/components/app/AppLogo';

import type { MenuItem } from '@/types/menu';

import { getAncestorLevelKey } from '@/layouts/utils/utils';
import useMenuStoreSelector from '@/store/menu';

const MixDoubleColumnLayout = () => {
  const location = useLocation();
  const { menuItems, flatMenuItems } = useMenuStoreSelector([
    'menuItems',
    'flatMenuItems',
  ]);
  const [firstLevelMenuSelectedKeys, setFirstLevelMenuSelectedKeys] = useState<
    string[]
  >([]);
  const [secondLevelMenuSelectedKeys, setSecondLevelMenuSelectedKeys] =
    useState<string[]>([]);
  const [secondLevelMenuItems, setSecondLevelMenuItems] = useState<MenuItem[]>(
    [],
  );
  const [thirdLevelMenuItems, setThirdLevelMenuItems] = useState<MenuItem[]>(
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
      const length = ancestorLevelKeys.length;
      const firstLevelMenuSelectedKeys =
        length > 0 ? [ancestorLevelKeys[0]] : [selectedItem.key];
      const secondLevelMenuSelectedKeys =
        length > 0
          ? length > 1
            ? [ancestorLevelKeys[1]]
            : [selectedItem.key]
          : [];
      setFirstLevelMenuSelectedKeys(firstLevelMenuSelectedKeys);
      setSecondLevelMenuSelectedKeys(secondLevelMenuSelectedKeys);
      const firstLevelMenuItem = flatMenuItems[ancestorLevelKeys[0]];
      if (firstLevelMenuItem?.children) {
        const secondLevelItem = flatMenuItems[secondLevelMenuSelectedKeys[0]];
        if (secondLevelItem?.children) {
          setThirdLevelMenuItems(secondLevelItem.children);
        } else {
          setThirdLevelMenuItems([]);
        }
        setSecondLevelMenuItems(
          firstLevelMenuItem.children.map((i) => ({
            ...i,
            children: undefined,
          })),
        );
      } else {
        setSecondLevelMenuItems([]);
        setThirdLevelMenuItems([]);
      }
    }
  }, [location.pathname, flatMenuItems]);

  return (
    <div className="flex h-full bg-zinc-50 dark:bg-zinc-950">
      {/* 第二列菜单 */}
      {secondLevelMenuItems.length > 0 && (
        <div className="w-16 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
          <div className="p-3 flex items-center justify-center">
            <AppLogo showTitle={false} />
          </div>
          <nav className="flex-1 overflow-y-auto p-2">
            {secondLevelMenuItems.map((item) => (
              <button
                key={item.key}
                className={`flex items-center justify-center p-3 transition-colors ${secondLevelMenuSelectedKeys.includes(item.key) ? 'bg-zinc-100 dark:bg-zinc-800 text-primary dark:text-primary' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                onClick={() => {
                  const menuItem = flatMenuItems[item.key];
                  if (!menuItem) {
                    setThirdLevelMenuItems([]);
                    return;
                  }
                  if (!menuItem.children || menuItem.children.length === 0) {
                    setThirdLevelMenuItems([]);
                    return;
                  }
                  setThirdLevelMenuItems(menuItem?.children || []);
                }}
              >
                {item.icon}
              </button>
            ))}
          </nav>
        </div>
      )}

      {/* 第三列菜单 */}
      {thirdLevelMenuItems.length > 0 && (
        <div className="w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 overflow-y-auto">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              三级菜单
            </h3>
          </div>
          <nav className="p-2">
            {thirdLevelMenuItems.map((item) => (
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
          Logo={secondLevelMenuItems.length <= 0 ? <AppLogo /> : null}
          desktopItems={
            <nav className="flex items-center space-x-4">
              {firstLevelMenuItems.map((item) => (
                <button
                  key={item.key}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${firstLevelMenuSelectedKeys.includes(item.key) ? 'bg-zinc-100 dark:bg-zinc-800 text-primary dark:text-primary' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                  onClick={() => {
                    const menuItem = flatMenuItems[item.key];
                    if (!menuItem) return;
                    if (!menuItem.children) return;
                    const secondLevelMenuItems = (menuItem?.children || []).map(
                      (menuItem) => {
                        return {
                          ...menuItem,
                          children: undefined,
                        };
                      },
                    );
                    setSecondLevelMenuItems(secondLevelMenuItems);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          }
          mobileItems={() => (
            <nav className="flex flex-col space-y-2 py-2">
              {firstLevelMenuItems.map((item) => (
                <button
                  key={item.key}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${firstLevelMenuSelectedKeys.includes(item.key) ? 'bg-zinc-100 dark:bg-zinc-800 text-primary dark:text-primary' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                  onClick={() => {
                    const menuItem = flatMenuItems[item.key];
                    if (!menuItem) return;
                    if (!menuItem.children) return;
                    const secondLevelMenuItems = (menuItem?.children || []).map(
                      (menuItem) => {
                        return {
                          ...menuItem,
                          children: undefined,
                        };
                      },
                    );
                    setSecondLevelMenuItems(secondLevelMenuItems);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}
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

export default MixDoubleColumnLayout;