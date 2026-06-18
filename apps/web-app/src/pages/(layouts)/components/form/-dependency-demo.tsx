import { Form, FormItem } from "@rap/components-pro/form";
import { Input } from "@rap/components-pro/input";
import { Button } from "@rap/components-ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@rap/components-ui/select";

import { DemoSection } from "./-demo-section";

const cityMap: Record<string, string[]> = {
  zhejiang: ["Hangzhou", "Ningbo", "Wenzhou"],
  jiangsu: ["Nanjing", "Suzhou", "Wuxi"],
};

type LocationValues = {
  province: string;
  city: string;
  address: string;
};

export function DependencyDemo() {
  return (
    <DemoSection title="Dependency">
      <Form<LocationValues>
        layout="horizontal"
        className="max-w-xl"
        initialValues={{
          province: "zhejiang",
          city: "",
          address: "",
        }}
      >
        <FormItem name="province" label="Province" trigger="onValueChange">
          {({ field, form }) => (
            <Select
              value={field.state.value}
              onValueChange={(value) => {
                field.handleChange(value);
                form.setFieldValue("city", "");
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zhejiang">Zhejiang</SelectItem>
                <SelectItem value="jiangsu">Jiangsu</SelectItem>
              </SelectContent>
            </Select>
          )}
        </FormItem>

        <FormItem
          name="city"
          label="City"
          dependencies={["province"]}
          trigger="onValueChange"
        >
          {({ field, getFieldValue }) => {
            const province = String(getFieldValue("province") ?? "");
            const cities = cityMap[province] ?? [];

            return (
              <Select value={field.state.value} onValueChange={field.handleChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }}
        </FormItem>

        <FormItem name="address" label="Address">
          <Input />
        </FormItem>
        <Button type="submit" className="w-fit">
          Save
        </Button>
      </Form>
    </DemoSection>
  );
}
