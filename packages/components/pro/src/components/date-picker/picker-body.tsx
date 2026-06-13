import type { ReactNode } from "react";
import { DatePanel } from "./panels/date-panel";
import { MonthPicker } from "./panels/month-picker";
import { QuarterPicker } from "./panels/quarter-picker";
import { YearPicker } from "./panels/year-picker";
import type { Dayjs, MultipleValue, PickerCellRenderInfo, PickerMode, PickerPanelMode, RangeValue } from "./types";

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

const PANEL_VIEW_MAP = {
  year: YearPicker,
  month: MonthPicker,
  quarter: QuarterPicker,
  date: DatePanel,
} as const;

function PickerBody(props: PickerBodyProps) {
  const PanelView = PANEL_VIEW_MAP[props.panelMode];
  return <PanelView {...props} />;
}

export { PickerBody };
