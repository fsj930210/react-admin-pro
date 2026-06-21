import { useState } from "react";
import { DatePicker, RangePicker } from "@rap/components-pro/date-picker";
import { FormItem } from "@rap/components-pro/form";
import { Input } from "@rap/components-pro/input";
import { Search, SearchItem } from "@rap/components-pro/search";
import { Select } from "@rap/components-pro/select";
import { DemoCard, ResultPreview, type SearchValues, statusOptions, typeOptions } from "./-shared";

export function DependencyDemo() {
  const [values, setValues] = useState<SearchValues>();
  return (
    <DemoCard
      title="Dependent fields"
      description="Choosing Custom adds a field and refreshes collapse measurement."
    >
      <Search<SearchValues>
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
        <SearchItem>
          <FormItem name="updatedAt" label="Updated range">
            <RangePicker className="w-full" />
          </FormItem>
        </SearchItem>
      </Search>
      <ResultPreview values={values} />
    </DemoCard>
  );
}
