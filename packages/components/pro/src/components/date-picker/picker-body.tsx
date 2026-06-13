import type { ReactNode } from "react";
import { DatePanel } from "./panels/date-panel";
import { MonthPicker } from "./panels/month-picker";
import { QuarterPicker } from "./panels/quarter-picker";
import { YearPicker } from "./panels/year-picker";
import type {
  Dayjs,
  MultipleValue,
  PickerCellRenderInfo,
  PickerMode,
  PickerPanelMode,
  RangeValue,
} from "./types";

interface PickerBodyProps {
  pickerMode: PickerMode;
  panelMode: PickerPanelMode;
  viewDate: Dayjs;
  value: Dayjs | RangeValue | MultipleValue | null;
  multiple?: boolean;
  hoverValue?: Dayjs | null;
  disabledDate?: (current: Dayjs, info: { from?: Dayjs; type: PickerMode }) => boolean;
  renderCell?: (info: PickerCellRenderInfo) => ReactNode;
  onSelect: (date: Dayjs) => void;
  onHover?: (date: Dayjs | null) => void;
  className?: string;
}

function PickerBody(props: PickerBodyProps) {
  if (props.panelMode === "date") {
    return <DatePanel {...props} />;
  }

  const value = props.multiple ? null : (props.value as Dayjs | RangeValue | null);

  if (props.panelMode === "year") {
    return <YearPicker {...props} value={value} />;
  }

  if (props.panelMode === "month") {
    return <MonthPicker {...props} value={value} />;
  }

  return <QuarterPicker {...props} value={value} />;
}

export { PickerBody };
