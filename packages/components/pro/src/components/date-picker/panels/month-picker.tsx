import { cn } from "@rap/utils";
import type { ReactNode } from "react";
import { PickerCell } from "../picker-cell";
import type { Dayjs, PickerCellRenderInfo, PickerMode, RangeValue } from "../types";
import { buildMonthCellInfos } from "../utils";

interface MonthPickerProps {
  pickerMode: PickerMode;
  viewDate: Dayjs;
  value: Dayjs | RangeValue | null;
  disabledDate?: (current: Dayjs, info: { from?: Dayjs; type: PickerMode }) => boolean;
  renderCell?: (info: PickerCellRenderInfo) => ReactNode;
  onSelect: (date: Dayjs) => void;
  className?: string;
}

function MonthPicker(props: MonthPickerProps) {
  const { pickerMode, viewDate, value, disabledDate, renderCell, onSelect, className } = props;
  const cellInfos = buildMonthCellInfos(viewDate, value, pickerMode, disabledDate, onSelect);

  return (
    <div className={cn("grid grid-cols-3 gap-y-3 px-3 py-4", className)}>
      {cellInfos.map(({ key, info }) => {
        return renderCell ? (
          <div key={key} className="flex justify-center">
            {renderCell(info)}
          </div>
        ) : (
          <div key={key} className="flex justify-center">
            <PickerCell info={info} className="h-8 w-16 rounded-md" />
          </div>
        );
      })}
    </div>
  );
}

export { MonthPicker };
