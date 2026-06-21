import { useState } from "react";
import { DatePicker } from "@rap/components-pro/date-picker";
import { FormItem } from "@rap/components-pro/form";
import { Input } from "@rap/components-pro/input";
import { Search, SearchItem } from "@rap/components-pro/search";
import { Select } from "@rap/components-pro/select";
import {
  DemoCard,
  levelOptions,
  ResultPreview,
  type SearchValues,
  statusOptions,
  typeOptions,
} from "./-shared";

export function OneRowCollapseDemo() {
  const [values, setValues] = useState<SearchValues>();
  return (
    <DemoCard
      title="Collapse after one row"
      description="Additional rows collapse automatically as the container narrows."
    >
      <Search<SearchValues>
        collapsedRows={1}
        initialValues={{ keyword: "", status: "all", type: "normal" }}
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
          <FormItem name="createdAt" label="Created at">
            <DatePicker className="w-full" />
          </FormItem>
        </SearchItem>
      </Search>
      <ResultPreview values={values} />
    </DemoCard>
  );
}
