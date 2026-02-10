import { memo, useMemo, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import type { IconifyJSON } from '@iconify/react';
import Icon from './index';
import { Input } from '@rap/components-base/input';
import { getIconNames } from './utils/getIconNames';

export interface IconSetViewProps {
  iconSet: {
    prefix: string;
    icons: IconifyJSON;
  };
  value?: string;
  onChange?: (value: string) => void;
  iconSize?: number;
  gap?: number;
  rowGap?: number;
}

function IconSetView(props: IconSetViewProps) {
  const { 
    iconSet, 
    value, 
    onChange, 
    iconSize = 32, 
    gap = 8, 
    rowGap = 4 
  } = props;
  
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchKeyword, setSearchKeyword] = useState('');

  // 获取图标名称列表
  const iconNames = useMemo(() => {
    return getIconNames(iconSet.icons).iconNames.map((nameItem) => ({
      ...nameItem,
      active: `${iconSet.prefix}:${nameItem.name}` === value,
    }));
  }, [iconSet, value]);

  // 搜索过滤
  const filteredIcons = useMemo(() => {
    if (!searchKeyword) return iconNames;
    const keyword = searchKeyword.toLowerCase();
    return iconNames.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [iconNames, searchKeyword]);

  // 布局计算
  const containerWidth = containerRef.current?.clientWidth || 300;
  const cols = Math.max(Math.floor(containerWidth / (iconSize + gap)), 1);

  // 分组图标为行
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < filteredIcons.length; i += cols) {
      result.push(filteredIcons.slice(i, i + cols));
    }
    return result;
  }, [filteredIcons, cols]);

  // 虚拟滚动
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => listRef.current,
    estimateSize: () => iconSize + rowGap * 2,
    overscan: 5,
  });

  // 处理搜索
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchKeyword(e.target.value);
  };

  // 处理图标点击
  const handleIconClick = (iconName: string) => {
    onChange?.(`${iconSet.prefix}:${iconName}`);
  };

  return (
    <div className="flex h-full flex-col" ref={containerRef}>
      <div className="mb-2">
        <Input
          type="text"
          placeholder="搜索图标"
          value={searchKeyword}
          onChange={handleSearch}
          className="w-full"
        />
      </div>
      <div 
        ref={listRef} 
        className="flex-1 overflow-auto"
        style={{ 
          height: '100%',
          position: 'relative'
        }}
      >
        {rows.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            未找到图标
          </div>
        ) : (
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => (
              <div
                key={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="flex flex-wrap gap-2 p-2"
              >
                {rows[virtualRow.index].map((item) => (
                  <div
                    key={item.name}
                    onClick={() => handleIconClick(item.name)}
                    title={`${iconSet.prefix}:${item.name}`}
                    className={`flex items-center justify-center p-1 rounded-md transition-colors ${item.active ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                    style={{ width: iconSize, height: iconSize }}
                  >
                    <Icon 
                      icon={`${iconSet.prefix}:${item.name}`} 
                      width={iconSize} 
                      height={iconSize} 
                    />
                  </div>
                ))}
                {Array.from({ length: cols - rows[virtualRow.index].length }).map((_, i) => (
                  <div 
                    key={`empty-${i}`} 
                    className="invisible" 
                    style={{ width: iconSize, height: iconSize }}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(IconSetView);
