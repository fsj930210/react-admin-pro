import { useState } from "react";
import { Filter } from "lucide-react";
import { DatePicker, RangePicker } from "@rap/components-pro/date-picker";
import { FormItem } from "@rap/components-pro/form";
import { Input } from "@rap/components-pro/input";
import { Search, SearchItem } from "@rap/components-pro/search";
import { Select } from "@rap/components-pro/select";
import { Button } from "@rap/components-ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@rap/components-ui/drawer";
import { DemoCard, levelOptions, type SearchValues, statusOptions } from "./-shared";

export function DrawerDemo() {
  const [values, setValues] = useState<SearchValues>();

  return (
    <DemoCard
      title="Drawer filter"
      description="Search stays layout-agnostic while the Drawer owns placement and visibility."
    >
      <div className="flex items-center justify-between gap-4 rounded-md border bg-muted/20 p-4">
        <div className="text-sm text-muted-foreground">
          {values ? "Filters have been applied." : "Open the drawer to configure filters."}
        </div>
        <Drawer direction="right">
          <DrawerTrigger asChild>
            <Button variant="outline">
              <Filter />
              Open filters
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="border-b">
              <DrawerTitle>Filters</DrawerTitle>
              <DrawerDescription>
                Refine the result list with multiple field types.
              </DrawerDescription>
            </DrawerHeader>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              <Search<SearchValues>
                actionsClassName="sticky bottom-0 mt-auto border-t bg-background py-4"
                className="h-full"
                collapsible={false}
                contentClassName="h-full"
                fieldsClassName="grid-cols-1"
                initialValues={{ keyword: "", level: "", status: "all" }}
                itemMinWidth={0}
                labelAlign="left"
                labelWidth={88}
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
                <SearchItem>
                  <FormItem name="updatedAt" label="Date range">
                    <RangePicker className="w-full" />
                  </FormItem>
                </SearchItem>
              </Search>
            </div>
          </DrawerContent>
        </Drawer>
      </div>
    </DemoCard>
  );
}
