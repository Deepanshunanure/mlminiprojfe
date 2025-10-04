// components/energy/prediction-simulator.tsx

"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Pattern = "Low Night Usage" | "Weekday Daytime" | "Evening Peak" | "Unknown"

export default function PredictionSimulator({
  onForecast,
}: {
  // UPDATED: The function signature is simpler now
  onForecast: (predictedKW: number, pattern: Pattern, recommendation: string, allInputs: any) => void
}) {
  const [gap, setGap] = useState(1.45)
  const [grp, setGrp] = useState(0.15)
  const [volt, setVolt] = useState(232)
  const [gint, setGint] = useState(6.2)
  const [sub1, setSub1] = useState(0.2)
  const [sub2, setSub2] = useState(0.35)
  const [sub3, setSub3] = useState(0.4)
  const [totalSub, setTotalSub] = useState(0.95)
  const [hour, setHour] = useState(19)
  const [weekday, setWeekday] = useState(3)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // The form data no longer includes cost
    const formData = {
      global_active_power: gap, global_reactive_power: grp, voltage: volt,
      global_intensity: gint, sub_metering_1: sub1, sub_metering_2: sub2,
      sub_metering_3: sub3, total_sub_metering: totalSub, hour: hour,
      weekday: weekday === 0 ? 6 : weekday - 1,
    }

    try {
      const response = await fetch("https://energy-api-9lqe.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Prediction request failed. Is the backend server running?")
      }

      const result = await response.json()
      if (result.error) { throw new Error(result.error) }
      
      onForecast(result.prediction, result.pattern as Pattern, result.recommendation, formData)

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handlePredict} className="space-y-5">
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{"Power Readings"}</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label htmlFor="gap">{"Global Active Power"}</Label><Input id="gap" type="number" step="0.01" value={gap} onChange={(e) => setGap(+e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="grp">{"Global Reactive Power"}</Label><Input id="grp" type="number" step="0.01" value={grp} onChange={(e) => setGrp(+e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="volt">{"Voltage"}</Label><Input id="volt" type="number" step="1" value={volt} onChange={(e) => setVolt(+e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="gint">{"Global Intensity"}</Label><Input id="gint" type="number" step="0.1" value={gint} onChange={(e) => setGint(+e.target.value)} /></div>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{"Appliance Metering"}</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label htmlFor="sub1">{"Sub Metering 1"}</Label><Input id="sub1" type="number" step="0.01" value={sub1} onChange={(e) => setSub1(+e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="sub2">{"Sub Metering 2"}</Label><Input id="sub2" type="number" step="0.01" value={sub2} onChange={(e) => setSub2(+e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="sub3">{"Sub Metering 3"}</Label><Input id="sub3" type="number" step="0.01" value={sub3} onChange={(e) => setSub3(+e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="totalSub">{"Total Sub Metering"}</Label><Input id="totalSub" type="number" step="0.01" value={totalSub} onChange={(e) => setTotalSub(+e.target.value)} /></div>
        </div>
      </div>
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{"Time Context"}</h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label htmlFor="hour">{"Hour (0–23)"}</Label><Input id="hour" type="number" min={0} max={23} value={hour} onChange={(e) => setHour(+e.target.value)} /></div>
          <div className="space-y-1.5"><Label htmlFor="weekday">{"Weekday (0=Sun)"}</Label><Input id="weekday" type="number" min={0} max={6} value={weekday} onChange={(e) => setWeekday(+e.target.value)} /></div>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Analyzing..." : "Run Forecast"}
      </Button>
      {error && <p className="text-sm font-semibold text-red-500 text-center">{error}</p>}
    </form>
  )
}