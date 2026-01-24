import React from 'react';
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToHorizontalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@rap/utils';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { LayoutTabItem, TabType } from '../types';

interface SortableItemProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-tab-key': string;
}


const SortableItem = ({ children, ...props }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props['data-tab-key'],
  });

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Translate.toString(transform),
    transition,
    cursor: 'grab',
  };

  // eslint-disable-next-line @eslint-react/no-clone-element
  return React.cloneElement(
    children as React.ReactElement<any>,
    {
      ref: setNodeRef,
      style: { ...(children as React.ReactElement<any>)?.props?.style, ...style },
      ...attributes,
      ...listeners,
    }
  );
};

interface CustomSortableTabsProps {
  tabs: LayoutTabItem[];
  activeTab: LayoutTabItem | null;
  tabType: TabType;
  setTabs: Dispatch<SetStateAction<LayoutTabItem[]>>;
  children: (item: LayoutTabItem, index: number) => ReactNode;
}

export function SortableTabs({
  tabs,
  activeTab,
  tabType,
  setTabs,
  children,
}: CustomSortableTabsProps) {
  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 10 },
  });

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) {
      setTabs((prevTabs) => {
        const activeIndex = prevTabs.findIndex((tab) => tab.id === active.id);
        const overIndex = prevTabs.findIndex((tab) => tab.id === over?.id);
        return arrayMove(prevTabs, activeIndex, overIndex);
      });
    }
  };

  const itemIds = tabs.map((tab) => tab.id);

  return (
    <DndContext
      sensors={[sensor]}
      onDragEnd={onDragEnd}
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
    >
      <SortableContext
        items={itemIds}
        strategy={horizontalListSortingStrategy}
      >
        <div
          className={cn("size-full flex items-center ", {
            "gap-2": tabType === "card",
          })}
        >
          {tabs.map((item, index) =>
            item.pinned ? (
              <div
                key={item.id}
                data-tab-key={item.id}
                className={cn(
                  "group relative layout-tabs-tab-item flex items-center h-full w-fit max-w-45",
                  {
                    active: activeTab?.id === item.id,
                    [`layout-tabs-${tabType}-tab-item`]: true,
                  }
                )}
                role="tab"
                tabIndex={index}
              >
                {children(item, index)}
              </div>
            ) : (
              <SortableItem
                key={item.id}
                data-tab-key={item.id}
              >
                <div
                  className={cn(
                    "group relative layout-tabs-tab-item flex items-center h-full w-fit max-w-45",
                    {
                      active: activeTab?.id === item.id,
                      [`layout-tabs-${tabType}-tab-item`]: true,
                    }
                  )}
                  role="tab"
                  tabIndex={index}
                >
                  {children(item, index)}
                </div>
              </SortableItem>
            )
          )}
        </div>
      </SortableContext>
    </DndContext>
  );
}