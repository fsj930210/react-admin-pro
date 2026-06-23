import { BasicTree, DraggableTree, Tree, VirtualTree } from "@rap/components-pro/tree";
import { Button } from "@rap/components-ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@rap/components-ui/context-menu";
import {
  TreeCheckbox,
  TreeDropIndicator,
  TreeItem,
  TreeLabel,
  TreeRoot,
  TreeTrigger,
  TreeViewport,
  TreeVirtualViewport,
} from "@rap/components-ui/tree";
import {
  asyncLoaderFeature,
  checkableFeature,
  crudFeature,
  dndFeature,
  expandableFeature,
  filterFeature,
  searchFeature,
  selectableFeature,
  sortableFeature,
} from "@rap/components-ui/tree/features";
import type {
  DropIntent,
  TreeInstance,
  TreeItemInstance,
  TreeKey,
  TreeNode,
} from "@rap/components-ui/tree/types";
import { createFileRoute } from "@tanstack/react-router";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { fetchTreeChildren } from "@/service/tree";
import { AsyncTreeSearchDemo } from "./-async-search-demo";
import { SyncTreeSearchDemo } from "./-sync-search-demo";

export const Route = createFileRoute("/(layouts)/components/tree/")({
  component: TreeComponentPage,
});

const createTreeNode = (path = "root", level = 2, childCount = 3): TreeNode => {
  const node: TreeNode = {
    key: path,
    label: path === "root" ? "Root" : path,
    type: path.includes("dept") ? "department" : "group",
  };

  if (level > 0) {
    node.children = Array.from({ length: childCount }, (_, index) =>
      createTreeNode(`${path}-${index + 1}`, level - 1, childCount)
    );
  }

  return node;
};

const createOrgTree = (): TreeNode[] => [
  {
    key: "company",
    label: "Acme Corp",
    type: "company",
    children: [
      {
        key: "platform",
        label: "Platform Department",
        type: "department",
        children: [
          { key: "platform-web", label: "Web Team", type: "team" },
          { key: "platform-infra", label: "Infrastructure Team", type: "team" },
        ],
      },
      {
        key: "product",
        label: "Product Department",
        type: "department",
        children: [
          { key: "product-growth", label: "Growth Team", type: "team" },
          { key: "product-admin", label: "Admin Team", type: "team", disabled: true },
        ],
      },
      { key: "finance", label: "Finance Department", type: "department" },
    ],
  },
];

const createRemoteTree = (): TreeNode[] => [
  {
    key: "remote-root",
    label: "Remote Organization",
    child_num: 3,
    children: [
      { key: "remote-apac", label: "APAC", child_num: 4, children: [] },
      { key: "remote-emea", label: "EMEA", child_num: 4, children: [] },
      { key: "remote-na", label: "North America", child_num: 0, children: [] },
    ],
  },
];

function renderLabel(item: TreeItemInstance) {
  const segments = item.tree.getItemState<{ text: string; matched: boolean }[]>(
    item.key,
    "matchedSegments"
  );
  if (!segments) return item.node.label;
  return segments.map((segment, index) => (
    <span
      // biome-ignore lint/suspicious/noArrayIndexKey: segments are derived from immutable text slices for this render.
      key={`${item.key}-${index}`}
      className={segment.matched ? "text-destructive" : undefined}
      style={segment.matched ? { color: "var(--destructive)" } : undefined}
    >
      {segment.text}
    </span>
  ));
}

function TreeRow({
  item,
  checkbox = true,
  draggable = false,
  dropIntent,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  item: TreeItemInstance;
  checkbox?: boolean;
  draggable?: boolean;
  dropIntent?: DropIntent;
  onDragStart?: React.DragEventHandler<HTMLDivElement>;
  onDragOver?: React.DragEventHandler<HTMLDivElement>;
  onDrop?: React.DragEventHandler<HTMLDivElement>;
  onDragEnd?: React.DragEventHandler<HTMLDivElement>;
}) {
  return (
    <TreeItem
      key={item.key}
      item={item}
      className="relative rounded-sm"
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      <TreeTrigger item={item} />
      {checkbox && <TreeCheckbox item={item} />}
      <TreeLabel item={item}>{renderLabel}</TreeLabel>
      {Boolean(item.loading) && <span className="ml-2 text-xs text-muted-foreground">Loading</span>}
      {Boolean(item.loadError) && <span className="ml-2 text-xs text-destructive">Failed</span>}
      <TreeDropIndicator item={item} intent={dropIntent} />
    </TreeItem>
  );
}

function StatePill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex min-h-7 items-center rounded-md border bg-muted/40 px-2 text-xs text-muted-foreground">
      {children}
    </span>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3 border-t pt-5">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function UncontrolledFeatureDemo() {
  const [treeData] = useState(createOrgTree);
  const features = useMemo(
    () => [
      expandableFeature({ defaultExpandedKeys: ["company", "platform"] }),
      selectableFeature({ multiple: true }),
      checkableFeature({}),
    ],
    []
  );

  return (
    <TreeRoot data={treeData} features={features}>
      {(tree) => (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <StatePill>expanded: {tree.getExpandedKeys?.().join(", ") ?? "-"}</StatePill>
            <StatePill>selected: {tree.getSelectedKeys?.().join(", ") ?? "-"}</StatePill>
            <StatePill>checked: {tree.getCheckedKeys?.().join(", ") ?? "-"}</StatePill>
          </div>
          <TreeViewport>{(item) => <TreeRow item={item} />}</TreeViewport>
        </div>
      )}
    </TreeRoot>
  );
}

function ControlledFeatureDemo() {
  const [treeData] = useState(createOrgTree);
  const [expandedKeys, setExpandedKeys] = useState(["company"]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>(["platform"]);
  const [checkedKeys, setCheckedKeys] = useState<string[]>(["platform-web"]);
  const features = useMemo(
    () => [
      expandableFeature({
        expandedKeys,
        onExpandedKeysChange: setExpandedKeys,
      }),
      selectableFeature({
        selectedKeys,
        multiple: true,
        onSelectedKeysChange: setSelectedKeys,
      }),
      checkableFeature({
        checkedKeys,
        onCheckedKeysChange: setCheckedKeys,
      }),
    ],
    [checkedKeys, expandedKeys, selectedKeys]
  );

  return (
    <TreeRoot data={treeData} features={features}>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setExpandedKeys((keys) =>
                keys.includes("product") ? ["company"] : ["company", "product"]
              )
            }
          >
            Toggle product
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSelectedKeys(["finance"])}
          >
            Select finance
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setCheckedKeys(["platform", "platform-web", "platform-infra"])}
          >
            Check platform
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatePill>expanded: {expandedKeys.join(", ") || "-"}</StatePill>
          <StatePill>selected: {selectedKeys.join(", ") || "-"}</StatePill>
          <StatePill>checked: {checkedKeys.join(", ") || "-"}</StatePill>
        </div>
        <TreeViewport>{(item) => <TreeRow item={item} />}</TreeViewport>
      </div>
    </TreeRoot>
  );
}

function CrudDemo() {
  const [treeData, setTreeData] = useState(createOrgTree);
  const [message, setMessage] = useState("Ready");
  const features = useMemo(
    () => [
      crudFeature(),
      expandableFeature({ defaultExpandedKeys: ["company", "platform"] }),
      selectableFeature({}),
    ],
    []
  );

  const commit = (tree: TreeInstance, label: string) => {
    setTreeData(tree.nodes);
    setMessage(label);
  };

  return (
    <TreeRoot data={treeData} features={features}>
      {(tree) => (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const result = tree.updateNode("platform-web", {
                  label: `Web Team ${new Date().toLocaleTimeString()}`,
                });
                commit(tree, `updateNode: ${result.changedKeys.join(", ")}`);
              }}
            >
              Rename
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const key = `platform-new-${Date.now()}`;
                const result = tree.insertNode("platform", { key, label: "New Platform Squad" });
                commit(tree, `insertNode: ${result.changedKeys.join(", ")}`);
              }}
            >
              Insert
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const result = tree.moveNode("finance", "platform", "inside");
                commit(
                  tree,
                  result.ok ? "moveNode: finance -> platform" : (result.reason ?? "move failed")
                );
              }}
            >
              Move finance inside
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const result = tree.removeNode("product-admin");
                commit(
                  tree,
                  result.ok ? "removeNode: product-admin" : (result.reason ?? "remove failed")
                );
              }}
            >
              Remove disabled
            </Button>
          </div>
          <StatePill>{message}</StatePill>
          <TreeViewport>{(item) => <TreeRow item={item} checkbox={false} />}</TreeViewport>
        </div>
      )}
    </TreeRoot>
  );
}

function SearchFilterDemo() {
  const [treeData] = useState(createOrgTree);
  const [keyword, setKeyword] = useState("");
  const [teamsOnly, setTeamsOnly] = useState(false);
  const features = useMemo(
    () => [
      expandableFeature({ defaultExpandedKeys: ["company", "platform", "product"] }),
      searchFeature(),
      filterFeature({
        filter: teamsOnly ? (item) => item.node.type === "team" : undefined,
      }),
      selectableFeature({}),
    ],
    [teamsOnly]
  );

  return (
    <TreeRoot data={treeData} features={features}>
      {(tree) => (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <input
              aria-label="Search label"
              className="h-9 w-56 rounded-md border bg-background px-3 text-sm"
              placeholder="Search label"
              value={keyword}
              onChange={(event) => {
                setKeyword(event.target.value);
                tree.search?.(event.target.value);
              }}
            />
            <Button
              type="button"
              variant={teamsOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setTeamsOnly((value) => !value)}
            >
              Teams only
            </Button>
            <StatePill>matched: {tree.getMatchedKeys?.().join(", ") ?? "-"}</StatePill>
          </div>
          <TreeViewport>{(item) => <TreeRow item={item} checkbox={false} />}</TreeViewport>
        </div>
      )}
    </TreeRoot>
  );
}

function RemoteLoadingDemo() {
  const [treeData] = useState(createRemoteTree);
  const features = useMemo(
    () => [
      expandableFeature({ defaultExpandedKeys: ["remote-root"] }),
      asyncLoaderFeature({
        loadChildren: (node) => fetchTreeChildren(node.key),
      }),
      checkableFeature({}),
    ],
    []
  );

  return (
    <TreeRoot
      data={treeData}
      features={features}
      isLeaf={(node) => typeof node.child_num === "number" && node.child_num <= 0}
    >
      <TreeViewport>{(item) => <TreeRow item={item} />}</TreeViewport>
    </TreeRoot>
  );
}

function VirtualDemo() {
  const [treeData] = useState(() => [createTreeNode("virtual-root", 3, 18)]);
  const features = useMemo(
    () => [
      expandableFeature({
        defaultExpandedKeys: ["virtual-root", "virtual-root-1", "virtual-root-2"],
      }),
      selectableFeature({}),
      checkableFeature({ checkStrictly: true }),
    ],
    []
  );

  return (
    <TreeRoot data={treeData} features={features} rowHeight={30}>
      <TreeVirtualViewport height={360}>{(item) => <TreeRow item={item} />}</TreeVirtualViewport>
    </TreeRoot>
  );
}

function SortableDemo() {
  const [treeData, setTreeData] = useState(createOrgTree);
  const dragStartPoint = useRef({ x: 0, y: 0 });
  const features = useMemo(
    () => [
      crudFeature(),
      expandableFeature({ defaultExpandedKeys: ["company", "platform", "product"] }),
      dndFeature({
        canDrag: (item) => !item.disabled,
        canDrop: ({ nextParentKey }) => {
          if (nextParentKey === "product-admin") return "Disabled team cannot receive drops.";
          return true;
        },
      }),
      sortableFeature(),
    ],
    []
  );

  return (
    <TreeRoot data={treeData} features={features}>
      {(tree) => {
        const dropIntent = tree.getSelectorValue<DropIntent>("dnd.dropIntent");
        return (
          <div className="space-y-3">
            <StatePill>
              drop:{" "}
              {dropIntent
                ? `${dropIntent.dragKey} ${dropIntent.position} ${dropIntent.dropTargetKey}`
                : "-"}
            </StatePill>
            <TreeViewport>
              {(item) => (
                <TreeRow
                  item={item}
                  checkbox={false}
                  draggable
                  dropIntent={dropIntent}
                  onDragStart={(event) => {
                    dragStartPoint.current = { x: event.clientX, y: event.clientY };
                    tree.actions["dnd.startDrag"]?.(item.key);
                    event.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    tree.actions["dnd.updateDropIntent"]?.({
                      targetKey: item.key,
                      pointer: { x: event.clientX, y: event.clientY },
                      initialPointer: dragStartPoint.current,
                      targetRect: event.currentTarget.getBoundingClientRect(),
                    });
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    tree.actions["sortable.drop"]?.();
                    setTreeData(tree.nodes);
                  }}
                  onDragEnd={() => tree.actions["dnd.cancel"]?.()}
                />
              )}
            </TreeViewport>
          </div>
        );
      }}
    </TreeRoot>
  );
}

function TreeWrapperDemo() {
  const [treeData, setTreeData] = useState(createOrgTree);
  const [checkedKeys, setCheckedKeys] = useState<TreeKey[]>(["platform-web"]);
  const [contextMessage, setContextMessage] = useState("右键 Tree 节点打开菜单");

  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Tree</h4>
        <Tree
          data={treeData}
          defaultExpandedKeys={["company", "platform", "product"]}
          checkable
          selectable={{ multiple: true }}
          checkedKeys={checkedKeys}
          onCheckedKeysChange={setCheckedKeys}
          searchable
          virtual={{ height: 260 }}
          rowHeight={30}
          draggable={{
            canDrag: (item) => !item.disabled,
          }}
          onTreeChange={setTreeData}
          onItemContextMenu={(event, { item }) => {
            event.preventDefault();
            setContextMessage(`打开菜单：${item.node.label}`);
          }}
          renderItem={({ item, tree, defaultNode }) => (
            <ContextMenu>
              <ContextMenuTrigger asChild>{defaultNode}</ContextMenuTrigger>
              <ContextMenuContent className="w-40">
                <ContextMenuItem
                  onClick={() => {
                    const key = `${item.key}-new-${Date.now()}`;
                    tree.insertNode(item.key, { key, label: "新节点" });
                    setTreeData(tree.nodes);
                    setContextMessage(`添加子节点：${item.node.label}`);
                  }}
                >
                  <Plus className="size-4" />
                  添加
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    tree.updateNode(item.key, { label: `${item.node.label} 已编辑` });
                    setTreeData(tree.nodes);
                    setContextMessage(`编辑节点：${item.node.label}`);
                  }}
                >
                  <Edit3 className="size-4" />
                  编辑
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  variant="destructive"
                  disabled={item.parentKey === null}
                  onClick={() => {
                    tree.removeNode(item.key);
                    setTreeData(tree.nodes);
                    setContextMessage(`删除节点：${item.node.label}`);
                  }}
                >
                  <Trash2 className="size-4" />
                  删除
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          )}
        />
        <StatePill>{contextMessage}</StatePill>
      </div>
      <div className="space-y-2">
        <h4 className="text-sm font-medium">BasicTree</h4>
        <BasicTree
          data={treeData}
          defaultExpandedKeys={["company", "platform"]}
          checkable
          selectable={{ multiple: true }}
          checkedKeys={checkedKeys}
          onCheckedKeysChange={setCheckedKeys}
          searchable
        />
      </div>
      <div className="space-y-2">
        <h4 className="text-sm font-medium">VirtualTree</h4>
        <VirtualTree
          data={[createTreeNode("pro-virtual", 3, 12)]}
          height={260}
          rowHeight={30}
          defaultExpandedKeys={["pro-virtual", "pro-virtual-1"]}
          checkable={{ checkStrictly: true }}
          selectable
        />
      </div>
      <div className="space-y-2">
        <h4 className="text-sm font-medium">DraggableTree</h4>
        <DraggableTree
          data={treeData}
          defaultExpandedKeys={["company", "platform", "product"]}
          onTreeChange={setTreeData}
          canDrag={(item) => !item.disabled}
          checkable={false}
        />
      </div>
    </div>
  );
}

function TreeComponentPage() {
  return (
    <div className="size-full space-y-6 p-6">
      <div>
        <h2 className="text-2xl font-bold">Tree Components</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Feature-based, UI-agnostic tree core with React primitives.
        </p>
      </div>

      <Section
        title="Uncontrolled expandable / selectable / checkable"
        description="Uses default keys and lets the tree own state internally."
      >
        <UncontrolledFeatureDemo />
      </Section>

      <Section
        title="Controlled expandable / selectable / checkable"
        description="External React state owns expanded, selected, and checked keys."
      >
        <ControlledFeatureDemo />
      </Section>

      <Section
        title="CRUD local mutations"
        description="updateNode, insertNode, moveNode, and removeNode mutate by key with minimal structural work."
      >
        <CrudDemo />
      </Section>

      <Section
        title="Search and filter"
        description="Search highlights matched segments while filter narrows visible items."
      >
        <SearchFilterDemo />
      </Section>

      <Section
        title="BasicTree sync search"
        description="Built-in search filters the current tree and highlights matched label text."
      >
        <SyncTreeSearchDemo />
      </Section>

      <Section
        title="BasicTree async search"
        description="Async search requests options, then renders a temporary subtree for the selected result."
      >
        <AsyncTreeSearchDemo />
      </Section>

      <Section
        title="Remote async loading"
        description="Children are loaded through the MSW mock endpoint when a lazy node expands."
      >
        <RemoteLoadingDemo />
      </Section>

      <Section
        title="Virtual viewport"
        description="The same primitives render a large expanded tree through tanstack virtual."
      >
        <VirtualDemo />
      </Section>

      <Section
        title="DND intent and sortable"
        description="DND computes drop intent; sortable converts valid intent into a CRUD move."
      >
        <SortableDemo />
      </Section>

      <Section
        title="Tree wrappers"
        description="Tree is the complete wrapper; BasicTree, VirtualTree, and DraggableTree stay available for focused usage."
      >
        <TreeWrapperDemo />
      </Section>
    </div>
  );
}
