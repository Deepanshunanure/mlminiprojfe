"use client"

import { Area, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export type HistoryPoint = {
  ts: string
  label: string
  kW: number
}

export default function ConsumptionChart({
  data,
  forecastPoint,
}: {
  data: HistoryPoint[]
  forecastPoint: HistoryPoint | null
}) {
  // history = first 24 points
  const history = data.slice(0, 24)
  const last = history[history.length - 1]

  // forecast segment if provided: from last -> forecastPoint
  const forecastSegment =
    forecastPoint && last
      ? [
          { label: last.label, kW: last.kW },
          { label: forecastPoint.label, kW: forecastPoint.kW },
        ]
      : null

  return (
    <div className="h-[280px] md:h-[320px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={history} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
          <defs>
            <linearGradient id="historyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-blue)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--brand-blue)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
            minTickGap={24}
          />
          <YAxis
            tick={{ fill: "rgba(255,255,255,0.65)", fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
            width={40}
            domain={["auto", "auto"]}
          />
          <Tooltip
            contentStyle={{
              background: "var(--panel)",
              border: "1px solid var(--panel-border)",
              color: "var(--color-foreground)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "rgba(255,255,255,0.75)" }}
            formatter={(val: number) => [`${val?.toFixed?.(2)} kW`, "Power"]}
          />
          <Area type="monotone" dataKey="kW" stroke="none" fill="url(#historyFill)" />
          <Line
            type="monotone"
            dataKey="kW"
            stroke="var(--brand-blue)"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />

          {forecastSegment && (
            <Line
              type="monotone"
              data={forecastSegment}
              dataKey="kW"
              stroke="var(--brand-blue)"
              strokeWidth={2}
              strokeDasharray="6 6"
              dot={{ r: 0 }}
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Glowing marker for forecast point */}
      {forecastPoint && (
        <div
          aria-hidden
          className="pointer-events-none"
          style={{
            position: "relative",
            top: -28,
            left: "100%",
            filter: "drop-shadow(0 0 8px var(--brand-blue))",
          }}
        />
      )}
    </div>
  )
}
