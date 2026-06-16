import {
  CheckboxGroup,
  CheckboxGroupDescription,
  CheckboxGroupItem,
  CheckboxGroupLabel,
  CheckboxGroupList,
  CheckboxGroupMessage,
} from "@rap/components-ui/checkbox-group";
import { Button } from "@rap/components-ui/button";
import { Checkbox } from "@rap/components-ui/checkbox";
import {
  Editable,
  EditableArea,
  EditableCancel,
  EditableInput,
  EditablePreview,
  EditableSubmit,
  EditableToolbar,
  EditableTrigger,
} from "@rap/components-ui/editable";
import {
  FileUpload,
  FileUploadClear,
  FileUploadDropzone,
  FileUploadList,
  FileUploadTrigger,
} from "@rap/components-ui/file-upload";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@rap/components-ui/field";
import { Form, FormControl, FormField } from "@rap/components-ui/form";
import { Input } from "@rap/components-ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@rap/components-ui/input-group";
import { Label } from "@rap/components-ui/label";
import { MaskInput } from "@rap/components-ui/mask-input";
import { RadioGroup, RadioGroupItem } from "@rap/components-ui/radio-group";
import { Rating, RatingItem } from "@rap/components-ui/rating";
import { Switch } from "@rap/components-ui/switch";
import {
  TagsInput,
  TagsInputClear,
  TagsInputInput,
  TagsInputItem,
  TagsInputLabel,
  TagsInputList,
} from "@rap/components-ui/tags-input";
import { Textarea } from "@rap/components-ui/textarea";
import {
  TimePicker,
  TimePickerClear,
  TimePickerContent,
  TimePickerHour,
  TimePickerInput,
  TimePickerInputGroup,
  TimePickerMinute,
  TimePickerPanel,
  TimePickerSeparator,
  TimePickerTrigger,
} from "@rap/components-ui/time-picker";
import { Toggle } from "@rap/components-ui/toggle";
import { ToggleGroup, ToggleGroupItem } from "@rap/components-ui/toggle-group";
import { VisuallyHiddenInput } from "@rap/components-ui/visually-hidden-input";
import { useForm } from "@tanstack/react-form";
import { useRef } from "react";

export function FormControlsDemo() {
  const hiddenControlRef = useRef<HTMLButtonElement>(null);
  const form = useForm({
    defaultValues: {
      title: "Component review",
    },
    onSubmit: ({ value }) => value,
  });

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Form
        form={form}
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <FormField
          name="title"
          label="Review title"
          description="This field is rendered through the shared Form wrapper."
          render={({ field }) => (
            <FormControl>
              <Input
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
            </FormControl>
          )}
        />
      </Form>

      <FieldSet>
        <FieldLegend>Field primitives</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel>Reviewer</FieldLabel>
            <FieldContent>
              <FieldTitle>Alex Morgan</FieldTitle>
              <FieldDescription>Field content supports compact metadata blocks.</FieldDescription>
            </FieldContent>
          </Field>
          <FieldSeparator>or</FieldSeparator>
          <Field data-invalid>
            <FieldLabel>Fallback reviewer</FieldLabel>
            <Input aria-invalid placeholder="Required reviewer" />
            <FieldError>Reviewer is required before publishing.</FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>

      <Editable defaultValue="Quarterly billing review">
        <EditableArea>
          <EditablePreview className="rounded-md border px-3 py-2" />
          <EditableInput className="rounded-md border px-3 py-2" />
        </EditableArea>
        <EditableToolbar className="mt-2 flex gap-2">
          <EditableTrigger asChild>
            <Button size="sm" variant="outline">
              Edit
            </Button>
          </EditableTrigger>
          <EditableSubmit asChild>
            <Button size="sm">Save</Button>
          </EditableSubmit>
          <EditableCancel asChild>
            <Button size="sm" variant="outline">
              Cancel
            </Button>
          </EditableCancel>
        </EditableToolbar>
      </Editable>

      <FileUpload accept="image/*" maxFiles={2}>
        <FileUploadDropzone className="rounded-md border border-dashed p-4 text-center text-sm">
          Drop screenshots here
        </FileUploadDropzone>
        <div className="mt-2 flex gap-2">
          <FileUploadTrigger asChild>
            <Button size="sm" variant="outline">
              Select
            </Button>
          </FileUploadTrigger>
          <FileUploadClear asChild>
            <Button size="sm" variant="ghost">
              Clear
            </Button>
          </FileUploadClear>
        </div>
        <FileUploadList className="mt-2" />
      </FileUpload>

      <div className="flex flex-col gap-3">
        <Label htmlFor="plain-input">Contact</Label>
        <Input id="plain-input" placeholder="Alex Morgan" />
        <MaskInput mask="phone" placeholder="Phone" />
        <Textarea placeholder="Review notes" />
        <TimePicker defaultValue="09:30">
          <TimePickerInputGroup>
            <TimePickerInput segment="hour" />
            <TimePickerSeparator />
            <TimePickerInput segment="minute" />
            <TimePickerTrigger />
            <TimePickerClear />
          </TimePickerInputGroup>
          <TimePickerContent>
            <TimePickerPanel>
              <TimePickerHour />
              <TimePickerMinute />
            </TimePickerPanel>
          </TimePickerContent>
        </TimePicker>
      </div>

      <div className="flex flex-col gap-4">
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="admin.example.com" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton size="xs">Open</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        <InputGroup>
          <InputGroupTextarea placeholder="Paste component review notes" />
        </InputGroup>
        <TagsInput defaultValue={["forms", "review"]}>
          <TagsInputLabel>Tags</TagsInputLabel>
          <TagsInputList>
            <TagsInputItem value="forms">forms</TagsInputItem>
            <TagsInputItem value="review">review</TagsInputItem>
            <TagsInputInput placeholder="Add tag" />
          </TagsInputList>
          <TagsInputClear asChild>
            <Button size="sm" variant="outline">
              Clear tags
            </Button>
          </TagsInputClear>
        </TagsInput>
      </div>

      <div className="flex flex-col gap-4 lg:col-span-2">
        <Rating defaultValue={3.5} step={0.5} max={5}>
          {Array.from({ length: 5 }, (_, index) => (
            <RatingItem key={index} index={index} />
          ))}
        </Rating>
        <div className="flex flex-wrap items-center gap-3">
          <Checkbox defaultChecked />
          <RadioGroup defaultValue="email" className="flex">
            <RadioGroupItem value="email" />
            <RadioGroupItem value="sms" />
          </RadioGroup>
          <Switch defaultChecked />
          <Toggle defaultPressed>Pinned</Toggle>
          <ToggleGroup variant="outline" type="single" defaultValue="all">
            <ToggleGroupItem value="all" aria-label="Toggle all">
              All
            </ToggleGroupItem>
            <ToggleGroupItem value="missed" aria-label="Toggle missed">
              Missed
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <CheckboxGroup defaultValue={["read"]}>
          <CheckboxGroupLabel>Permissions</CheckboxGroupLabel>
          <CheckboxGroupList>
            <CheckboxGroupItem value="read">Read</CheckboxGroupItem>
            <CheckboxGroupItem value="write">Write</CheckboxGroupItem>
          </CheckboxGroupList>
          <CheckboxGroupDescription>
            Select the access this reviewer needs.
          </CheckboxGroupDescription>
          <CheckboxGroupMessage />
        </CheckboxGroup>
        <Button ref={hiddenControlRef} type="button" variant="outline">
          Hidden native input target
        </Button>
        <VisuallyHiddenInput
          control={hiddenControlRef.current}
          name="hidden-review-state"
          value="ready"
        />
      </div>
    </div>
  );
}
