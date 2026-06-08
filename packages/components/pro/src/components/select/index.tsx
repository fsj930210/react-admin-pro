import * as React from "react";
import { ChevronRight, Search } from "lucide-react";
import { Input } from "@rap/components-ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@rap/components-ui/popover";
import { Checkbox } from "@rap/components-ui/checkbox";
import { ProButton } from "../button";
import { cn } from "@rap/utils";

export interface ProOption<V = string> {
  label: React.ReactNode;
  value: V;
  disabled?: boolean;
  children?: ProOption<V>[];
  isLeaf?: boolean;
  raw?: unknown;
}

export interface RemoteSelectProps<T = unknown, V = string> {
  value?: V | null;
  onChange?: (value: V | null, option?: ProOption<V>) => void;
  request: (keyword: string) => Promise<T[]>;
  transformOptions?: (items: T[]) => ProOption<V>[];
  placeholder?: string;
  debounce?: number;
  className?: string;
  renderOption?: (option: ProOption<V>) => React.ReactNode;
}

export function RemoteSelect<T = unknown, V = string>({
  value,
  onChange,
  request,
  transformOptions,
  placeholder = "请选择",
  debounce = 300,
  className,
  renderOption,
}: RemoteSelectProps<T, V>) {
  const [open, setOpen] = React.useState(false);
  const [keyword, setKeyword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [options, setOptions] = React.useState<ProOption<V>[]>([]);
  const selected = options.find((option) => Object.is(option.value, value));

  React.useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      setLoading(true);
      void request(keyword)
        .then((items) =>
          setOptions(transformOptions ? transformOptions(items) : (items as ProOption<V>[]))
        )
        .finally(() => setLoading(false));
    }, debounce);
    return () => window.clearTimeout(timer);
  }, [debounce, keyword, open, request, transformOptions]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ProButton
          variant="outline"
          className={cn(
            "w-full justify-start font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          {selected?.label ?? placeholder}
        </ProButton>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-2" align="start">
        <div className="relative">
          <Search className="-translate-y-1/2 absolute top-1/2 left-2 size-4 text-muted-foreground" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            className="pl-8"
            placeholder="搜索"
          />
        </div>
        <div className="mt-2 max-h-64 overflow-auto">
          {loading ? <div className="p-3 text-muted-foreground text-sm">加载中...</div> : null}
          {!loading && options.length === 0 ? (
            <div className="p-3 text-muted-foreground text-sm">暂无数据</div>
          ) : null}
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              disabled={option.disabled}
              className="flex w-full items-center rounded px-2 py-2 text-left text-sm hover:bg-accent disabled:opacity-50"
              onClick={() => {
                onChange?.(option.value, option);
                setOpen(false);
              }}
            >
              {renderOption ? renderOption(option) : option.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export interface CascaderProps<V = string> {
  value?: V[];
  onChange?: (value: V[], options: ProOption<V>[]) => void;
  options?: ProOption<V>[];
  loadChildren?: (option: ProOption<V>) => Promise<ProOption<V>[]>;
  placeholder?: string;
  changeOnSelect?: boolean;
  className?: string;
}

export function Cascader<V = string>({
  value: _value = [],
  onChange,
  options = [],
  loadChildren,
  placeholder = "请选择",
  changeOnSelect,
  className,
}: CascaderProps<V>) {
  const [tree, setTree] = React.useState(options);
  const [activePath, setActivePath] = React.useState<ProOption<V>[]>([]);
  React.useEffect(() => setTree(options), [options]);
  const columns = React.useMemo(() => {
    const result: ProOption<V>[][] = [tree];
    let nodes = tree;
    for (const selected of activePath) {
      const node = nodes.find((item) => Object.is(item.value, selected.value));
      if (node?.children?.length) {
        result.push(node.children);
        nodes = node.children;
      }
    }
    return result;
  }, [activePath, tree]);
  const label = activePath.map((item) => item.label).join(" / ");

  const updateNodeChildren = (
    nodes: ProOption<V>[],
    target: ProOption<V>,
    children: ProOption<V>[]
  ): ProOption<V>[] =>
    nodes.map((node) =>
      Object.is(node.value, target.value)
        ? { ...node, children }
        : {
            ...node,
            children: node.children
              ? updateNodeChildren(node.children, target, children)
              : undefined,
          }
    );

  const selectOption = async (option: ProOption<V>, level: number) => {
    let next = [...activePath.slice(0, level), option];
    if (loadChildren && !option.children && !option.isLeaf) {
      const children = await loadChildren(option);
      setTree((current) => updateNodeChildren(current, option, children));
      option = { ...option, children };
      next = [...activePath.slice(0, level), option];
    }
    setActivePath(next);
    if (changeOnSelect || option.isLeaf || !option.children?.length) {
      onChange?.(
        next.map((item) => item.value),
        next
      );
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <ProButton
          variant="outline"
          className={cn(
            "w-full justify-start font-normal",
            !label && "text-muted-foreground",
            className
          )}
        >
          {label || placeholder}
        </ProButton>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto p-0" align="start">
        {columns.map((items, level) => (
          <div key={level} className="max-h-72 min-w-44 overflow-auto border-r p-1 last:border-r-0">
            {items.map((item) => (
              <button
                key={String(item.value)}
                type="button"
                className="flex w-full items-center justify-between rounded px-2 py-2 text-left text-sm hover:bg-accent"
                onClick={() => void selectOption(item, level)}
              >
                <span>{item.label}</span>
                {item.children || !item.isLeaf ? (
                  <ChevronRight className="size-4 text-muted-foreground" />
                ) : null}
              </button>
            ))}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export interface TreeSearchResult<V = string> extends ProOption<V> {
  path?: ProOption<V>[];
}

export interface TreeSelectProps<V = string> {
  value?: V | V[] | null;
  onChange?: (value: V | V[] | null, option?: ProOption<V>) => void;
  treeData?: ProOption<V>[];
  loadChildren?: (node: ProOption<V>) => Promise<ProOption<V>[]>;
  searchMode?: "local" | "remote";
  onSearch?: (keyword: string) => Promise<TreeSearchResult<V>[]>;
  loadPath?: (target: TreeSearchResult<V>) => Promise<ProOption<V>[]>;
  checkable?: boolean;
  placeholder?: string;
  className?: string;
}

function flattenTree<V>(nodes: ProOption<V>[], keyword = ""): ProOption<V>[] {
  const result: ProOption<V>[] = [];
  const visit = (items: ProOption<V>[]) => {
    for (const item of items) {
      if (!keyword || String(item.label).includes(keyword)) result.push(item);
      if (item.children) visit(item.children);
    }
  };
  visit(nodes);
  return result;
}

export function TreeSelect<V = string>({
  value,
  onChange,
  treeData = [],
  searchMode = "local",
  onSearch,
  loadPath,
  checkable,
  placeholder = "请选择",
  className,
}: TreeSelectProps<V>) {
  const [open, setOpen] = React.useState(false);
  const [keyword, setKeyword] = React.useState("");
  const [remoteOptions, setRemoteOptions] = React.useState<TreeSearchResult<V>[]>([]);
  const isMultiple = Array.isArray(value);
  const values = new Set(Array.isArray(value) ? value : value == null ? [] : [value]);

  React.useEffect(() => {
    if (!open || searchMode !== "remote" || !onSearch) return;
    const timer = window.setTimeout(() => {
      void onSearch(keyword).then(setRemoteOptions);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [keyword, onSearch, open, searchMode]);

  const localOptions = React.useMemo(() => flattenTree(treeData, keyword), [keyword, treeData]);
  const options = searchMode === "remote" ? remoteOptions : localOptions;
  const currentLabel = options.find((item) => values.has(item.value))?.label;

  const choose = async (option: TreeSearchResult<V>) => {
    if (searchMode === "remote" && loadPath) {
      await loadPath(option);
    }
    if (checkable || isMultiple) {
      const next = new Set(values);
      if (next.has(option.value)) next.delete(option.value);
      else next.add(option.value);
      onChange?.(Array.from(next) as V[], option);
      return;
    }
    onChange?.(option.value, option);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ProButton
          variant="outline"
          className={cn(
            "w-full justify-start font-normal",
            !currentLabel && "text-muted-foreground",
            className
          )}
        >
          {currentLabel ??
            (Array.isArray(value) && value.length ? `已选择 ${value.length} 项` : placeholder)}
        </ProButton>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-2" align="start">
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索"
        />
        <div className="mt-2 max-h-72 overflow-auto">
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-accent"
              onClick={() => void choose(option)}
            >
              {checkable ? <Checkbox checked={values.has(option.value)} /> : null}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
