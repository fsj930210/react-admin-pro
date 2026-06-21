import { useState } from "react";
import { FormItem } from "@rap/components-pro/form";
import { Input } from "@rap/components-pro/input";
import { Search, SearchItem } from "@rap/components-pro/search";
import { Select } from "@rap/components-pro/select";
import { DemoCard, levelOptions, ResultPreview, type SearchValues, statusOptions } from "./-shared";

const inputFields = [
  ["owner", "Owner"],
  ["department", "Department"],
  ["region", "Region"],
  ["city", "City"],
  ["channel", "Channel"],
  ["tag", "Tag"],
  ["reviewer", "Reviewer"],
  ["priceRange", "Price range"],
] as const;

export function TwoRowCollapseDemo() {
  const [values, setValues] = useState<SearchValues>();
  return (
    <DemoCard
      title="Collapse after two rows"
      description="Two measured rows remain visible while every field stays mounted."
    >
      <Search<SearchValues>
        collapsedRows={2}
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
        <SearchItem>
          <FormItem name="level" label="Priority">
            <Select allowClear options={levelOptions} />
          </FormItem>
        </SearchItem>
        {inputFields.map(([name, label]) => (
          <SearchItem key={name}>
            <FormItem name={name} label={label}>
              <Input allowClear />
            </FormItem>
          </SearchItem>
        ))}
      </Search>
      <ResultPreview values={values} />
    </DemoCard>
  );
}
