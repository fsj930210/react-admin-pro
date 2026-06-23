import { Listbox, ListboxItem } from "@rap/components-ui/listbox";
import { cn } from "@rap/utils";
import type { SelectValue } from "@rap/components-pro/select";
import type { ReactNode } from "react";
import type { AutoCompleteOption, AutoCompleteOptionRenderInfo } from "./types";
import { buildOptionKey } from "./utils";

interface AutoCompleteOptionListProps<V extends SelectValue> {
  options: AutoCompleteOption<V>[];
  activeOptionKey?: string;
  loading?: boolean;
  loadingContent?: ReactNode;
  notFoundContent?: ReactNode;
  optionRender?: (
    option: AutoCompleteOption<V>,
    info: AutoCompleteOptionRenderInfo<V>
  ) => ReactNode;
  onOptionSelect: (option: AutoCompleteOption<V>) => void;
  onActiveOptionChange: (optionKey: string) => void;
}

export function AutoCompleteOptionList<V extends SelectValue>({
  options,
  activeOptionKey,
  loading,
  loadingContent = "Loading",
  notFoundContent = "No results",
  optionRender,
  onOptionSelect,
  onActiveOptionChange,
}: AutoCompleteOptionListProps<V>) {
  if (loading) {
    return <div className="px-3 py-5 text-sm text-muted-foreground">{loadingContent}</div>;
  }

  if (!options.length) {
    return <div className="px-3 py-5 text-sm text-muted-foreground">{notFoundContent}</div>;
  }

  return (
    <div className="max-h-80 overflow-auto pr-2">
      <Listbox value={activeOptionKey ?? ""} className="space-y-1">
        {options.map((option) => {
          const optionKey = buildOptionKey(option.value);
          const active = optionKey === activeOptionKey;

          return (
            <ListboxItem
              key={optionKey}
              value={optionKey}
              disabled={option.disabled}
              className={cn(
                "cursor-pointer rounded-xl border border-transparent px-3 py-2.5 text-sm ring-0",
                "data-highlighted:border-border data-highlighted:bg-accent data-highlighted:text-accent-foreground",
                active && "border-border bg-accent text-accent-foreground"
              )}
              onMouseDown={(event) => {
                event.preventDefault();
              }}
              onMouseEnter={() => onActiveOptionChange(optionKey)}
              onSelect={() => onOptionSelect(option)}
            >
              <div className="min-w-0 flex-1">
                {optionRender ? optionRender(option, { active, option }) : option.label}
              </div>
            </ListboxItem>
          );
        })}
      </Listbox>
    </div>
  );
}
