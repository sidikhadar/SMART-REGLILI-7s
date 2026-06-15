import Image from 'next/image'
import { cn } from '@/lib/utils'

export function BrandLogo({
  size = 48,
  withText = false,
  className,
}: {
  size?: number
  withText?: boolean
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className="relative shrink-0 overflow-hidden rounded-2xl bg-card shadow-soft ring-1 ring-border"
        style={{ width: size, height: size }}
      >
        <Image
          src="/logo-smart-reglili.jpeg"
          alt="Logo Smart Reglili"
          fill
          sizes={`${size}px`}
          className="object-cover"
          priority
        />
      </div>
      {withText && (
        <div className="leading-tight">
          <p className="font-heading text-lg font-extrabold tracking-tight">
            <span className="text-navy">SMART</span>{' '}
            <span className="text-brand">REGLILI</span>
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Gérez · Contrôlez · Développez
          </p>
        </div>
      )}
    </div>
  )
}
