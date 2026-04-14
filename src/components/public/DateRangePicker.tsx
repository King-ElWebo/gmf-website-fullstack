"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  unavailableDates?: Set<string>;
  isLoadingDates?: boolean;
  onMonthChange?: (year: number, month: number) => void;
}

type SelectionPhase = "idle" | "selecting-start" | "selecting-end";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const WEEKDAY_LABELS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const MONTH_NAMES = [
  "Januar",
  "Februar",
  "März",
  "April",
  "Mai",
  "Juni",
  "Juli",
  "August",
  "September",
  "Oktober",
  "November",
  "Dezember",
];

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseLocalDate(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function isSameDay(a: string, b: string) {
  return a === b;
}

function isBeforeDay(a: string, b: string) {
  return a < b;
}

function formatDisplayDate(key: string) {
  const d = parseLocalDate(key);
  if (!d) return "";
  return new Intl.DateTimeFormat("de-AT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

/** Build the grid of day cells for a given month.  Each row is Mon–Sun. */
function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // ISO weekday: Mon=0 … Sun=6
  const startDow = (firstDay.getDay() + 6) % 7;

  const days: Array<{ date: Date; key: string; isCurrentMonth: boolean }> = [];

  // Leading days from previous month
  for (let i = startDow - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, key: toDateKey(d), isCurrentMonth: false });
  }

  // Current month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const date = new Date(year, month, d);
    days.push({ date, key: toDateKey(date), isCurrentMonth: true });
  }

  // Trailing days to fill up last week
  while (days.length % 7 !== 0) {
    const d = new Date(
      year,
      month + 1,
      days.length - startDow - lastDay.getDate() + 1
    );
    days.push({ date: d, key: toDateKey(d), isCurrentMonth: false });
  }

  return days;
}

function todayKey() {
  return toDateKey(new Date());
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  unavailableDates = new Set<string>(),
  isLoadingDates = false,
  onMonthChange,
}: DateRangePickerProps) {
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [phase, setPhase] = useState<SelectionPhase>("idle");
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  const today = useMemo(() => todayKey(), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const currentMonth = useMemo(() => new Date().getMonth(), []);

  const days = useMemo(
    () => getCalendarDays(viewYear, viewMonth),
    [viewYear, viewMonth]
  );

  // Navigate months
  const goToPrevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const goToNextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  // Notify parent when month changes
  useEffect(() => {
    onMonthChange?.(viewYear, viewMonth);
  }, [viewYear, viewMonth, onMonthChange]);

  // Check if a day is in the selected range
  const isInRange = useCallback(
    (dayKey: string) => {
      if (!startDate || !endDate) return false;
      return dayKey >= startDate && dayKey <= endDate;
    },
    [startDate, endDate]
  );

  // Hover preview range
  const isInHoverRange = useCallback(
    (dayKey: string) => {
      if (phase !== "selecting-end" || !startDate || !hoveredDay) return false;
      if (isBeforeDay(hoveredDay, startDate)) return false;
      return dayKey >= startDate && dayKey <= hoveredDay;
    },
    [phase, startDate, hoveredDay]
  );

  const handleDayClick = useCallback(
    (dayKey: string) => {
      // Don't allow past dates
      if (isBeforeDay(dayKey, today)) return;
      // Don't allow unavailable dates
      if (unavailableDates.has(dayKey)) return;

      if (phase === "idle" || phase === "selecting-start") {
        // Start fresh selection
        onStartDateChange(dayKey);
        onEndDateChange("");
        setPhase("selecting-end");
        return;
      }

      if (phase === "selecting-end") {
        if (isBeforeDay(dayKey, startDate)) {
          // Clicked before start → restart
          onStartDateChange(dayKey);
          onEndDateChange("");
          return;
        }

        // Check if any date in the range is unavailable
        let hasUnavailableInRange = false;
        const current = parseLocalDate(startDate);
        const end = parseLocalDate(dayKey);
        if (current && end) {
          const cursor = new Date(current);
          while (cursor <= end) {
            if (unavailableDates.has(toDateKey(cursor))) {
              hasUnavailableInRange = true;
              break;
            }
            cursor.setDate(cursor.getDate() + 1);
          }
        }

        if (hasUnavailableInRange) {
          // Can't select a range that spans unavailable days → restart
          onStartDateChange(dayKey);
          onEndDateChange("");
          return;
        }

        onEndDateChange(dayKey);
        setPhase("idle");
      }
    },
    [
      phase,
      startDate,
      today,
      unavailableDates,
      onStartDateChange,
      onEndDateChange,
    ]
  );

  // Can we go back?
  const canGoPrev = useMemo(() => {
    return viewYear > currentYear || (viewYear === currentYear && viewMonth > currentMonth);
  }, [viewYear, viewMonth, currentYear, currentMonth]);

  return (
    <div className="date-range-picker">
      {/* Display selected dates */}
      <div className="drp-summary">
        <div className="drp-summary-field">
          <Calendar size={16} className="drp-summary-icon" />
          <div>
            <span className="drp-summary-label">Von</span>
            <span className="drp-summary-value">
              {startDate ? formatDisplayDate(startDate) : "Datum wählen"}
            </span>
          </div>
        </div>
        <div className="drp-summary-divider">→</div>
        <div className="drp-summary-field">
          <Calendar size={16} className="drp-summary-icon" />
          <div>
            <span className="drp-summary-label">Bis</span>
            <span className="drp-summary-value">
              {endDate ? formatDisplayDate(endDate) : "Datum wählen"}
            </span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="drp-calendar">
        {/* Header */}
        <div className="drp-header">
          <button
            type="button"
            onClick={goToPrevMonth}
            disabled={!canGoPrev}
            className="drp-nav-btn"
            aria-label="Vorheriger Monat"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="drp-month-label">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            onClick={goToNextMonth}
            className="drp-nav-btn"
            aria-label="Nächster Monat"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Loading indicator */}
        {isLoadingDates && (
          <div className="drp-loading">
            <div className="drp-loading-bar" />
          </div>
        )}

        {/* Weekday row */}
        <div className="drp-weekdays">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="drp-weekday">
              {label}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="drp-grid">
          {days.map((day) => {
            const isPast = isBeforeDay(day.key, today);
            const isUnavailable = unavailableDates.has(day.key);
            const isDisabled = isPast || isUnavailable;
            const isStart = startDate && isSameDay(day.key, startDate);
            const isEnd = endDate && isSameDay(day.key, endDate);
            const isRangeMiddle =
              isInRange(day.key) && !isStart && !isEnd;
            const isHoverMiddle =
              !endDate && isInHoverRange(day.key) && !isStart;
            const isToday = isSameDay(day.key, today);

            let cellClass = "drp-day";
            if (!day.isCurrentMonth) cellClass += " drp-day--outside";
            if (isPast) cellClass += " drp-day--past";
            if (isUnavailable && !isPast) cellClass += " drp-day--unavailable";
            if (isStart) cellClass += " drp-day--start";
            if (isEnd) cellClass += " drp-day--end";
            if (isRangeMiddle) cellClass += " drp-day--in-range";
            if (isHoverMiddle) cellClass += " drp-day--hover-range";
            if (isToday && !isStart && !isEnd)
              cellClass += " drp-day--today";

            return (
              <button
                key={day.key}
                type="button"
                disabled={isDisabled}
                className={cellClass}
                onClick={() => handleDayClick(day.key)}
                onMouseEnter={() => setHoveredDay(day.key)}
                onMouseLeave={() => setHoveredDay(null)}
                aria-label={`${day.date.getDate()}. ${MONTH_NAMES[day.date.getMonth()]} ${day.date.getFullYear()}${isUnavailable ? " (nicht verfügbar)" : ""}`}
              >
                <span className="drp-day-num">{day.date.getDate()}</span>
                {isUnavailable && !isPast && (
                  <span className="drp-day-blocked-dot" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="drp-legend">
          <div className="drp-legend-item">
            <span className="drp-legend-dot drp-legend-dot--available" />
            <span>Verfügbar</span>
          </div>
          <div className="drp-legend-item">
            <span className="drp-legend-dot drp-legend-dot--unavailable" />
            <span>Belegt</span>
          </div>
          <div className="drp-legend-item">
            <span className="drp-legend-dot drp-legend-dot--selected" />
            <span>Ausgewählt</span>
          </div>
        </div>

        {/* Instruction */}
        {phase === "selecting-end" && (
          <p className="drp-instruction">
            Wählen Sie jetzt das Enddatum aus.
          </p>
        )}
      </div>
    </div>
  );
}
