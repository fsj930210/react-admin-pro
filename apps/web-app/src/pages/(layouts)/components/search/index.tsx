import { useState, type ReactNode } from "react";
import { DatePicker, RangePicker } from "@rap/components-pro/date-picker";
import { FormItem } from "@rap/components-pro/form";
import { Input } from "@rap/components-pro/input";
import { Search, SearchItem } from "@rap/components-pro/search";
import { Select } from "@rap/components-pro/select";
import { Badge } from "@rap/components-ui/badge";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/(layouts)/components/search/")({
  component: RouteComponent,
});

type SearchValues = {
  channel?: string;
  city?: string;
  createdAt?: unknown;
  customCode?: string;
  department?: string;
  keyword?: string;
  level?: string;
  owner?: string;
  priceRange?: string;
  region?: string;
  reviewer?: string;
  status?: string;
  tag?: string;
  type?: string;
  updatedAt?: unknown;
};

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Enabled", value: "enabled" },
  { label: "Disabled", value: "disabled" },
];

const typeOptions = [
  { label: "Normal", value: "normal" },
  { label: "Custom", value: "custom" },
];

const levelOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

function DemoCard({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <section className="rounded-md border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function ResultPreview({ values }: { values?: SearchValues }) {
  if (!values) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
      {Object.entries(values).map(([key, value]) => (
        <span key={key} className="rounded border bg-muted/50 px-2 py-1">
          {key}: {value ? String(value) : "-"}
        </span>
      ))}
    </div>
  );
}

function FewFieldsDemo() {
  const [values, setValues] = useState<SearchValues>();

  return (
    <DemoCard title="Few fields" description="Actions stay close to the fields when one row is enough.">
      <Search<SearchValues>
        initialValues={{ keyword: "", status: "all" }}
        itemWidth={180}
        onSubmit={setValues}
        onReset={setValues}
      >
        <SearchItem>
          <FormItem name="keyword" label="Keyword">
            <Input allowClear />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="status" label="Status">
            <Select allowClear options={statusOptions} />
          </FormItem>
        </SearchItem>
      </Search>
      <ResultPreview values={values} />
    </DemoCard>
  );
}

function ManyFieldsDemo() {
  const [values, setValues] = useState<SearchValues>();

  return (
    <DemoCard
      title="Many fields"
      description="The field area collapses by measured rows. Fields stay mounted while collapsed."
    >
      <Search<SearchValues>
        initialValues={{
          channel: "",
          city: "",
          department: "",
          keyword: "",
          level: "",
          owner: "",
          priceRange: "",
          region: "",
          reviewer: "",
          status: "all",
          tag: "",
        }}
        itemWidth={200}
        onSubmit={setValues}
        onReset={setValues}
      >
        <SearchItem>
          <FormItem name="keyword" label="Keyword">
            <Input allowClear />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="status" label="Status">
            <Select allowClear options={statusOptions} />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="level" label="Priority">
            <Select allowClear options={levelOptions} />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="owner" label="Owner">
            <Input allowClear />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="department" label="Department">
            <Input allowClear />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="region" label="Region">
            <Input allowClear />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="city" label="City">
            <Input allowClear />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="channel" label="Channel">
            <Input allowClear />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="tag" label="Tag">
            <Input allowClear />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="reviewer" label="Reviewer">
            <Input allowClear />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="priceRange" label="Price range">
            <Input allowClear />
          </FormItem>
        </SearchItem>
      </Search>
      <ResultPreview values={values} />
    </DemoCard>
  );
}

function NoCollapseDemo() {
  const [values, setValues] = useState<SearchValues>();

  return (
    <DemoCard
      title="Collapse disabled"
      description="The collapse feature can be disabled when a side filter panel is a better fit."
    >
      <Search<SearchValues>
        actionsLayout="newline"
        collapsible={false}
        initialValues={{ keyword: "", owner: "", status: "all", type: "normal" }}
        itemWidth={200}
        onSubmit={setValues}
        onReset={setValues}
      >
        <SearchItem>
          <FormItem name="keyword" label="Keyword">
            <Input allowClear />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="status" label="Status">
            <Select allowClear options={statusOptions} />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="type" label="Type">
            <Select options={typeOptions} />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="owner" label="Owner">
            <Input allowClear />
          </FormItem>
        </SearchItem>
      </Search>
      <ResultPreview values={values} />
    </DemoCard>
  );
}

function DependencyDemo() {
  const [values, setValues] = useState<SearchValues>();

  return (
    <DemoCard
      title="Dependent fields"
      description="Choosing Custom adds a field and the collapse measurement updates from the DOM."
    >
      <Search<SearchValues>
        initialValues={{ keyword: "", status: "all", type: "normal" }}
        itemWidth={200}
        onSubmit={setValues}
        onReset={setValues}
      >
        <SearchItem>
          <FormItem name="keyword" label="Keyword">
            <Input allowClear />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="type" label="Type">
            <Select options={typeOptions} />
          </FormItem>
        </SearchItem>
        <SearchItem>
          <FormItem name="status" label="Status">
            <Select allowClear options={statusOptions} />
          </FormItem>
        </SearchItem>
        <FormItem<SearchValues> dependencies={["type"]}>
          {({ getFieldValue }) =>
            getFieldValue("type") === "custom" ? (
              <SearchItem>
                <FormItem name="customCode" label="Custom code">
                  <Input allowClear />
                </FormItem>
              </SearchItem>
            ) : null
          }
        </FormItem>
        <SearchItem>
          <FormItem name="createdAt" label="Created at">
            <DatePicker className="w-full" />
          </FormItem>
        </SearchItem>
        <SearchItem span={2}>
          <FormItem name="updatedAt" label="Updated range">
            <RangePicker className="w-full" />
          </FormItem>
        </SearchItem>
      </Search>
      <ResultPreview values={values} />
    </DemoCard>
  );
}

function RouteComponent() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Search</h1>
          <Badge variant="secondary">TanStack Form</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          A reusable list filter container for submit, reset, actions, and optional collapse.
        </p>
      </div>

      <FewFieldsDemo />
      <ManyFieldsDemo />
      <NoCollapseDemo />
      <DependencyDemo />
    </div>
  );
}
