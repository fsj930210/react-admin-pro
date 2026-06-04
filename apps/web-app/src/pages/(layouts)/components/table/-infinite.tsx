import { DataGrid } from "@rap/components-ui/data-grid";
import { useMemo, useState } from "react";
import { DemoTitle } from "./-basic";
import { createUserColumns } from "./-demo-columns";
import { createDemoUsers } from "./-demo-data";
import { VirtualBody } from "./-virtual";

export function InfiniteDataGridDemo() {
  const allData = useMemo(() => createDemoUsers(120), []);
  const [count, setCount] = useState(30);
  const columns = useMemo(() => createUserColumns(), []);
  const data = allData.slice(0, count);

  return (
    <section className="space-y-3">
      <DemoTitle
        title="Infinite + virtual extension"
        description="无限滚动配合虚拟 body：接近底部追加数据，只渲染视口附近的行。"
      />
      <DataGrid
        rowKey="id"
        columns={columns}
        data={data}
        scroll={{ x: 1300, y: 360 }}
        components={{
          body: ({ rows, scrollElement }) => (
            <VirtualBody rows={rows} scrollElement={scrollElement} />
          ),
        }}
        onScroll={(_, info) => {
          if (info.scrollTop > 240 && count < allData.length) {
            setCount((value) => Math.min(value + 20, allData.length));
          }
        }}
      />
    </section>
  );
}
