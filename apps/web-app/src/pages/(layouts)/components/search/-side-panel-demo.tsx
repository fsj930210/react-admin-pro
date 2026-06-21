import { useState } from "react";
import { DatePicker } from "@rap/components-pro/date-picker";
import { FormItem } from "@rap/components-pro/form";
import { Input } from "@rap/components-pro/input";
import { Search, SearchItem } from "@rap/components-pro/search";
import { Select } from "@rap/components-pro/select";
import { DemoCard, levelOptions, ResultPreview, type SearchValues, statusOptions } from "./-shared";

export function SidePanelDemo() {
  const [values, setValues] = useState<SearchValues>();

  return (
    <DemoCard
      title="Left filter panel"
      description="The same Search uses one grid column and keeps its actions at the bottom."
    >
      <div className="grid min-h-96 overflow-hidden rounded-md border lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b bg-muted/20 p-4 lg:border-r lg:border-b-0">
          <Search<SearchValues>
            collapsible={false}
            contentClassName="min-h-80"
            fieldsClassName="grid-cols-1"
            initialValues={{ keyword: "", level: "", status: "all" }}
            itemMinWidth={0}
            labelAlign="left"
            labelWidth={80}
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
              <FormItem name="createdAt" label="Created at">
                <DatePicker className="w-full" />
              </FormItem>
            </SearchItem>
          </Search>
        </aside>
        <div className="flex min-h-64 items-center justify-center p-6 text-sm text-muted-foreground">
          Results area
        </div>
      </div>
      <ResultPreview values={values} />
    </DemoCard>
  );
}
