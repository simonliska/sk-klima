"use client";

import {
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export default function ClimateChart({
  data,
  activeYear,
  onSelectYear,
}: {
  data: { year: number; value: number }[];
  activeYear: number;
  onSelectYear?: (year: number) => void;
}) {
  const active = data.find((d) => d.year === activeYear);
  const years = data.map((d) => d.year);
  const handleClick = (state: unknown) => {
    if (!onSelectYear) return;
    const s = state as {
      activeLabel?: number | string;
      activeTooltipIndex?: number;
    } | null;
    const idx = s?.activeTooltipIndex;
    if (typeof idx === "number" && data[idx]) {
      onSelectYear(data[idx].year);
      return;
    }
    const label = Number(s?.activeLabel);
    if (years.includes(label)) onSelectYear(label);
  };
  return (
    <div
      className="h-28 w-full [&_.recharts-wrapper]:outline-none"
      aria-hidden="true"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
          onClick={handleClick}
          style={onSelectYear ? { cursor: "pointer" } : undefined}
        >
          <XAxis
            dataKey="year"
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
            dot={{ r: 2.5, fill: "#0f766e", stroke: "#fff", strokeWidth: 1.5 }}
            activeDot={{ r: 4 }}
            isAnimationActive={true}
          />
          {active && (
            <ReferenceDot
              x={active.year}
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
