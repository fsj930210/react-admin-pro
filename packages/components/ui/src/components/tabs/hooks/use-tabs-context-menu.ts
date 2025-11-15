import { useState, useEffect } from 'react';
import type { LayoutTabItem } from '../types';

interface UseTabsContextMenuProps {
  initialTabs?: LayoutTabItem[];
  initialSelectedTab?: string;
}

export function useTabsContextMenu({
  initialTabs = [],
  initialSelectedTab = initialTabs[0]?.value || ''
}: UseTabsContextMenuProps = {}) {
  const [selectedTab, setSelectedTab] = useState<string>(initialSelectedTab);
  const [tabs, setTabs] = useState<LayoutTabItem[]>(initialTabs);

  // 初始化时将固定标签页排序到前面
  useEffect(() => {
    if (initialTabs.length > 0) {
      const sortedTabs = [...initialTabs].sort((a, b) => {
        if (a.fixed && !b.fixed) return -1;
        if (!a.fixed && b.fixed) return 1;
        return 0;
      });
      setTabs(sortedTabs);
    }
  }, []);

  // 处理标签页排序
  const handleTabsSort = (newTabs: LayoutTabItem[]) => {
    // 将固定标签页始终放在前面
    const fixedTabs = newTabs.filter(tab => tab.fixed);
    const nonFixedTabs = newTabs.filter(tab => !tab.fixed);
    const sortedTabs = [...fixedTabs, ...nonFixedTabs];
    setTabs(sortedTabs);
  };
  
  // 处理tab点击
  const handleTabClick = (tabValue: string) => {
    setSelectedTab(tabValue);
  };
  
  // 关闭当前标签页
  const handleCloseTab = (tabValue: string) => {
    // 找到要关闭的标签页索引
    const tabIndex = tabs.findIndex(tab => tab.value === tabValue);
    
    // 如果是最后一个标签页，不允许关闭
    if (tabs.length <= 1) return;
    
    // 如果关闭的是当前选中的标签页，选择下一个或上一个标签页
    if (selectedTab === tabValue) {
      const nextTabIndex = tabIndex < tabs.length - 1 ? tabIndex : tabIndex - 1;
      setSelectedTab(tabs[nextTabIndex].value);
    }
    
    // 移除标签页
    setTabs(tabs.filter(tab => tab.value !== tabValue));
  };
  
  // 固定/取消固定标签页
  const handlePinTab = (tabValue: string) => {
    const tabToPin = tabs.find(tab => tab.value === tabValue);
    if (!tabToPin) return;

    const newTabs = tabs.filter(tab => tab.value !== tabValue);
    const isPinning = !tabToPin.fixed;

    if (isPinning) {
      // 固定标签页：添加到固定标签页列表的前面
      const fixedTabs = newTabs.filter(tab => tab.fixed);
      const nonFixedTabs = newTabs.filter(tab => !tab.fixed);
      setTabs([{ ...tabToPin, fixed: true }, ...fixedTabs, ...nonFixedTabs]);
    } else {
      // 取消固定标签页：添加到非固定标签页列表的后面
      const fixedTabs = newTabs.filter(tab => tab.fixed);
      const nonFixedTabs = newTabs.filter(tab => !tab.fixed);
      setTabs([...fixedTabs, ...nonFixedTabs, { ...tabToPin, fixed: false }]);
    }
  };
  
  // 关闭左侧标签页
  const handleCloseLeftTabs = (tabValue: string) => {
    const currentIndex = tabs.findIndex(tab => tab.value === tabValue);
    
    // 只关闭非固定的标签页
    const newTabs = tabs.filter((tab, index) => 
      index >= currentIndex || tab.fixed
    );
    
    setTabs(newTabs);
    
    // 如果当前选中的标签页被关闭，选择当前标签页
    if (!newTabs.some(tab => tab.value === selectedTab)) {
      setSelectedTab(tabValue);
    }
  };
  
  // 关闭右侧标签页
  const handleCloseRightTabs = (tabValue: string) => {
    const currentIndex = tabs.findIndex(tab => tab.value === tabValue);
    
    // 只关闭非固定的标签页
    const newTabs = tabs.filter((tab, index) => 
      index <= currentIndex || tab.fixed
    );
    
    setTabs(newTabs);
    
    // 如果当前选中的标签页被关闭，选择当前标签页
    if (!newTabs.some(tab => tab.value === selectedTab)) {
      setSelectedTab(tabValue);
    }
  };
  
  // 关闭其他标签页
  const handleCloseOtherTabs = (tabValue: string) => {
    // 只保留当前标签页和固定的标签页
    const newTabs = tabs.filter(tab => 
      tab.value === tabValue || tab.fixed
    );
    
    setTabs(newTabs);
    setSelectedTab(tabValue);
  };
  
  // 重新加载标签页
  const handleReloadTab = (tabValue: string) => {
    console.log(`重新加载标签页: ${tabValue}`);
    // 实际项目中可以在这里添加重新加载的逻辑
  };
  
  // 在新标签页中打开
  const handleOpenInNewTab = (tabValue: string) => {
    const tab = tabs.find(t => t.value === tabValue);
    if (tab?.url) {
      window.open(tab.url, '_blank');
    } else {
      console.log(`在新标签页中打开: ${tabValue}`);
      // 实际项目中可以在这里添加打开新标签页的逻辑
    }
  };
  
  // 最大化标签页
  const handleMaximize = (tabValue: string) => {
    console.log(`最大化标签页: ${tabValue}`);
    // 实际项目中可以在这里添加最大化的逻辑
  };

  return {
    tabs,
    selectedTab,
    setTabs,
    setSelectedTab,
    handleTabClick,
    handleCloseTab,
    handlePinTab,
    handleCloseLeftTabs,
    handleCloseRightTabs,
    handleCloseOtherTabs,
    handleReloadTab,
    handleOpenInNewTab,
    handleMaximize,
    handleTabsSort
  };
}
