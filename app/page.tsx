import { Suspense } from "react"
import EnergyDashboard from "@/components/energy/energy-dashboard"

export default function Page() {
  return (
    <main className="min-h-dvh p-4 md:p-6">
      <Suspense>
        <EnergyDashboard />
      </Suspense>
    </main>
  )
}
