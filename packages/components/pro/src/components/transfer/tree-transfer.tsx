import { Button } from "@rap/components-ui/button";
import { Checkbox } from "@rap/components-ui/checkbox";
import { Input } from "@rap/components-ui/input";
import { Transfer as UITransfer } from "@rap/components-ui/transfer";
import { useControllableState } from "@rap/hooks/use-controllable-state";
import { useMemoizedFn } from "@rap/hooks/use-memoized-fn";
import { cn } from "@rap/utils";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import {
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { DataGrid, type DataGridProps } from "../data-grid";
import { Tree, type TreeProps } from "../tree";
import type { TreeFeature, TreeInstance, TreeKey, TreeNode } from "@rap/components-ui/tree/types";

const ORGANIZATION_FIELD = "__rap_tree_transfer_organization__";

type TransferValue = string | number;
export type TreeTransferRecord<T> = T & { [ORGANIZATION_FIELD]?: ReactNode };
type InternalRecord<T> = TreeTransferRecord<T>;

export interface TreeTransferLoadListParams {
  treeKey?: TreeKey;
  treeNode?: TreeNode;
  search?: string;
  includeChild?: boolean;
}

export interface TreeTransferProps<T, V extends TransferValue = string> extends Omit<
  ComponentProps<"div">,
  "defaultValue" | "onChange" | "title"
> {
  value?: V[];
  defaultValue?: V[];
  onChange?: (value: V[], selectedItems: InternalRecord<T>[]) => void;
  treeProps: TreeProps;
  rowKey: keyof T | ((record: T) => V);
  columns: ColumnDef<T>[];
  loadList: (params: TreeTransferLoadListParams) => Promise<T[]>;
  loadSelected?: (values: V[]) => Promise<T[]>;
  title?: {
    left?: ReactNode;
    right?: ReactNode;
  };
  searchPlaceholder?: string;
  placeholder?: {
    tree?: string;
    source?: string;
    target?: string;
  };
  includeChild?: boolean;
  defaultIncludeChild?: boolean;
  onIncludeChildChange?: (checked: boolean) => void;
  organizationColumn?:
    | false
    | {
        title?: ReactNode;
        dataIndex?: keyof T;
        width?: number;
      };
  getTreeNodePathLabel?: (node: TreeNode, treeData: TreeNode[]) => ReactNode;
  targetFilterOption?: (record: InternalRecord<T>, keyword: string) => boolean;
  sourceTableProps?: Partial<DataGridProps<InternalRecord<T>>>;
  targetTableProps?: Partial<DataGridProps<InternalRecord<T>>>;
}

function findNodePath(nodes: TreeNode[], key: TreeKey): TreeNode[] | null {
  for (const node of nodes) {
    if (node.key === key) return [node];
    const childPath = node.children ? findNodePath(node.children, key) : null;
    if (childPath) return [node, ...childPath];
  }
  return null;
}

function findNode(nodes: TreeNode[], key: TreeKey) {
  const path = findNodePath(nodes, key);
  return path ? path[path.length - 1] : undefined;
}

function readTreeData(treeProps: TreeProps) {
  return treeProps.data ?? treeProps.treeData ?? [];
}

function defaultPathLabel(node: TreeNode | undefined, treeData: TreeNode[]) {
  if (!node) return undefined;
  const path = findNodePath(treeData, node.key) ?? [node];
  return path.map((item) => item.label).join(" / ");
}

function getInitialTreeNode(treeProps: TreeProps) {
  const treeData = readTreeData(treeProps);
  const initialKey = treeProps.selectedKeys?.[0] ?? treeProps.defaultSelectedKeys?.[0];
  return initialKey == null ? undefined : findNode(treeData, initialKey);
}

function createValueGetter<T, V extends TransferValue>(rowKey: TreeTransferProps<T, V>["rowKey"]) {
  return (record: T) => {
    if (typeof rowKey === "function") return rowKey(record);
    return record[rowKey] as V;
  };
}

function mergeByValue<T, V extends TransferValue>(
  current: InternalRecord<T>[],
  incoming: InternalRecord<T>[],
  getValue: (record: T) => V
) {
  const map = new Map<V, InternalRecord<T>>();
  for (const item of current) map.set(getValue(item), item);
  for (const item of incoming) map.set(getValue(item), item);
  return Array.from(map.values());
}

function filterByValues<T, V extends TransferValue>(
  items: InternalRecord<T>[],
  values: V[],
  getValue: (record: T) => V
) {
  const valueSet = new Set(values);
  return items.filter((item) => valueSet.has(getValue(item)));
}

function normalizeList<T>(list: unknown): T[] {
  if (Array.isArray(list)) return list;
  if (list && typeof list === "object" && Array.isArray((list as { data?: unknown }).data)) {
    return (list as { data: T[] }).data;
  }
  const nestedData = (list as { data?: { data?: unknown } } | null)?.data?.data;
  if (Array.isArray(nestedData)) return nestedData as T[];
  return [];
}

function buildOrganizationColumn<T>(
  config: Exclude<TreeTransferProps<T>["organizationColumn"], false> | undefined
): ColumnDef<InternalRecord<T>> {
  return {
    id: ORGANIZATION_FIELD,
    header: () => config?.title ?? "所属组织",
    size: config?.width,
    cell: ({ row }) => {
      const record = row.original;
      return config?.dataIndex
        ? ((record[config.dataIndex] as ReactNode) ?? record[ORGANIZATION_FIELD] ?? "")
        : (record[ORGANIZATION_FIELD] ?? "");
    },
  };
}

function readRowSelection<T>(props?: Partial<DataGridProps<T>>) {
  return props?.rowSelection === false ? undefined : props?.rowSelection;
}

function readAccessorValue<T>(record: T, column: ColumnDef<T>) {
  if ("accessorKey" in column && typeof column.accessorKey === "string") {
    return (record as Record<string, unknown>)[column.accessorKey];
  }
  return undefined;
}

function defaultTargetFilter<T>(
  record: InternalRecord<T>,
  columns: ColumnDef<InternalRecord<T>>[],
  keyword: string
) {
  const lowerKeyword = keyword.toLowerCase();
  return columns.some((column) => {
    const value = readAccessorValue(record, column);
    return value == null ? false : String(value).toLowerCase().includes(lowerKeyword);
  });
}

function TreeTransferPanel({
  title,
  children,
  className,
}: {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-[520px] min-w-0 flex-1 flex-col rounded-md border", className)}>
      <div className="flex min-h-11 items-center border-b px-3 font-medium text-sm">{title}</div>
      <div className="min-h-0 flex-1 p-3">{children}</div>
    </div>
  );
}

export function TreeTransfer<T, V extends TransferValue = string>({
  value,
  defaultValue,
  onChange,
  treeProps,
  rowKey,
  columns,
  loadList,
  loadSelected,
  title,
  searchPlaceholder = "搜索内容",
  placeholder,
  includeChild: includeChildProp,
  defaultIncludeChild = false,
  onIncludeChildChange,
  organizationColumn,
  getTreeNodePathLabel,
  targetFilterOption,
  sourceTableProps,
  targetTableProps,
  className,
  ...props
}: TreeTransferProps<T, V>) {
  const getValue = useMemoizedFn(createValueGetter(rowKey));
  const treeData = readTreeData(treeProps);
  const sourceRowSelection = readRowSelection(sourceTableProps);
  const targetRowSelection = readRowSelection(targetTableProps);
  const [selectedValues, setSelectedValues] = useControllableState<V[]>(
    { value, defaultValue, onChange: undefined },
    { defaultValue: [] as V[] }
  );
  const [includeChild, setIncludeChild] = useControllableState({
    value: includeChildProp,
    defaultValue: defaultIncludeChild,
    onChange: onIncludeChildChange,
  });
  const [currentTreeNode, setCurrentTreeNode] = useState<TreeNode | undefined>(() =>
    getInitialTreeNode(treeProps)
  );
  const [search, setSearch] = useState("");
  const [treeSearch, setTreeSearch] = useState("");
  const [targetSearch, setTargetSearch] = useState("");
  const [sourceList, setSourceList] = useState<InternalRecord<T>[]>([]);
  const [targetDataSource, setTargetDataSourceState] = useState<InternalRecord<T>[]>([]);
  const [targetCheckedValues, setTargetCheckedValues] = useState<V[]>([]);
  const [loading, setLoading] = useState(false);
  const initialSourceLoadedRef = useRef(false);
  const targetDataSourceRef = useRef(targetDataSource);
  const treeInstanceRef = useRef<TreeInstance | null>(null);
  const treeCaptureFeatureRef = useRef<TreeFeature | null>(null);
  if (!treeCaptureFeatureRef.current) {
    treeCaptureFeatureRef.current = {
      name: "tree-transfer-capture",
      install(ctx) {
        treeInstanceRef.current = ctx.tree;
      },
    };
  }

  const setTargetDataSource = (next: InternalRecord<T>[]) => {
    targetDataSourceRef.current = next;
    setTargetDataSourceState(next);
  };

  const emitChange = (nextValues: V[]) => {
    const selectedItems = filterByValues(targetDataSourceRef.current, nextValues, getValue);
    const nextValueSet = new Set(nextValues.map(String));
    setTargetCheckedValues((checkedValues) =>
      checkedValues.filter((itemValue) => nextValueSet.has(String(itemValue)))
    );
    setSelectedValues(nextValues);
    onChange?.(nextValues, selectedItems);
  };

  const requestSourceList = useMemoizedFn(async (next?: Partial<TreeTransferLoadListParams>) => {
    const nextTreeNode = next?.treeNode ?? currentTreeNode;
    setLoading(true);
    try {
      const list = normalizeList<InternalRecord<T>>(
        await loadList({
          treeKey: next?.treeKey ?? nextTreeNode?.key,
          treeNode: nextTreeNode,
          search: next?.search ?? search,
          includeChild: next?.includeChild ?? includeChild,
        })
      );
      const organization = getTreeNodePathLabel
        ? nextTreeNode
          ? getTreeNodePathLabel(nextTreeNode, treeData)
          : undefined
        : defaultPathLabel(nextTreeNode, treeData);
      setSourceList(
        list.map((item) => ({
          ...item,
          [ORGANIZATION_FIELD]: item[ORGANIZATION_FIELD] ?? organization,
        }))
      );
    } finally {
      setLoading(false);
    }
  });

  useEffect(() => {
    // Initial source loading belongs to component setup; later tree/search/include-child updates
    // are event-driven in their own handlers.
    if (initialSourceLoadedRef.current || !currentTreeNode) return;
    initialSourceLoadedRef.current = true;
    void requestSourceList({ treeKey: currentTreeNode.key, treeNode: currentTreeNode });
  }, [currentTreeNode, requestSourceList]);

  useEffect(() => {
    // Async tree data can arrive after mount in demos or remote forms; once the default node exists,
    // the first source query should run exactly like a user-selected node query.
    if (currentTreeNode || treeData.length === 0) return;
    const nextNode = getInitialTreeNode(treeProps);
    if (!nextNode) return;
    initialSourceLoadedRef.current = true;
    setCurrentTreeNode(nextNode);
    void requestSourceList({ treeKey: nextNode.key, treeNode: nextNode });
  }, [treeData, currentTreeNode, treeProps, requestSourceList]);

  useEffect(() => {
    // Value replay needs a lifecycle bridge because edit forms can provide ids before the
    // right-side display records exist.
    if (!loadSelected || selectedValues.length === 0) return;
    const currentSet = new Set(targetDataSourceRef.current.map(getValue));
    const missingValues = selectedValues.filter((itemValue) => !currentSet.has(itemValue));
    if (missingValues.length === 0) return;
    void loadSelected(missingValues).then((items) => {
      const next = mergeByValue(
        targetDataSourceRef.current,
        normalizeList<InternalRecord<T>>(items),
        getValue
      );
      setTargetDataSource(next);
      onChange?.(selectedValues, filterByValues(next, selectedValues, getValue));
    });
  }, [loadSelected, selectedValues, getValue, onChange]);

  const mergedColumns =
    organizationColumn === false
      ? (columns as ColumnDef<InternalRecord<T>>[])
      : [
          ...(columns as ColumnDef<InternalRecord<T>>[]),
          buildOrganizationColumn(organizationColumn),
        ];
  const targetValuesSet = new Set(selectedValues);
  const sourceTableData = sourceList.filter((item) => !targetValuesSet.has(getValue(item)));
  const targetTableData = filterByValues(targetDataSource, selectedValues, getValue);
  const filteredTargetTableData = targetSearch
    ? targetTableData.filter((item) =>
        targetFilterOption
          ? targetFilterOption(item, targetSearch)
          : defaultTargetFilter(item, mergedColumns, targetSearch)
      )
    : targetTableData;
  const currentOrganization = getTreeNodePathLabel
    ? currentTreeNode
      ? getTreeNodePathLabel(currentTreeNode, treeData)
      : undefined
    : defaultPathLabel(currentTreeNode, treeData);
  const sourceSearchPlaceholder = placeholder?.source ?? searchPlaceholder;
  const targetSearchPlaceholder = placeholder?.target ?? searchPlaceholder;
  const treeSearchPlaceholder = placeholder?.tree ?? "搜索组织";
  const treeFeatures = useMemo(
    () =>
      treeCaptureFeatureRef.current
        ? [treeCaptureFeatureRef.current, ...(treeProps.features ?? [])]
        : treeProps.features,
    // Tree uses the feature array identity when creating its instance; keep the injected
    // capture feature stable unless business-provided tree features really change.
    [treeProps.features]
  );
  return (
    <UITransfer
      dataSource={sourceList}
      value={selectedValues}
      getValue={getValue}
      onChange={emitChange}
    >
      {(api) => {
        const sourceKeyMap = new Map(sourceList.map((item) => [String(getValue(item)), item]));
        const targetKeyMap = new Map(
          targetDataSource.map((item) => [String(getValue(item)), item])
        );
        const leftTitle = title?.left ?? (
          <div className="flex w-full items-center justify-between gap-3">
            <span className="shrink-0">
              待选（{api.sourceCheckedValues.length}/{sourceTableData.length}）
            </span>
            <div className="flex min-w-0 items-center gap-2 font-normal">
              <Checkbox
                checked={includeChild}
                onCheckedChange={(checked) => {
                  const next = checked === true;
                  setIncludeChild(next);
                  void requestSourceList({ includeChild: next });
                }}
              />
              <span className="truncate">包含下级</span>
            </div>
          </div>
        );
        const rightTitle = title?.right ?? (
          <div className="flex w-full items-center justify-end">
            <span className="shrink-0">
              已选（{targetCheckedValues.length}/{targetTableData.length}）
            </span>
          </div>
        );
        return (
          <div
            className={cn(
              "grid h-[552px] min-h-0 grid-cols-[260px_minmax(0,1fr)_auto_minmax(0,1fr)] rounded-md border bg-background shadow-xs aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
              className
            )}
            {...props}
          >
            <div className="flex h-full min-w-0 flex-col border-r p-3">
              {treeProps.searchable ? (
                <div className="mb-3 relative">
                  <Input
                    className="pr-9"
                    placeholder={treeSearchPlaceholder}
                    value={treeSearch}
                    onChange={(event) => {
                      const next = event.target.value;
                      setTreeSearch(next);
                      treeInstanceRef.current?.search?.(next);
                    }}
                    onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                      if (event.key === "Enter") {
                        treeInstanceRef.current?.search?.(event.currentTarget.value);
                      }
                    }}
                  />
                  <Button
                    aria-label="搜索"
                    className="absolute top-0 right-0"
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => treeInstanceRef.current?.search?.(treeSearch)}
                  >
                    <Search className="size-4" />
                  </Button>
                </div>
              ) : null}
              <div className="min-h-0 flex-1 overflow-auto">
                <Tree
                  {...treeProps}
                  features={treeFeatures}
                  selectable={treeProps.selectable ?? true}
                  selectedKeys={
                    treeProps.selectedKeys ??
                    (currentTreeNode ? [currentTreeNode.key] : treeProps.defaultSelectedKeys)
                  }
                  onSelectedKeysChange={(keys, info) => {
                    const nextNode = info.item?.node ?? findNode(treeData, info.key);
                    setCurrentTreeNode(nextNode);
                    treeProps.onSelectedKeysChange?.(keys, info);
                    void requestSourceList({ treeKey: info.key, treeNode: nextNode });
                  }}
                />
              </div>
            </div>
            <TreeTransferPanel
              className="h-full rounded-none border-y-0 border-l-0"
              title={leftTitle}
            >
              <div className="flex h-full min-h-0 flex-col gap-3">
                <div className="relative">
                  <Input
                    className="pr-9"
                    placeholder={sourceSearchPlaceholder}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                      if (event.key === "Enter") void requestSourceList({ search });
                    }}
                  />
                  <Button
                    aria-label="搜索"
                    className="absolute top-0 right-0"
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => void requestSourceList({ search })}
                  >
                    <Search className="size-4" />
                  </Button>
                </div>
                <div className="min-h-0 flex-1">
                  <DataGrid
                    rowKey={(record) => String(getValue(record))}
                    columns={mergedColumns}
                    data={sourceTableData}
                    loading={loading}
                    scroll={{ y: "100%" }}
                    {...sourceTableProps}
                    rowSelection={{
                      ...sourceRowSelection,
                      selectedRowKeys: api.sourceCheckedValues.map(String),
                      onChange: (keys) => {
                        const nextRecords = keys
                          .map((key) => sourceKeyMap.get(String(key)))
                          .filter((item): item is InternalRecord<T> => Boolean(item));
                        api.setSourceCheckedValues(nextRecords.map(getValue));
                        sourceRowSelection?.onChange?.(keys, nextRecords);
                      },
                    }}
                  />
                </div>
              </div>
            </TreeTransferPanel>
            <div className="flex shrink-0 flex-col items-center justify-center gap-2 px-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={api.sourceCheckedValues.length === 0}
                onClick={() => {
                  const incoming = api.sourceCheckedValues
                    .map((itemValue) => sourceKeyMap.get(String(itemValue)))
                    .filter((item): item is InternalRecord<T> => Boolean(item))
                    .map((item) => ({
                      ...item,
                      [ORGANIZATION_FIELD]: item[ORGANIZATION_FIELD] ?? currentOrganization,
                    }));
                  setTargetDataSource(
                    mergeByValue(targetDataSourceRef.current, incoming, getValue)
                  );
                  api.moveToTarget();
                }}
              >
                <ChevronRight className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={targetCheckedValues.length === 0}
                onClick={() => {
                  const removeSet = new Set(targetCheckedValues.map(String));
                  setTargetDataSource(
                    targetDataSourceRef.current.filter(
                      (item) => !removeSet.has(String(getValue(item)))
                    )
                  );
                  setTargetCheckedValues([]);
                  emitChange(
                    selectedValues.filter((itemValue) => !removeSet.has(String(itemValue)))
                  );
                }}
              >
                <ChevronLeft className="size-4" />
              </Button>
            </div>
            <TreeTransferPanel
              className="h-full rounded-none border-y-0 border-r-0"
              title={rightTitle}
            >
              <div className="flex h-full min-h-0 flex-col gap-3">
                <div className="relative">
                  <Input
                    className="pr-9"
                    placeholder={targetSearchPlaceholder}
                    value={targetSearch}
                    onChange={(event) => setTargetSearch(event.target.value)}
                    onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
                      if (event.key === "Enter") setTargetSearch(event.currentTarget.value);
                    }}
                  />
                  <Button
                    aria-label="搜索"
                    className="absolute top-0 right-0"
                    size="icon"
                    variant="ghost"
                    type="button"
                    onClick={() => setTargetSearch(targetSearch)}
                  >
                    <Search className="size-4" />
                  </Button>
                </div>
                <div className="min-h-0 flex-1">
                  <DataGrid
                    rowKey={(record) => String(getValue(record))}
                    columns={mergedColumns}
                    data={filteredTargetTableData}
                    scroll={{ y: "100%" }}
                    {...targetTableProps}
                    rowSelection={{
                      ...targetRowSelection,
                      selectedRowKeys: targetCheckedValues.map(String),
                      onChange: (keys) => {
                        const nextRecords = keys
                          .map((key) => targetKeyMap.get(String(key)))
                          .filter((item): item is InternalRecord<T> => Boolean(item));
                        setTargetCheckedValues(nextRecords.map(getValue));
                        targetRowSelection?.onChange?.(keys, nextRecords);
                      },
                    }}
                  />
                </div>
              </div>
            </TreeTransferPanel>
          </div>
        );
      }}
    </UITransfer>
  );
}
