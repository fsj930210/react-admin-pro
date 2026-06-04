import { DataGrid } from "@rap/components-ui/data-grid";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { type ApiUser, type FetchUsersParams, fetchUsers, type User } from "@/service/table";
import { DemoTitle } from "./-basic";
import { createRemoteUserColumns } from "./-demo-columns";

interface RequestRemoteUsersOptions {
  columnFilters: ColumnFiltersState;
  page: number;
  pageSize: number;
  sorting: SortingState;
}

interface RequestRemoteUsersResult {
  data: User[];
  total: number;
}

function toUser(record: ApiUser): User {
  const { user_id, ...rest } = record;
  return {
    ...rest,
    id: user_id,
  };
}

async function requestRemoteUsers({
  columnFilters,
  page,
  pageSize,
  sorting,
}: RequestRemoteUsersOptions): Promise<RequestRemoteUsersResult> {
  const params: FetchUsersParams = {
    page,
    pageSize,
    sortFields: sorting.map((item) => ({ field: item.id, order: item.desc ? "desc" : "asc" })),
    filters: Object.fromEntries(columnFilters.map((item) => [item.id, item.value])),
  };
  const firstFilter = columnFilters[0];
  if (firstFilter) {
    params.filterField = firstFilter.id;
    params.filterValue = String(firstFilter.value ?? "");
  }

  const response = await fetchUsers(params);

  return {
    data: response.data.data.map(toUser),
    total: response.data.pagination.total,
  };
}

export function RemoteDataGridDemo() {
  const columns = useMemo(() => createRemoteUserColumns(), []);
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  useEffect(() => {
    let ignore = false;

    setLoading(true);
    requestRemoteUsers({ columnFilters, page, pageSize, sorting })
      .then((response) => {
        if (ignore) return;
        setData(response.data);
        setTotal(response.total);
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [columnFilters, page, pageSize, sorting]);

  return (
    <section className="space-y-3">
      <DemoTitle
        title="Remote data"
        description="使用 service/table.ts 的 fetchUsers，DataGrid 只负责状态回调。"
      />
      <DataGrid
        rowKey="id"
        columns={columns}
        data={data}
        loading={loading}
        scroll={{ x: 1300, y: 420 }}
        columnSizing={{}}
        sorting={{ value: sorting, onChange: setSorting }}
        filtering={{ columnFilters, onColumnFiltersChange: setColumnFilters }}
        pagination={{
          page,
          pageSize,
          total,
          showSizeChanger: true,
          onChange: (nextPage, nextPageSize) => {
            setPage(nextPage);
            setPageSize(nextPageSize);
          },
          showTotal: (count) => `共 ${count} 条`,
        }}
      />
    </section>
  );
}
