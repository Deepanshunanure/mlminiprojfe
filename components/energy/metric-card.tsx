import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

export default function MetricCard({
  title,
  value,
  Icon,
}: {
  title: string
  value: string
  Icon: LucideIcon
}) {
  return (
    <Card className="bg-(--panel) border-(--panel-border)">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-(--brand-blue)" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}
