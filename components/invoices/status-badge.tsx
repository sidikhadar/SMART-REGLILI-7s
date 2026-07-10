import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import type { InvoiceStatus } from '@/lib/invoice-utils'
import { cn } from '@/lib/utils'

const CONFIG: Record<
  InvoiceStatus,
  { key: string; icon: typeof CheckCircle2; className: string }
> = {
  paid: {
    key: 'inv_status_paid',
    icon: CheckCircle2,
    className: 'bg-brand/10 text-brand',
  },
  partial: {
    key: 'inv_status_partial',
    icon: Clock,
    className: 'bg-amber-500/10 text-amber-600',
  },
  unpaid: {
    key: 'inv_status_unpaid',
    icon: AlertCircle,
    className: 'bg-destructive/10 text-destructive',
  },
}

export function StatusBadge({
  status,
  t,
}: {
  status: InvoiceStatus
  t: (k: string) => string
}) {
  const cfg = CONFIG[status]
  const Icon = cfg.icon
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        cfg.className,
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {t(cfg.key)}
    </span>
  )
}
