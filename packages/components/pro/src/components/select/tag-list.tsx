import React, { type ReactNode } from "react";
import { X } from "lucide-react";
import { Badge } from "@rap/components-ui/badge";
import { Button } from "@rap/components-ui/button";
import type { SelectOption, SelectTagRenderInfo, SelectValue } from "./types";

interface SelectTagListProps<V extends SelectValue> {
  options: SelectOption<V>[];
  values: V[];
  maxTagCount?: number | "responsive";
  maxTagPlaceholder?: ReactNode | ((omitted: SelectOption<V>[]) => ReactNode);
  tagRender?: (info: SelectTagRenderInfo<V>) => React.ReactNode;
  onRemove: (option: SelectOption<V>) => void;
}

export function SelectTagList<V extends SelectValue>({
  options,
  values,
  maxTagCount,
  maxTagPlaceholder = (omitted) => `+${omitted.length}`,
  tagRender,
  onRemove,
}: SelectTagListProps<V>) {
  if (!values.length) return null;

  const limit = typeof maxTagCount === "number" ? Math.max(0, maxTagCount) : options.length;
  const visibleOptions = options.slice(0, limit);
  const omittedOptions = options.slice(limit);

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-1.5">
      {visibleOptions.map((option) => {
        const handleClose = () => onRemove(option);

        if (tagRender) {
          return (
            <React.Fragment key={`${typeof option.value}:${String(option.value)}`}>
              {tagRender({ option, onClose: handleClose })}
            </React.Fragment>
          );
        }

        return (
          <Badge
            key={`${typeof option.value}:${String(option.value)}`}
            variant="outline"
            className="gap-1 rounded-md border-border/60 bg-muted px-2 py-1 text-xs text-foreground shadow-none"
          >
            <span className="max-w-24 truncate">{option.label}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="size-5 cursor-pointer rounded-sm bg-transparent p-0 text-muted-foreground shadow-none hover:bg-transparent hover:text-foreground"
              onMouseDown={(event) => event.preventDefault()}
              onClick={(event) => {
                event.stopPropagation();
                handleClose();
              }}
            >
              <X className="size-3.5" />
            </Button>
          </Badge>
        );
      })}
      {omittedOptions.length ? (
        <Badge
          variant="outline"
          className="rounded-md border-border/60 bg-muted px-2 py-1 text-xs text-muted-foreground shadow-none"
        >
          {typeof maxTagPlaceholder === "function"
            ? maxTagPlaceholder(omittedOptions)
            : maxTagPlaceholder}
        </Badge>
      ) : null}
    </div>
  );
}
