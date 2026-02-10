import { memo, useMemo, useState } from 'react';
import type { IconifyJSON } from '@iconify/react';
import { useControllableValue } from 'ahooks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@rap/components-base/tabs';
import IconSetView from './icon-set-view';
// 默认图标集（静态 import）
import { icons as carbonIcons } from '@iconify-json/carbon';
import { icons as lucideIcons } from '@iconify-json/lucide';
import { icons as riIcons } from '@iconify-json/ri';

export interface IconSet {
  prefix: string;
  icons: IconifyJSON;
}

const defaultIconSets: IconSet[] = [
  {
    prefix: 'carbon',
    icons: carbonIcons
  },
  {
    prefix: 'lucide',
    icons: lucideIcons
  },
  {
    prefix: 'ri',
    icons: riIcons
  },
];

export interface IconViewProps {
  value?: string;
  defaultValue?: string;
  iconSets?: IconSet[];
  disableDefaultIconSets?: boolean;
  onChange?: (value: string) => void;
  iconSize?: number;
  gap?: number;
  rowGap?: number;
}

function IconView(props: IconViewProps) {
  const [value, setValue] = useControllableValue(props);
  
  // 合并图标集
  const allIconSets = useMemo(() => {
    const sets = props.disableDefaultIconSets ? [] : [...defaultIconSets];
    if (props.iconSets?.length) {
      sets.push(...props.iconSets);
    }
    return sets;
  }, [props.iconSets, props.disableDefaultIconSets]);

  const [activeKey, setActiveKey] = useState(allIconSets[0]?.prefix || '');

  // 处理Tab切换
  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  return (
    <div className="size-full overflow-hidden">
      <Tabs 
        defaultValue={activeKey}
        value={activeKey}
        onValueChange={handleTabChange}
        className="h-full flex flex-col"
      >
        <TabsList className="mb-2">
          {allIconSets.map((set) => (
            <TabsTrigger key={set.prefix} value={set.prefix}>
              {set.prefix}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="flex-1 overflow-hidden">
          {allIconSets.map((set) => (
            <TabsContent key={set.prefix} value={set.prefix} className="h-full">
              <IconSetView
                iconSet={set}
                value={value}
                onChange={setValue}
                iconSize={props.iconSize}
                gap={props.gap}
                rowGap={props.rowGap}
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};

export default memo(IconView);
