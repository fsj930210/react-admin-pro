import { useRef, useState, type ReactNode } from "react";
import {
  Select,
  type SelectOption,
  type SelectRef,
} from "@rap/components-pro/select";
import { Badge } from "@rap/components-ui/badge";
import { Button } from "@rap/components-ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@rap/components-ui/card";
import { FieldDescription, FieldGroup, FieldLabel } from "@rap/components-ui/field";
import { createFileRoute } from "@tanstack/react-router";
import { MapPin, Search, Sparkles, User } from "lucide-react";

export const Route = createFileRoute("/(layouts)/components/select/")({
  component: RouteComponent,
});

type DemoOption = SelectOption<string> & {
  desc?: string;
};

const statusOptions: DemoOption[] = [
  { label: "Cancelled", value: "cancelled", desc: "任务已取消" },
  { label: "Closed", value: "closed", desc: "流程已关闭" },
  { label: "Communicated", value: "communicated", desc: "已完成沟通" },
  { label: "Identified", value: "identified", desc: "已定位问题" },
  { label: "Not Identified", value: "not-identified", desc: "待进一步排查" },
  { label: "Resolved", value: "resolved", desc: "问题已解决" },
];

const cityOptions: DemoOption[] = [
  { label: "杭州", value: "hangzhou", desc: "浙江" },
  { label: "上海", value: "shanghai", desc: "直辖市" },
  { label: "深圳", value: "shenzhen", desc: "广东" },
  { label: "北京", value: "beijing", desc: "直辖市" },
  { label: "成都", value: "chengdu", desc: "四川", disabled: true },
  { label: "苏州", value: "suzhou", desc: "江苏" },
];

const groupedOptions = [
  {
    label: "热门城市",
    options: cityOptions.slice(0, 3),
  },
  {
    label: "更多城市",
    options: cityOptions.slice(3),
  },
];

const memberOptions = [
  { label: "林一", value: "u1", raw: { role: "前端负责人" } },
  { label: "周南", value: "u2", raw: { role: "设计师" } },
  { label: "沈航", value: "u3", raw: { role: "产品经理" } },
  { label: "顾遥", value: "u4", raw: { role: "测试工程师" } },
];

const bigOptions = Array.from({ length: 500 }, (_, index) => ({
  label: `城市选项 ${index + 1}`,
  value: `city-${index + 1}`,
}));

function DemoSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-border/70 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function SingleSearchDemo() {
  const [value, setValue] = useState<string | null>("closed");
  const [selectedLabel, setSelectedLabel] = useState("Closed");

  return (
    <DemoSection
      title="单选搜索"
      description="打开时显示已选 label，但默认不按 label 过滤；用户一旦编辑才开始过滤。"
    >
      <FieldGroup className="space-y-3">
        <div className="space-y-2">
          <FieldLabel>状态</FieldLabel>
          <Select
            showSearch
            allowClear
            value={value}
            options={statusOptions}
            placeholder="请选择状态"
            prefix={<Search className="size-4" />}
            onChange={(nextValue, context) => {
              setValue((nextValue as string | null) ?? null);
              setSelectedLabel(String(context.selectedItem?.label ?? ""));
            }}
          />
        </div>
        <FieldDescription>当前值：{value ?? "空"}，当前项：{selectedLabel || "空"}</FieldDescription>
      </FieldGroup>
    </DemoSection>
  );
}

function MultipleDemo() {
  const [value, setValue] = useState<string[]>(["hangzhou", "shanghai"]);
  const [lastAction, setLastAction] = useState("初始化");

  return (
    <DemoSection
      title="多选"
      description="默认可搜索，已选项保留在下拉中，只做高亮和对勾，不会从列表里消失。"
    >
      <FieldGroup className="space-y-3">
        <div className="space-y-2">
          <FieldLabel>城市</FieldLabel>
          <Select
            mode="multiple"
            allowClear
            value={value}
            options={cityOptions}
            placeholder="请选择多个城市"
            maxTagCount={2}
            onChange={(nextValue, context) => {
              setValue((nextValue as string[]) ?? []);
              setLastAction(`${context.selected ? "选中" : "取消"} ${context.selectedItem?.label ?? ""}`);
            }}
          />
        </div>
        <FieldDescription>当前值：{value.join(", ") || "空"}，最近动作：{lastAction}</FieldDescription>
      </FieldGroup>
    </DemoSection>
  );
}

function TagsDemo() {
  const [value, setValue] = useState<string[]>(["react", "design"]);

  return (
    <DemoSection
      title="标签模式"
      description="输入后回车即可创建新标签；如果命中已有项，会优先选已有项。"
    >
      <FieldGroup className="space-y-3">
        <div className="space-y-2">
          <FieldLabel>技能标签</FieldLabel>
          <Select
            mode="tags"
            allowClear
            value={value}
            options={[
              { label: "react", value: "react" },
              { label: "typescript", value: "typescript" },
              { label: "design", value: "design" },
              { label: "motion", value: "motion" },
            ]}
            placeholder="输入后回车创建"
            prefix={<Sparkles className="size-4" />}
            onChange={(nextValue) => {
              setValue((nextValue as string[]) ?? []);
            }}
          />
        </div>
        <FieldDescription>当前值：{value.join(", ") || "空"}</FieldDescription>
      </FieldGroup>
    </DemoSection>
  );
}

function GroupDemo() {
  const [value, setValue] = useState<string | null>("hangzhou");

  return (
    <DemoSection
      title="分组"
      description="只支持一层 group，不做树形嵌套，后续树选择走独立的 TreeSelect。"
    >
      <FieldGroup className="space-y-3">
        <div className="space-y-2">
          <FieldLabel>分组城市</FieldLabel>
          <Select
            allowClear
            value={value}
            options={groupedOptions}
            placeholder="按分组选城市"
            onChange={(nextValue) => {
              setValue((nextValue as string | null) ?? null);
            }}
          />
        </div>
        <FieldDescription>当前值：{value ?? "空"}</FieldDescription>
      </FieldGroup>
    </DemoSection>
  );
}

function RemoteSearchDemo() {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(statusOptions);

  return (
    <DemoSection
      title="远程搜索"
      description="通过 showSearch + filterOption=false + onSearch 实现，组件不做本地过滤。"
    >
      <FieldGroup className="space-y-3">
        <div className="space-y-2">
          <FieldLabel>状态远程搜索</FieldLabel>
          <Select
            showSearch
            value={value}
            options={options}
            loading={loading}
            filterOption={false}
            placeholder="输入关键字触发远程搜索"
            prefix={<Search className="size-4" />}
            onSearch={(keyword) => {
              setLoading(true);
              window.setTimeout(() => {
                setOptions(
                  statusOptions.filter((item) =>
                    item.label.toLowerCase().includes(keyword.toLowerCase()),
                  ),
                );
                setLoading(false);
              }, 300);
            }}
            onChange={(nextValue) => {
              setValue((nextValue as string | null) ?? null);
            }}
          />
        </div>
        <FieldDescription>当前值：{value ?? "空"}</FieldDescription>
      </FieldGroup>
    </DemoSection>
  );
}

function RenderDemo() {
  const [value, setValue] = useState<string[]>(["u1"]);

  return (
    <DemoSection
      title="自定义渲染"
      description="验证 optionRender、tagRender 和 onChange context 中 selectedItems 的完整返回。"
    >
      <FieldGroup className="space-y-3">
        <div className="space-y-2">
          <FieldLabel>成员选择</FieldLabel>
          <Select
            mode="multiple"
            value={value}
            options={memberOptions}
            prefix={<User className="size-4" />}
            onChange={(nextValue) => {
              setValue((nextValue as string[]) ?? []);
            }}
            optionRender={(option) => (
              <div className="min-w-0">
                <div className="truncate font-medium">{option.label}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {(option.raw as { role?: string } | undefined)?.role}
                </div>
              </div>
            )}
            tagRender={({ option, onClose }) => (
              <Badge variant="outline" className="gap-1 rounded-lg px-2 py-1">
                <span>{option.label}</span>
                <button
                  type="button"
                  className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={onClose}
                >
                  ×
                </button>
              </Badge>
            )}
          />
        </div>
        <FieldDescription>当前值：{value.join(", ") || "空"}</FieldDescription>
      </FieldGroup>
    </DemoSection>
  );
}

function PlacementAndRefDemo() {
  const selectRef = useRef<SelectRef>(null);

  return (
    <DemoSection
      title="位置与方法"
      description="验证 placement 映射和对外暴露的 focus / blur 方法。"
    >
      <FieldGroup className="space-y-3">
        <div className="space-y-2">
          <FieldLabel>顶部展开</FieldLabel>
          <Select
            ref={selectRef}
            showSearch
            placement="topRight"
            options={cityOptions}
            prefix={<MapPin className="size-4" />}
            placeholder="从右上展开"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => selectRef.current?.focus()}>
            focus()
          </Button>
          <Button type="button" variant="outline" onClick={() => selectRef.current?.blur()}>
            blur()
          </Button>
        </div>
      </FieldGroup>
    </DemoSection>
  );
}

function VirtualDemo() {
  const [value, setValue] = useState<string | null>("city-12");

  return (
    <DemoSection
      title="虚拟滚动"
      description="使用 @tanstack/react-virtual 承接大数据列表，只影响渲染层，不影响值和搜索逻辑。"
    >
      <FieldGroup className="space-y-3">
        <div className="space-y-2">
          <FieldLabel>500 条数据</FieldLabel>
          <Select
            showSearch
            allowClear
            value={value}
            options={bigOptions}
            virtual
            listHeight={320}
            itemHeight={40}
            overscan={8}
            placeholder="搜索或滚动选择"
            onChange={(nextValue) => {
              setValue((nextValue as string | null) ?? null);
            }}
          />
        </div>
        <FieldDescription>当前值：{value ?? "空"}</FieldDescription>
      </FieldGroup>
    </DemoSection>
  );
}

function RouteComponent() {
  return (
    <div className="container mx-auto space-y-6 p-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">选择组件</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          这页是当前 Select 的交互验证页，重点覆盖单选搜索、多选、tags、分组、远程搜索、自定义渲染、位置控制和虚拟滚动。
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SingleSearchDemo />
        <MultipleDemo />
        <TagsDemo />
        <GroupDemo />
        <RemoteSearchDemo />
        <RenderDemo />
        <PlacementAndRefDemo />
        <VirtualDemo />
      </div>
    </div>
  );
}
