import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from 'lucide-react'

export function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  trend,
  tone = 'brand',
}: {
  label: string
  value: string
  unit?: string
  icon: LucideIcon
  trend?: { value: string; up: boolean }
  tone?: 'brand' | 'navy' | 'warning' | 'danger'
}) {
  const tones: Record<string, string> = {
    brand: 'bg-accent text-brand',
    navy: 'bg-navy/10 text-navy',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-destructive/10 text-destructive',
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-start justify-between">
        <span
          className={cn(
            'flex h-11 w-11 items-center justify-center rounded-xl',
            tones[tone],
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        {trend && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-xs font-semibold',
              trend.up
                ? 'bg-accent text-brand'
                : 'bg-destructive/10 text-destructive',
            )}
          >
            {trend.up ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            )}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-foreground">
        {value}
        {unit && (
          <span className="ms-1 text-sm font-semibold text-muted-foreground">
            {unit}
          </span>
        )}
      </p>
    </div>
  )
}
