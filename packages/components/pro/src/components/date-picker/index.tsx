import dayjs from "dayjs";

export type DateValue = dayjs.Dayjs | null;
export type DateRangeValue = [dayjs.Dayjs, dayjs.Dayjs];
export type ChangeMode = "change" | "confirm";
export type Picker = "date" | "week" | "month" | "quarter" | "year";

export interface DatePickerProps {
  value?: DateValue;
  defaultValue?: DateValue;
  placeholder?: string;
  format?: string;
  className?: string;
  allowClear?: boolean;
  onChange?: (value: DateValue) => void;
  disabled?: boolean;
  disabledDate?: (currentDate: dayjs.Dayjs, info: { from?: dayjs.Dayjs; type: Picker }) => boolean;
}
