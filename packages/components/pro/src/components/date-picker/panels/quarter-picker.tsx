import { cn } from "@rap/utils";
import type { ReactNode } from "react";
import { PickerCell } from "../picker-cell";
import type { Dayjs, PickerCellRenderInfo, PickerMode, RangeValue } from "../types";
import { buildQuarterCellInfos } from "../utils";

interface QuarterPickerProps {
  pickerMode: PickerMode;
  viewDate: Dayjs;
  value: Dayjs | RangeValue | null;
  hoverValue?: Dayjs | null;
  disabledDate?: (current: Dayjs, info: { from?: Dayjs; type: PickerMode }) => boolean;
  renderCell?: (info: PickerCellRenderInfo) => ReactNode;
  onSelect: (date: Dayjs) => void;
  onHover?: (date: Dayjs | null) => void;
  className?: string;
}

function QuarterPicker(props: QuarterPickerProps) {
  const { pickerMode, viewDate, value, hoverValue, disabledDate, renderCell, onSelect, onHover, className } = props;
  const cellInfos = buildQuarterCellInfos(viewDate, value, hoverValue, pickerMode, disabledDate, onSelect);

  return (
    <div className={cn("grid grid-cols-2 gap-y-3 px-3 py-4", className)}>
      {cellInfos.map(({ key, info, current }) => {
        return (
          <div key={key} className="flex justify-center" onMouseEnter={() => onHover?.(current)} onMouseLeave={() => onHover?.(null)}>
            {renderCell ? renderCell(info) : <PickerCell info={info} className="h-8 w-16 rounded-md" />}
          </div>
        );
      })}
    </div>
  );
}

export { QuarterPicker };
