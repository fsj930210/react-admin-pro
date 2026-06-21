import { createFileRoute } from "@tanstack/react-router";
import { ColumnQueryDemo } from "./-column-query-demo";
import { ComplexQueryDemo } from "./-complex-query-demo";
import { ControlledDemo } from "./-controlled-demo";
import { RequestDemo } from "./-request-demo";
import { SearchToolbarDemo } from "./-search-toolbar-demo";
import { SideSearchDemo } from "./-side-search-demo";
import { ToolbarDemo } from "./-toolbar-demo";

export const Route = createFileRoute("/(layouts)/components/pro-data-grid/")({
  component: ProDataGridPage,
});

function ProDataGridPage() {
  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold">Pro DataGrid</h1>
        <p className="text-muted-foreground">
          在基础 DataGrid 之上统一远程请求、业务参数转换与常用工具栏。
        </p>
      </div>
      <RequestDemo />
      <ColumnQueryDemo />
      <ToolbarDemo />
      <SearchToolbarDemo />
      <SideSearchDemo />
      <ComplexQueryDemo />
      <ControlledDemo />
    </div>
  );
}
