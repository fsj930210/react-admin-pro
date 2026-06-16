import { useRef, type ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Check } from "lucide-react";
import { Listbox, ListboxGroup, ListboxGroupLabel, ListboxItem } from "@rap/components-ui/listbox";
import { cn } from "@rap/utils";
import type { SelectOption, SelectOptionRenderInfo, SelectRow, SelectValue } from "./types";
import * as React from "react";

interface SelectOptionListProps<V extends SelectValue> {
  rows: SelectRow<V>[];
  activeOptionKey?: string;
  selectedKeys: string[];
  multiple: boolean;
  virtual?: boolean;
  listHeight?: number;
  itemHeight?: number;
  overscan?: number;
  optionRender?: (option: SelectOption<V>, info: SelectOptionRenderInfo<V>) => React.ReactNode;
  onOptionSelect: (optionKey: string) => void;
  onActiveOptionChange: (optionKey: string) => void;
}

function SelectOptionRow<V extends SelectValue>({
  row,
  activeOptionKey,
  selectedKeys,
  optionRender,
  onOptionSelect,
  onActiveOptionChange,
}: {
  row: SelectRow<V>;
  activeOptionKey?: string;
  selectedKeys: string[];
  optionRender?: (option: SelectOption<V>, info: SelectOptionRenderInfo<V>) => React.ReactNode;
  onOptionSelect: (optionKey: string) => void;
  onActiveOptionChange: (optionKey: string) => void;
}) {
  if (row.type === "group") {
    return (
      <div className="px-3 py-1 text-xs font-medium tracking-[0.12em] text-muted-foreground uppercase">
        {row.label}
      </div>
    );
  }

  const selected = selectedKeys.includes(row.optionKey);
  const active = row.optionKey === activeOptionKey;

  return (
    <ListboxItem
      value={row.optionKey}
      disabled={row.option.disabled}
      className={cn(
        "cursor-pointer rounded-xl border border-transparent px-3 py-2.5 text-sm ring-0",
        "data-highlighted:border-border data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        active && "border-border bg-accent text-accent-foreground",
        selected && "border-border bg-accent text-accent-foreground"
      )}
      onMouseEnter={() => onActiveOptionChange(row.optionKey)}
      onSelect={() => onOptionSelect(row.optionKey)}
    >
      <div className="min-w-0 flex-1">
        {optionRender
          ? optionRender(row.option, { selected, active, option: row.option })
          : row.option.label}
      </div>
      <span
        className={cn(
          "flex size-4 items-center justify-center text-primary transition-opacity",
          selected ? "opacity-100" : "opacity-0"
        )}
      >
        <Check className={cn("size-4", selected ? "opacity-100" : "opacity-0")} />
      </span>
    </ListboxItem>
  );
}

export function SelectOptionList<V extends SelectValue>({
  rows,
  activeOptionKey,
  selectedKeys,
  multiple,
  virtual = false,
  listHeight = 320,
  itemHeight = 40,
  overscan = 6,
  optionRender,
  onOptionSelect,
  onActiveOptionChange,
}: SelectOptionListProps<V>) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: virtual ? rows.length : 0,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => (rows[index]?.type === "group" ? 28 : itemHeight),
    overscan,
  });

  if (virtual) {
    const virtualRows = virtualizer.getVirtualItems();
    return (
      <div ref={scrollRef} className="overflow-auto pr-2" style={{ height: listHeight }}>
        <Listbox
          multiple={multiple}
          value={multiple ? selectedKeys : (selectedKeys[0] ?? "")}
          className="relative gap-0"
        >
          <div style={{ position: "relative", height: virtualizer.getTotalSize() }}>
            {virtualRows.map((virtualRow) => {
              const row = rows[virtualRow.index];
              if (!row) return null;
              return (
                <div
                  key={row.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <SelectOptionRow
                    row={row}
                    activeOptionKey={activeOptionKey}
                    selectedKeys={selectedKeys}
                    optionRender={optionRender}
                    onOptionSelect={onOptionSelect}
                    onActiveOptionChange={onActiveOptionChange}
                  />
                </div>
              );
            })}
          </div>
        </Listbox>
      </div>
    );
  }

  const content: React.ReactNode[] = [];
  let cursor = 0;
  while (cursor < rows.length) {
    const row = rows[cursor];
    if (!row) break;

    if (row.type === "group") {
      const groupOptions: SelectRow<V>[] = [];
      cursor += 1;

      while (cursor < rows.length && rows[cursor]?.type !== "group") {
        groupOptions.push(rows[cursor] as SelectRow<V>);
        cursor += 1;
      }

      content.push(
        <ListboxGroup key={row.key} className="space-y-1 gap-1">
          <ListboxGroupLabel className="px-3 py-1 text-xs font-medium tracking-[0.12em] uppercase">
            {row.label}
          </ListboxGroupLabel>
          {groupOptions.map((optionRow) => (
            <SelectOptionRow
              key={optionRow.key}
              row={optionRow}
              activeOptionKey={activeOptionKey}
              selectedKeys={selectedKeys}
              optionRender={optionRender}
              onOptionSelect={onOptionSelect}
              onActiveOptionChange={onActiveOptionChange}
            />
          ))}
        </ListboxGroup>
      );
      continue;
    }

    const standaloneRows: SelectRow<V>[] = [];
    while (cursor < rows.length && rows[cursor]?.type === "option") {
      standaloneRows.push(rows[cursor] as SelectRow<V>);
      cursor += 1;
    }

    content.push(
      <div key={`standalone:${row.key}`} className="space-y-1">
        {standaloneRows.map((optionRow) => (
          <SelectOptionRow
            key={optionRow.key}
            row={optionRow}
            activeOptionKey={activeOptionKey}
            selectedKeys={selectedKeys}
            optionRender={optionRender}
            onOptionSelect={onOptionSelect}
            onActiveOptionChange={onActiveOptionChange}
          />
        ))}
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="max-h-80 overflow-auto pr-2">
      <Listbox
        multiple={multiple}
        value={multiple ? selectedKeys : (selectedKeys[0] ?? "")}
        className="space-y-3"
      >
        {content}
      </Listbox>
    </div>
  );
}
