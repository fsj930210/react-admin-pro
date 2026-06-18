import { type ComponentProps, type ReactNode } from "react";
import type dayjs from "dayjs";

export type Dayjs = dayjs.Dayjs;

export type PickerMode = "date" | "week" | "month" | "quarter" | "year" | "time" | "datetime";
export type PickerPanelMode = "date" | "month" | "year" | "quarter";
export type PickerValueType = "single" | "range";
export type PickerFooterActions = false | { today?: boolean; clear?: boolean };

export type RangeValue = [Dayjs | null, Dayjs | null] | null;
export type MultipleValue = Dayjs[];

export interface PickerPreset {
  label: ReactNode;
  value: Dayjs | [Dayjs, Dayjs] | (() => Dayjs | [Dayjs, Dayjs]);
  disabled?: boolean;
}

export interface PickerCellRenderInfo {
  date: Dayjs;
  text: string;
  type: PickerMode;
  selected: boolean;
  disabled: boolean;
  today: boolean;
  inView: boolean;
  rangeStart?: boolean;
  rangeEnd?: boolean;
  rangeMiddle?: boolean;
  hover?: boolean;
  onSelect: () => void;
}

export interface PickerPanelContext {
  mode: PickerValueType;
  pickerMode: PickerMode;
  panelMode: PickerPanelMode;
  viewDate: Dayjs;
  value: Dayjs | RangeValue | MultipleValue | null;
  hoverValue?: Dayjs;
  activeRangePart?: "start" | "end";
  selectDate: (date: Dayjs) => void;
  setPanelMode: (mode: PickerPanelMode) => void;
  setViewDate: (date: Dayjs) => void;
  close: () => void;
}

interface BasePickerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  readOnly?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  icon?: ReactNode;
  footer?: ReactNode | ((context: PickerPanelContext) => ReactNode) | null;
  footerActions?: PickerFooterActions;
  className?: string;
  inputClassName?: string;
  "aria-invalid"?: boolean | "true" | "false";
  popupClassName?: string;
  panelClassName?: string;
  onClear?: () => void;
}

export interface DatePickerProps extends BasePickerProps {
  value?: Dayjs | MultipleValue | null;
  defaultValue?: Dayjs | MultipleValue | null;
  onChange?: (value: Dayjs | MultipleValue | null) => void;
  multiple?: boolean;
  mode?: Exclude<PickerMode, "time" | "datetime">;
  format?: string | string[];
  placeholder?: string;
  allowClear?: boolean;
  disabledDate?: (current: Dayjs, info: { from?: Dayjs; type: PickerMode }) => boolean;
  presets?: PickerPreset[];
  renderCell?: (info: PickerCellRenderInfo) => ReactNode;
  renderPanel?: (panel: ReactNode, context: PickerPanelContext) => ReactNode;
  onSelect?: (value: Dayjs | MultipleValue | null) => void;
  onPanelChange?: (panelMode: PickerPanelMode, viewDate: Dayjs) => void;
}

export interface RangePickerProps extends BasePickerProps {
  value?: RangeValue;
  defaultValue?: RangeValue;
  onChange?: (value: RangeValue) => void;
  mode?: Exclude<PickerMode, "time" | "datetime">;
  format?: string | string[];
  placeholder?: [string, string];
  separator?: ReactNode;
  allowClear?: boolean;
  allowEmpty?: [boolean, boolean];
  order?: boolean;
  disabledDate?: (current: Dayjs, info: { from?: Dayjs; type: PickerMode }) => boolean;
  presets?: PickerPreset[];
  renderCell?: (info: PickerCellRenderInfo) => ReactNode;
  renderPanel?: (panel: ReactNode, context: PickerPanelContext) => ReactNode;
  onCalendarChange?: (value: RangeValue) => void;
  onSelect?: (value: RangeValue) => void;
  onPanelChange?: (panelMode: PickerPanelMode, viewDate: Dayjs) => void;
}

export interface DateTimePickerProps extends BasePickerProps {
  value?: Dayjs | null;
  defaultValue?: Dayjs | null;
  onChange?: (value: Dayjs | null) => void;
  format?: string | string[];
  placeholder?: string;
  showTime?: boolean | ComponentProps<"div">;
  allowClear?: boolean;
  disabledDate?: (current: Dayjs, info: { from?: Dayjs; type: PickerMode }) => boolean;
  disabledTime?: (current: Dayjs) => {
    disabledHours?: () => number[];
    disabledMinutes?: (hour: number) => number[];
    disabledSeconds?: (hour: number, minute: number) => number[];
  };
  renderCell?: (info: PickerCellRenderInfo) => ReactNode;
  renderPanel?: (panel: ReactNode, context: PickerPanelContext) => ReactNode;
  onSelect?: (value: Dayjs | null) => void;
  onPanelChange?: (panelMode: PickerPanelMode, viewDate: Dayjs) => void;
}
