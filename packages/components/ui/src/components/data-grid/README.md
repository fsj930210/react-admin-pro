# DataGrid

`DataGrid` 是后台系统里的高频表格组件。它负责稳定的表格骨架、状态编排和常用交互；拖拽、虚拟化、编辑等低频能力不内置，通过 `components`、`onRow`、`onCell` 和外部状态扩展。

## 基础用法

```tsx
import { DataGrid } from "@rap/components-ui/data-grid";
import type { ColumnDef } from "@tanstack/react-table";

interface User {
  id: string;
  name: string;
  email: string;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableSorting: true,
    meta: {
      pinned: "left",
      ellipsis: true,
      sort: { sortKey: "name" },
      filter: { searchKey: "name", type: "input" },
    },
  },
  { accessorKey: "email", header: "Email", meta: { ellipsis: true } },
];

<DataGrid rowKey="id" columns={columns} data={users} scroll={{ x: 1000, y: 420 }} />;
```

## 核心能力

### 远程排序、筛选、分页

`DataGrid` 不请求数据。远程场景由业务维护 `data/loading/total`，并在排序、筛选、分页回调里请求接口。

```tsx
<DataGrid
  rowKey="id"
  columns={columns}
  data={data}
  loading={loading}
  sorting={{ value: sorting, onChange: setSorting }}
  filtering={{ columnFilters, onColumnFiltersChange: setColumnFilters }}
  pagination={{
    page,
    pageSize,
    total,
    onChange: (nextPage, nextPageSize) => {
      setPage(nextPage);
      setPageSize(nextPageSize);
    },
  }}
/>
```

远程接口示例见 `apps/web-app/src/pages/(layouts)/components/table/-remote-data.tsx`，它使用 `apps/web-app/src/service/table.ts` 中的 `fetchUsers`。

### 本地排序、筛选、分页

本地模式需要显式开启。列上的 `enableSorting`、`enableColumnFilter`、`sortingFn`、`filterFn` 使用 TanStack Table 原生能力。

```tsx
<DataGrid
  rowKey="id"
  columns={columns}
  data={data}
  sorting={{ mode: "local" }}
  filtering={{ mode: "local" }}
  pagination={{ mode: "local", defaultPageSize: 10 }}
/>
```

### 行选择

`rowSelection` 参考 antd 精简，支持受控和非受控。

```tsx
<DataGrid
  rowKey="id"
  columns={columns}
  data={data}
  rowSelection={{
    selectedRowKeys,
    onChange: setSelectedRowKeys,
    checkStrictly: false,
    getCheckboxProps: (record) => ({ disabled: record.status === "left" }),
  }}
/>
```

`checkStrictly` 默认为 `true`。设为 `false` 时父子行选择会联动，并显示半选态。

### 展开和树表格

```tsx
<DataGrid
  rowKey="id"
  columns={columns}
  data={treeData}
  expandable={{
    getSubRows: (record) => record.children,
    expandedRowRender: (record) => <div>{record.name}</div>,
  }}
/>
```

树表格示例见 `-tree-table.tsx`，展开行示例见 `-expanding.tsx`。

### 固定、列宽和省略

列固定初始值放在 `column.meta.pinned`；运行时状态使用 `columnPinning`。

```tsx
const columns = [{ accessorKey: "name", header: "Name", meta: { pinned: "left", ellipsis: true } }];

<DataGrid
  rowKey="id"
  columns={columns}
  data={data}
  columnSizing={{ columnResizeMode: "onChange" }}
  columnPinning={{ value: columnPinning, onChange: setColumnPinning }}
/>;
```

### 事件和 DOM 属性

事件入口与 antd 保持一致，返回 DOM props。

```tsx
<DataGrid
  onRow={(record) => ({
    onDoubleClick: () => openDetail(record.id),
  })}
  onCell={(record, _index, ctx) => ({
    onClick: () => console.log(record.id, ctx.column.id),
  })}
  onHeaderCell={(column) => ({
    onDoubleClick: () => console.log(column.id),
  })}
  onScroll={(_, info) => console.log(info.scrollTop)}
/>
```

用户事件会先执行。如果用户调用 `event.preventDefault()`，内部默认行为会停止，例如内置右键菜单不会打开。

### 插槽

`components` 参考 antd。`components.body` 可以是对象，也可以是函数。函数模式代表完全接管 body 渲染，适合虚拟化。

```tsx
<DataGrid
  components={{
    body: ({ children }) => children,
  }}
/>
```

### 功能列顺序

内置的展开列和选择列，以及业务自己加的拖拽 handle 列，都属于功能列。功能列默认插在业务列最左侧，并在列固定开启时优先固定在业务固定列左边。

```tsx
<DataGrid
  rowKey="id"
  columns={columns}
  data={data}
  rowSelection={{}}
  expandable={{ getSubRows: (record) => record.children }}
  featureColumns={{
    order: ["__rap_data_grid_selection__", "__rap_data_grid_expand__", "__row_dnd_handle__"],
    columns: [rowDndHandleColumn],
  }}
/>
```

## 扩展能力

以下能力不内置到基础组件，但在 web-app demo 中提供参考实现：

- row order：`-row-order.tsx`
- column order：`-column-order.tsx`
- row dnd：`-row-dnd.tsx`
- column dnd：`-column-dnd.tsx`
- virtual：`-virtual.tsx`
- tree table：`-tree-table.tsx`
- editable cell：`-editable-cell.tsx`
- editable row：`-editable-row.tsx`
- infinite scroll：`-infinite.tsx`

扩展实现的原则是：DataGrid 只提供行、列、单元格和 body 的感知入口，业务自己维护低频能力需要的状态。
