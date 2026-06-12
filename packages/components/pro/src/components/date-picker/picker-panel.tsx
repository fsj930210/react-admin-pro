import { cn } from "@rap/utils";
import type { ReactNode } from "react";
import { PickerBody } from "./picker-body";
import { PickerFooter } from "./picker-footer";
import { PickerHeader } from "./picker-header";
import { PickerPresets } from "./picker-presets";
import { getYearPageStart } from "./utils";
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
  const startYear = getYearPageStart(viewDate.year());
  return `${startYear}-${startYear + 11}`;
}

function getPanelOffsetDate(viewDate: Dayjs, panelMode: PickerPanelMode) {
  if (panelMode === "date") return viewDate.add(1, "month");
  if (panelMode === "year") return viewDate.add(12, "year");
  return viewDate.add(1, "year");
}

function getHeaderLabels(viewDate: Dayjs, panelMode: PickerPanelMode) {
  return {
    yearLabel: `${viewDate.year()}年`,
    monthLabel: `${viewDate.month() + 1}月`,
    rangeLabel: getDecadeLabel(viewDate),
    showMonthClick: panelMode === "date",
  };
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

  const isRange = activeRangePart !== undefined || Array.isArray(value);
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
      onSelect(date.startOf("week"));
      if (!isRange) {
        close();
      }
      return;
    }

    if (panelMode === "year") {
      if (pickerMode === "year") {
        onSelect(date.startOf("year"));
        if (!isRange) {
          close();
        }
        return;
      }
      setViewDate(date);
      setPanelMode(pickerMode === "quarter" ? "quarter" : "month");
      return;
    }

    if (panelMode === "month") {
      if (pickerMode === "month") {
        onSelect(date.startOf("month"));
        if (!isRange) {
          close();
        }
        return;
      }
      setViewDate(date);
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
      if (!isRange) {
        close();
      }
      return;
    }

    onSelect(date);
  }

  const showDoublePanel = numberOfMonths === 2;
  const nextPanelDate = getPanelOffsetDate(viewDate, panelMode);
  const currentHeaderLabels = getHeaderLabels(viewDate, panelMode);
  const nextHeaderLabels = getHeaderLabels(nextPanelDate, panelMode);

  const renderPanelBody = (date: Dayjs, bodyClassName?: string) => (
    <PickerBody
      pickerMode={pickerMode}
      panelMode={panelMode}
      viewDate={date}
      value={value}
      hoverValue={hoverValue}
      disabledDate={disabledDate}
      renderCell={renderCell}
      onSelect={handlePanelSelect}
      onHover={onHover}
      className={bodyClassName}
    />
  );

  const panelBody = showDoublePanel ? (
    <div className="flex min-w-max divide-x">
      <div className={cn("min-w-[280px] flex-1", panelMode !== "date" && "min-w-[320px]")}>
        <PickerHeader
          panelMode={panelMode}
          {...currentHeaderLabels}
          onPrev={onPrevMonth}
          onNext={onNextMonth}
          onDoublePrev={panelMode === "year" ? onPrevDecade : onPrevYear}
          onDoubleNext={panelMode === "year" ? onNextDecade : onNextYear}
          onYearClick={panelMode === "year" ? undefined : () => setPanelMode("year")}
          onMonthClick={currentHeaderLabels.showMonthClick ? () => setPanelMode("month") : undefined}
          showNextControls={false}
        />
        {renderPanelBody(viewDate)}
      </div>
      <div className={cn("min-w-[280px] flex-1", panelMode !== "date" && "min-w-[320px]")}>
        <PickerHeader
          panelMode={panelMode}
          {...nextHeaderLabels}
          onPrev={() => setViewDate(nextPanelDate.subtract(1, "month"))}
          onNext={onNextMonth}
          onDoublePrev={() => setViewDate(nextPanelDate.subtract(panelMode === "year" ? 12 : 1, "year"))}
          onDoubleNext={panelMode === "year" ? onNextDecade : onNextYear}
          onYearClick={panelMode === "year" ? undefined : () => setPanelMode("year")}
          onMonthClick={nextHeaderLabels.showMonthClick ? () => setPanelMode("month") : undefined}
          showPrevControls={false}
        />
        {renderPanelBody(nextPanelDate)}
      </div>
    </div>
  ) : (
    renderPanelBody(viewDate)
  );

  const header = showDoublePanel ? null : (
    <PickerHeader
      panelMode={panelMode}
      {...currentHeaderLabels}
      onPrev={onPrevMonth}
      onNext={onNextMonth}
      onDoublePrev={panelMode === "year" ? onPrevDecade : onPrevYear}
      onDoubleNext={panelMode === "year" ? onNextDecade : onNextYear}
      onYearClick={panelMode === "year" ? undefined : () => setPanelMode("year")}
      onMonthClick={currentHeaderLabels.showMonthClick ? () => setPanelMode("month") : undefined}
    />
  );
  const hasPresets = !!presets?.length;
  const panelContent = (
    <div className="min-w-0 flex-1">
      {header}
      {panelBody}
      <PickerFooter
        context={context}
        footer={footer}
        actions={footerActions}
        onToday={onToday}
        onClear={onClear}
      />
    </div>
  );

  const panel = (
    <div
      className={cn(
        "flex w-full min-w-[320px] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-lg",
        className,
      )}
    >
      {hasPresets ? <PickerPresets presets={presets} onPick={onPresetPick} /> : null}
      {panelContent}
    </div>
  );

  return renderPanel ? renderPanel(panel, context) : panel;
}

export { PickerPanel };
