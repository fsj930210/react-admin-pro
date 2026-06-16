import { DataGrid } from "@rap/components-ui/data-grid";
import { MinimalTiptapEditor } from "@rap/components-ui/minimal-tiptap";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDescription,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@rap/components-ui/timeline";
import {
  Tree,
  TreeCheckbox,
  TreeItem,
  TreeLabel,
  TreeTrigger,
  TreeViewport,
} from "@rap/components-ui/tree";
import {
  checkableFeature,
  expandableFeature,
  selectableFeature,
} from "@rap/components-ui/tree/features";
import type { ColumnDef } from "@tanstack/react-table";
import { ChevronRight, FileText, Folder } from "lucide-react";

interface ReviewRecord {
  id: string;
  name: string;
  owner: string;
  status: "Ready" | "Reviewing" | "Blocked";
  children?: ReviewRecord[];
}

const reviewRows: ReviewRecord[] = [
  {
    id: "ui",
    name: "UI components",
    owner: "Alex",
    status: "Reviewing",
    children: [
      { id: "ui-data-grid", name: "DataGrid", owner: "Morgan", status: "Ready" },
      { id: "ui-tree", name: "Tree", owner: "River", status: "Blocked" },
    ],
  },
  { id: "docs", name: "Documentation", owner: "Casey", status: "Ready" },
  { id: "demo", name: "Demo routes", owner: "Taylor", status: "Reviewing" },
];

const columns: ColumnDef<ReviewRecord>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    enableColumnFilter: true,
    meta: {
      pinned: "left",
      ellipsis: true,
      sort: { key: "name" },
      filter: { key: "name", type: "input" },
    },
  },
  {
    accessorKey: "owner",
    header: "Owner",
    enableSorting: true,
    meta: { sort: { key: "owner" }, ellipsis: true },
  },
  {
    accessorKey: "status",
    header: "Status",
    enableColumnFilter: true,
    meta: {
      filter: {
        key: "status",
        type: "select",
        options: [
          { label: "Ready", value: "Ready" },
          { label: "Reviewing", value: "Reviewing" },
          { label: "Blocked", value: "Blocked" },
        ],
      },
    },
  },
];

const treeData = [
  {
    key: "components",
    label: "Components",
    children: [
      { key: "components-data-grid", label: "DataGrid" },
      { key: "components-tree", label: "Tree" },
    ],
  },
  {
    key: "docs",
    label: "Docs",
    children: [{ key: "docs-demo", label: "Demo guide" }],
  },
];

const treeFeatures = [
  expandableFeature({ defaultExpandedKeys: ["components"] }),
  selectableFeature({ defaultSelectedKeys: ["components-data-grid"], multiple: true }),
  checkableFeature({ defaultCheckedKeys: ["components-tree"] }),
];

export function DataEditorDemo() {
  return (
    <div className="flex flex-col gap-6">
      <DataGrid
        rowKey="id"
        columns={columns}
        data={reviewRows}
        border
        striped
        scroll={{ x: 760, y: 260 }}
        sorting={{ mode: "local" }}
        filtering={{ mode: "local" }}
        pagination={{ mode: "local", defaultPageSize: 2, showSizeChanger: true }}
        rowSelection={{
          defaultSelectedRowKeys: ["ui-data-grid"],
          getCheckboxProps: (record) => ({ disabled: record.status === "Blocked" }),
        }}
        expandable={{
          defaultExpandedRowKeys: ["ui"],
          getSubRows: (record) => record.children,
          expandedRowRender: (record) => (
            <div className="text-muted-foreground text-sm">{record.name} detail panel</div>
          ),
        }}
        columnPinning={{ defaultValue: { left: ["name"] } }}
        columnOrdering={{ enabled: true, drag: true }}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Tree data={treeData} features={treeFeatures} className="rounded-md border p-2">
          <TreeViewport>
            {(item) => (
              <TreeItem key={item.key} item={item}>
                <TreeTrigger item={item}>
                  {item.isLeaf ? (
                    <FileText className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                </TreeTrigger>
                <TreeCheckbox item={item} />
                {item.isLeaf ? null : <Folder className="size-4 text-muted-foreground" />}
                <TreeLabel item={item} />
              </TreeItem>
            )}
          </TreeViewport>
        </Tree>

        <Timeline activeIndex={1}>
          <TimelineItem>
            <TimelineDot />
            <TimelineConnector />
            <TimelineContent>
              <TimelineHeader>
                <TimelineTitle>Changed</TimelineTitle>
                <TimelineDescription>Component source updated.</TimelineDescription>
              </TimelineHeader>
              <TimelineTime dateTime="2026-06-16">June 16, 2026</TimelineTime>
            </TimelineContent>
          </TimelineItem>
          <TimelineItem>
            <TimelineDot />
            <TimelineConnector />
            <TimelineContent>
              <TimelineHeader>
                <TimelineTitle>Demo added</TimelineTitle>
                <TimelineDescription>Runtime coverage added to this page.</TimelineDescription>
              </TimelineHeader>
              <TimelineTime dateTime="2026-06-16">June 16, 2026</TimelineTime>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </div>

      <MinimalTiptapEditor
        value="<p>Minimal Tiptap renders toolbar, editor content, bubble menu, image/link blocks, and measured container styles.</p>"
        className="min-h-72"
        editorContentClassName="p-4"
      />
    </div>
  );
}
