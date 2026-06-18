import { Form, FormItem } from "@rap/components-pro/form";
import { Input } from "@rap/components-pro/input";
import { Button } from "@rap/components-ui/button";
import type { ReactNode } from "react";

import { DemoSection } from "./-demo-section";

function DemoBlock({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="grid gap-3 rounded-md border p-4">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {children}
    </div>
  );
}

function SubmitAction({ text = "Submit" }: { text?: string }) {
  return (
    <div className="col-start-2">
      <Button type="submit">{text}</Button>
    </div>
  );
}

export function LayoutDemo() {
  return (
    <DemoSection title="Layout Props">
      <div className="grid gap-5">
        <DemoBlock title='layout="vertical"'>
          <Form
            className="max-w-xl"
            initialValues={{
              name: "",
              longLabel: "",
            }}
          >
            <FormItem name="name" label="Normal label" required>
              <Input />
            </FormItem>
            <FormItem name="longLabel" label="A super long label text" required>
              <Input />
            </FormItem>
            <Button type="submit" className="w-fit">
              Submit
            </Button>
          </Form>
        </DemoBlock>

        <DemoBlock title='layout="horizontal" labelAlign="left"'>
          <Form
            layout="horizontal"
            labelAlign="left"
            className="max-w-xl"
            initialValues={{
              normal: "",
              long: "",
              optional: "",
            }}
          >
            <FormItem name="normal" label="Normal label" required>
              <Input />
            </FormItem>
            <FormItem name="long" label="A super long label text" required>
              <Input />
            </FormItem>
            <FormItem name="optional" label="Optional label">
              <Input />
            </FormItem>
            <SubmitAction />
          </Form>
        </DemoBlock>

        <DemoBlock title='layout="horizontal" labelAlign="right"'>
          <Form
            layout="horizontal"
            labelAlign="right"
            className="max-w-xl"
            initialValues={{
              normal: "",
              long: "",
              optional: "",
            }}
          >
            <FormItem name="normal" label="Normal label" required>
              <Input />
            </FormItem>
            <FormItem name="long" label="A super long label text" required>
              <Input />
            </FormItem>
            <FormItem name="optional" label="Optional label">
              <Input />
            </FormItem>
            <SubmitAction />
          </Form>
        </DemoBlock>

        <div className="grid gap-5 xl:grid-cols-2">
          <DemoBlock title="labelWrap={true}: long label wraps in the label column">
            <Form
              layout="horizontal"
              labelAlign="right"
              labelWrap
              initialValues={{
                organizationPath: "",
                owner: "",
              }}
            >
              <FormItem
                name="organizationPath"
                label="Organization full path with a very very long label"
                required
              >
                <Input />
              </FormItem>
              <FormItem name="owner" label="Owner">
                <Input />
              </FormItem>
              <SubmitAction />
            </Form>
          </DemoBlock>

          <DemoBlock title="labelWrap={false}: long label stays on one line">
            <Form
              layout="horizontal"
              labelAlign="right"
              labelWrap={false}
              initialValues={{
                organizationPath: "",
                owner: "",
              }}
            >
              <FormItem
                name="organizationPath"
                label="Organization full path with a very very long label"
                required
              >
                <Input />
              </FormItem>
              <FormItem name="owner" label="Owner">
                <Input />
              </FormItem>
              <SubmitAction />
            </Form>
          </DemoBlock>
        </div>

        <DemoBlock title="requiredMark={false}: required fields do not render the red mark">
          <Form
            layout="horizontal"
            labelAlign="right"
            requiredMark={false}
            className="max-w-xl"
            initialValues={{
              username: "",
              password: "",
            }}
          >
            <FormItem name="username" label="Username" required>
              <Input />
            </FormItem>
            <FormItem name="password" label="Password" required>
              <Input />
            </FormItem>
            <SubmitAction />
          </Form>
        </DemoBlock>

        <DemoBlock title='layout="inline": filter/search style with flex wrap and centered actions'>
          <Form
            layout="inline"
            labelAlign="left"
            initialValues={{
              keyword: "",
              status: "",
              owner: "",
              createdAt: "",
            }}
          >
            <FormItem name="keyword" label="Keyword">
              <Input className="w-48" />
            </FormItem>
            <FormItem name="status" label="Status">
              <Input className="w-40" />
            </FormItem>
            <FormItem name="owner" label="Owner">
              <Input className="w-40" />
            </FormItem>
            <FormItem name="createdAt" label="Created at">
              <Input className="w-44" />
            </FormItem>
            <Button type="submit">Search</Button>
          </Form>
        </DemoBlock>

        <DemoBlock title="Responsive inline: same form in wide and narrow containers">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            {["Wide container", "Narrow container"].map((title) => (
              <div key={title} className="grid gap-3 rounded-md border p-4">
                <div className="text-xs font-medium text-muted-foreground">{title}</div>
                <Form
                  layout="inline"
                  labelAlign="left"
                  initialValues={{
                    keyword: "",
                    status: "",
                    owner: "",
                  }}
                >
                  <FormItem name="keyword" label="Keyword">
                    <Input className="w-48" />
                  </FormItem>
                  <FormItem name="status" label="Status">
                    <Input className="w-40" />
                  </FormItem>
                  <FormItem name="owner" label="Owner">
                    <Input className="w-40" />
                  </FormItem>
                  <Button type="submit">Search</Button>
                </Form>
              </div>
            ))}
          </div>
        </DemoBlock>
      </div>
    </DemoSection>
  );
}
