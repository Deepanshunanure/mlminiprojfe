"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, TrendingUp, Users } from "lucide-react"
import ConsumptionChart, { type HistoryPoint } from "./consumption-chart"
import MetricCard from "./metric-card"
import PredictionSimulator from "./prediction-simulator"

type Pattern = "Low Night Usage" | "Weekday Daytime" | "Evening Peak" | "Unknown"

function formatClock(d: Date) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  }).format(d)
}

function generateHistory(): HistoryPoint[] {
  const now = new Date()
  const points: HistoryPoint[] = []
  const base = 0.9 // base kW
  for (let i = 23; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 60 * 60 * 1000)
    const hour = t.getHours()
    // simple day-night pattern with noise
    const diurnal =
      hour >= 18 || hour <= 6
        ? 1.1 + Math.random() * 0.4 // evenings/nights higher variance
        : 0.8 + Math.random() * 0.3 // daytime flatter
    const val = +(base * diurnal).toFixed(2)
    points.push({
      ts: t.toISOString(),
      label: t.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      kW: val,
    })
  }
  return points
}

export default function EnergyDashboard() {
  // --- FIX START ---
  // Initialize clock to null on the server to prevent mismatch
  const [clock, setClock] = useState<string | null>(null)
  // --- FIX END ---

  const [history, setHistory] = useState<HistoryPoint[]>(() => generateHistory())
  const [forecastKW, setForecastKW] = useState<number | null>(null)
  const [pattern, setPattern] = useState<Pattern>("Unknown")

  const liveKW = useMemo(() => history[history.length - 1]?.kW ?? 0, [history])

  useEffect(() => {
    // --- FIX START ---
    // This now runs only on the client. It sets the initial time and starts the timer.
    setClock(formatClock(new Date()))
    // --- FIX END ---
    const h = setInterval(() => setClock(formatClock(new Date())), 1000)
    return () => clearInterval(h)
  }, [])

  function handleRunForecast(predictedKW: number, detected: Pattern) {
    setForecastKW(+predictedKW.toFixed(2))
    setPattern(detected)

    const last = history[history.length - 1]
    const nextTime = new Date(new Date(last.ts).getTime() + 60 * 60 * 1000)
    const nextPoint: HistoryPoint = {
      ts: nextTime.toISOString(),
      label: nextTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      kW: +predictedKW.toFixed(2),
    }
    setHistory((prev) => [...prev, nextPoint])
  }

  function patternBadgeColor(p: Pattern) {
    switch (p) {
      case "Low Night Usage":
        return "bg-green-500 text-white"
      case "Weekday Daytime":
        return "bg-orange-500 text-white"
      case "Evening Peak":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-700 text-gray-200"
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
      <section className="md:col-span-8 lg:col-span-9 space-y-4">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-pretty">{"⚡ Live Energy Dashboard"}</h1>
          {/* --- FIX START --- */}
          {/* Show a placeholder while the clock is null to ensure server/client match */}
          <p className="text-sm text-muted-foreground">{clock || "Loading..."}</p>
          {/* --- FIX END --- */}
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MetricCard title="Live Active Power" value={`${liveKW.toFixed(2)} kW`} Icon={Zap} />
          <MetricCard
            title="Forecasted Consumption"
            value={forecastKW !== null ? `${forecastKW.toFixed(2)} kW` : "-- kW"}
            Icon={TrendingUp}
          />
          <MetricCard title="Current Pattern" value={pattern} Icon={Users} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Historical & Forecasted Power</CardTitle>
          </CardHeader>
          <CardContent>
            <ConsumptionChart
              data={history.slice(0, 24)}
              forecastPoint={forecastKW !== null ? history[history.length - 1] : null}
            />
            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>{"Time (Last 24 Hours)"}</div>
              <div className="md:text-right">{"Global Active Power (kW)"}</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <aside className="md:col-span-4 lg:col-span-3">
        <Card>
          <CardHeader>
            <CardTitle>{"Prediction Simulator"}</CardTitle>
          </CardHeader>
          <CardContent>
            <PredictionSimulator onForecast={(v, p) => handleRunForecast(v, p as Pattern)} />

            {forecastKW !== null && (
              <div className="mt-6 space-y-3">
                <h4 className="text-sm font-medium">{"Forecast Analysis"}</h4>
                <div className="rounded-lg border p-3 bg-background/50">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">{"Next Hour’s Power:"}</span>
                    <span className="text-2xl font-semibold">{forecastKW.toFixed(2)} kW</span>
                  </div>
                  <div className="mt-3">
                    <Badge className={patternBadgeColor(pattern)}>
                      {"Pattern Detected: "}
                      {pattern}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  )
}