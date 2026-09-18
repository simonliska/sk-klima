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
  /** Compact tick label, e.g. "1951–80" / "2021–50". */
  label: string;
  value: number;
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
    <div className="h-28 w-full [&_.recharts-wrapper]:outline-none">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
          onClick={handleClick}
          style={onSelectPeriod ? { cursor: "pointer" } : undefined}
        >
          <Tooltip
            content={() => null}
            cursor={{ stroke: "#0f766e", strokeOpacity: 0.25 }}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#78716c" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={12}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#78716c" }}
            tickLine={false}
            axisLine={false}
            width={40}
            tickFormatter={(v: number) =>
              String(Math.round(v * 10) / 10).replace(".", ",")
            }
            domain={([dataMin, dataMax]: readonly [number, number]) => {
              const pad = (dataMax - dataMin) * 0.25 || 1;
              return [dataMin - pad, dataMax + pad] as [number, number];
            }}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#0f766e"
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
                      fill="#0f766e"
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
              fill="#0f766e"
              stroke="#fff"
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
