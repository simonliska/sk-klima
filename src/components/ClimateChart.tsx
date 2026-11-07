"use client";

import {
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface PeriodChartPoint {
  periodId: string;
  /** Compact tick label, e.g. "1980" / "2100". */
  label: string;
  value: number;
  /** Formatted value shown above the active point ("+0,9", "22"). */
  display?: string;
}

export default function ClimateChart({
  data,
  activePeriodId,
  onSelectPeriod,
}: {
  data: PeriodChartPoint[];
  activePeriodId: string;
  onSelectPeriod?: (periodId: string) => void;
}) {
  const active = data.find((d) => d.periodId === activePeriodId);
  const selectByIndex = (idx: number) => {
    if (!onSelectPeriod) return;
    const point = data[idx];
    if (point && point.periodId !== activePeriodId) {
      onSelectPeriod(point.periodId);
    }
  };
  const handleClick = (state: unknown) => {
    if (!onSelectPeriod) return;
    const s = state as {
      activeTooltipIndex?: number | string;
      activeLabel?: string | number;
      activePayload?: Array<{ payload?: PeriodChartPoint }>;
    } | null;
    if (!s) return;
    // 2. Index z tooltipu (klik kamkoľvek do grafu)
    const rawIdx = s.activeTooltipIndex;
    const idx =
      typeof rawIdx === "number"
        ? rawIdx
        : typeof rawIdx === "string"
          ? Number(rawIdx)
          : NaN;
    if (Number.isInteger(idx) && data[idx]) {
      selectByIndex(idx);
      return;
    }
    // 3. Fallback cez payload / label
    const payloadPeriodId = s.activePayload?.[0]?.payload?.periodId;
    if (payloadPeriodId) {
      const found = data.findIndex((d) => d.periodId === payloadPeriodId);
      if (found >= 0) {
        selectByIndex(found);
        return;
      }
    }
    if (s.activeLabel != null) {
      const found = data.findIndex((d) => d.label === String(s.activeLabel));
      if (found >= 0) selectByIndex(found);
    }
  };
  return (
    <div className="h-32 w-full [&_.recharts-wrapper]:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 22, right: 18, bottom: 4, left: 18 }}
          onClick={handleClick}
          style={onSelectPeriod ? { cursor: "pointer" } : undefined}
        >
          <Tooltip
            content={() => null}
            cursor={{ stroke: "#2b5043", strokeOpacity: 0.25 }}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#78716c" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={12}
          />
          {/* No visible Y axis: the exact value is the big number next to
              the chart and the label above the active point. Count metrics
              never go below 0. */}
          <YAxis
            hide
            domain={([dataMin, dataMax]: readonly [number, number]) => {
              const pad = (dataMax - dataMin) * 0.15 || 1;
              const min = dataMin >= 0 ? Math.max(0, dataMin - pad) : dataMin - pad;
              return [min, dataMax + pad] as [number, number];
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#2b5043"
            strokeWidth={2.5}
            dot={(props: {
              cx?: number;
              cy?: number;
              index?: number;
            }) => {
              const { cx, cy, index } = props;
              if (cx == null || cy == null || index == null) return <g />;
              const isActive = data[index]?.periodId === activePeriodId;
              return (
                <g
                  style={{ cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectByIndex(index);
                  }}
                >
                  {/* neviditeľná väčšia klikacia plocha */}
                  <circle cx={cx} cy={cy} r={10} fill="transparent" />
                  {/* viditeľný bod */}
                  {!isActive && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={2.5}
                      fill="#2b5043"
                      stroke="#fff"
                      strokeWidth={1.5}
                      pointerEvents="none"
                    />
                  )}
                </g>
              );
            }}
            activeDot={{ r: 4 }}
            isAnimationActive={true}
          />
          {active && (
            <ReferenceDot
              x={active.label}
              y={active.value}
              r={5}
              fill="#2b5043"
              stroke="#fff"
              strokeWidth={2}
              label={
                active.display
                  ? {
                      value: active.display,
                      position: "top",
                      offset: 8,
                      fontSize: 11,
                      fontWeight: 600,
                      fill: "#1c1917",
                    }
                  : undefined
              }
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
