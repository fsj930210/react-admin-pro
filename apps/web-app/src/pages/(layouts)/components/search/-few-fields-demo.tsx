import { useState } from "react";
import { FormItem } from "@rap/components-pro/form";
import { Input } from "@rap/components-pro/input";
import { Search, SearchItem } from "@rap/components-pro/search";
import { Select } from "@rap/components-pro/select";
import { DemoCard, ResultPreview, type SearchValues, statusOptions } from "./-shared";

export function FewFieldsDemo() {
  const [values, setValues] = useState<SearchValues>();
  return (
    <DemoCard title="Few fields" description="One row of fields does not show a collapse action.">
      <Search<SearchValues>
        initialValues={{ keyword: "", status: "all" }}
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
