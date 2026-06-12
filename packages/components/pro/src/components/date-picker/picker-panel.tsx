import { cn } from "@rap/utils";
import type { ReactNode } from "react";
import { PickerBody } from "./picker-body";
import { PickerFooter } from "./picker-footer";
import { PickerHeader } from "./picker-header";
import { PickerPresets } from "./picker-presets";
import type {
  Dayjs,
  PickerCellRenderInfo,
  PickerFooterActions,
  PickerMode,
  PickerPanelContext,
  PickerPanelMode,
  PickerPreset,
  RangeValue,
} from "./types";

interface PickerPanelProps {
  pickerMode: PickerMode;
  panelMode: PickerPanelMode;
  viewDate: Dayjs;
  value: Dayjs | RangeValue | null;
  hoverValue?: Dayjs | null;
  disabledDate?: (current: Dayjs, info: { from?: Dayjs; type: PickerMode }) => boolean;
  presets?: PickerPreset[];
  footer?: ReactNode | ((context: PickerPanelContext) => ReactNode) | null;
  footerActions?: PickerFooterActions;
  renderCell?: (info: PickerCellRenderInfo) => ReactNode;
  renderPanel?: (panel: ReactNode, context: PickerPanelContext) => ReactNode;
  onSelect: (date: Dayjs) => void;
  onHover?: (date: Dayjs | null) => void;
  onToday: () => void;
  onClear: () => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  onPrevDecade: () => void;
  onNextDecade: () => void;
  onPresetPick: (preset: PickerPreset) => void;
  close: () => void;
  setPanelMode: (mode: PickerPanelMode) => void;
  setViewDate: (date: Dayjs) => void;
  numberOfMonths?: 1 | 2;
  activeRangePart?: "start" | "end";
  className?: string;
}

function getDecadeLabel(viewDate: Dayjs) {
  const startYear = Math.floor(viewDate.year() / 10) * 10;
  return `${startYear}-${startYear + 9}`;
}

function PickerPanel(props: PickerPanelProps) {
  const {
    pickerMode,
    panelMode,
    viewDate,
    value,
    hoverValue,
    disabledDate,
    presets,
    footer,
    footerActions,
    renderCell,
    renderPanel,
    onSelect,
    onHover,
    onToday,
    onClear,
    onPrevMonth,
    onNextMonth,
    onPrevYear,
    onNextYear,
    onPrevDecade,
    onNextDecade,
    onPresetPick,
    close,
    setPanelMode,
    setViewDate,
    numberOfMonths = 1,
    activeRangePart,
    className,
  } = props;

  const isRange = Array.isArray(value);
  const context: PickerPanelContext = {
    mode: isRange ? "range" : "single",
    pickerMode,
    panelMode,
    viewDate,
    value,
    hoverValue: hoverValue ?? undefined,
    activeRangePart,
    selectDate: onSelect,
    setPanelMode,
    setViewDate,
    close,
  };

  function handlePanelSelect(date: Dayjs) {
    if (pickerMode === "week") {
      onSelect(date.startOf("isoWeek"));
      if (!isRange) {
        close();
      }
      return;
    }

    if (panelMode === "year") {
      setViewDate(date);
      if (pickerMode === "year") {
        onSelect(date.startOf("year"));
        close();
        return;
      }
      setPanelMode(pickerMode === "quarter" ? "quarter" : "month");
      return;
    }

    if (panelMode === "month") {
      setViewDate(date);
      if (pickerMode === "month") {
        onSelect(date.startOf("month"));
        close();
        return;
      }
      if (pickerMode === "quarter") {
        setPanelMode("quarter");
        return;
      }
      setPanelMode("date");
      return;
    }

    if (panelMode === "quarter") {
      setViewDate(date);
      onSelect(date.startOf("quarter"));
      close();
      return;
    }

    onSelect(date);
  }

  const panelBody =
    panelMode === "date" && numberOfMonths === 2 ? (
      <div className="flex min-w-max divide-x">
        <PickerBody
          pickerMode={pickerMode}
          panelMode={panelMode}
          viewDate={viewDate}
          value={value}
          hoverValue={hoverValue}
          disabledDate={disabledDate}
          renderCell={renderCell}
          onSelect={handlePanelSelect}
          onHover={onHover}
          className="min-w-[280px] flex-1"
        />
        <PickerBody
          pickerMode={pickerMode}
          panelMode={panelMode}
          viewDate={viewDate.add(1, "month")}
          value={value}
          hoverValue={hoverValue}
          disabledDate={disabledDate}
          renderCell={renderCell}
          onSelect={handlePanelSelect}
          onHover={onHover}
          className="min-w-[280px] flex-1"
        />
      </div>
    ) : (
      <PickerBody
        pickerMode={pickerMode}
        panelMode={panelMode}
        viewDate={viewDate}
        value={value}
        hoverValue={hoverValue}
        disabledDate={disabledDate}
        renderCell={renderCell}
        onSelect={handlePanelSelect}
        onHover={onHover}
      />
    );

  const panel = (
    <div
      className={cn(
        "min-w-[320px] w-max overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg",
        className,
      )}
    >
      <PickerHeader
        panelMode={panelMode}
        yearLabel={`${viewDate.year()}年`}
        monthLabel={`${viewDate.month() + 1}月`}
        rangeLabel={getDecadeLabel(viewDate)}
        onPrev={onPrevMonth}
        onNext={onNextMonth}
        onDoublePrev={panelMode === "year" ? onPrevDecade : onPrevYear}
        onDoubleNext={panelMode === "year" ? onNextDecade : onNextYear}
        onYearClick={panelMode === "year" ? undefined : () => setPanelMode("year")}
        onMonthClick={panelMode === "date" ? () => setPanelMode("month") : undefined}
      />
      {panelBody}
      <PickerPresets presets={presets} onPick={onPresetPick} />
      <PickerFooter
        context={context}
        footer={footer}
        actions={footerActions}
        onToday={onToday}
        onClear={onClear}
      />
    </div>
  );

  return renderPanel ? renderPanel(panel, context) : panel;
}

export { PickerPanel };
