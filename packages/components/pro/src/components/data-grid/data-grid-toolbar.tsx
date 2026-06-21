import { Button } from "@rap/components-ui/button";
import { Input } from "@rap/components-pro/input";
import { Search } from "lucide-react";
import { useRef, useState } from "react";
import type { DataGridToolbarConfig } from "./types";

export function DataGridToolbar({
  config,
  onSearch,
  onReset,
}: {
  config: DataGridToolbarConfig;
  onSearch: (params: Record<string, unknown>) => void;
  onReset: () => void;
}) {
  const search = config.search || undefined;
  const [value, setValue] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  function submit(nextValue = value) {
    if (!search || search.type === "custom") return;
    onSearch(nextValue ? { [search.searchKey]: nextValue } : {});
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        {config.buttons?.map((item) => {
          if (item.type === "custom") return <div key={item.key}>{item.render()}</div>;
          const { key, type: _type, ...buttonProps } = item;
          return <Button key={key} {...buttonProps} />;
        })}
      </div>
      <div className="ml-auto min-w-64">
        {search?.type === "custom" ? (
          search.render({ search: (params = {}) => onSearch(params), reset: onReset })
        ) : search ? (
          <Input
            value={value}
            placeholder={search.placeholder}
            allowClear={search.allowClear ?? true}
            prefix={<Search className="size-4" />}
            onChange={(nextValue) => {
              const text = String(nextValue ?? "");
              setValue(text);
              if (search.trigger !== "change") return;
              clearTimeout(timerRef.current);
              timerRef.current = setTimeout(() => submit(text), search.debounceTime ?? 300);
            }}
            onClear={() => {
              setValue("");
              submit("");
            }}
            onPressEnter={() => submit()}
          />
        ) : null}
      </div>
    </div>
  );
}
