'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Camera, Play, Square, ZapOff, AlertTriangle, Loader2 } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'
import { cn } from '@/lib/utils'

/**
 * Scanner de code-barres intégré (rectangle) réutilisable.
 * S'affiche sous forme de rectangle avec un bouton Démarrer / Arrêter.
 * Reste en écoute continue : chaque code détecté déclenche `onDetected`
 * (avec anti-rebond pour éviter les doublons sur un même code).
 */
export function InlineScanner({
  t,
  onDetected,
  className,
  autoStart = false,
}: {
  t: (k: string) => string
  onDetected: (code: string) => void
  className?: string
  autoStart?: boolean
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const lastRef = useRef<{ code: string; at: number }>({ code: '', at: 0 })
  const onDetectedRef = useRef(onDetected)
  onDetectedRef.current = onDetected

  const [running, setRunning] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null
    setRunning(false)
    setReady(false)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    setRunning(true)
    setReady(false)
    const reader = new BrowserMultiFormatReader()
    try {
      const controls = await reader.decodeFromConstraints(
        { video: { facingMode: { ideal: 'environment' } } },
        videoRef.current!,
        (result) => {
          if (!result) return
          const code = result.getText()
          const now = Date.now()
          // anti-rebond : ignore le même code scanné il y a moins de 1.4s
          if (code === lastRef.current.code && now - lastRef.current.at < 1400) return
          lastRef.current = { code, at: now }
          if (navigator.vibrate) navigator.vibrate(60)
          onDetectedRef.current(code)
        },
      )
      controlsRef.current = controls
      setReady(true)
    } catch (err) {
      console.log('[v0] inline scanner error', err)
      setError('camera')
      setRunning(false)
    }
  }, [])

  // démarrage automatique optionnel + nettoyage à la fermeture
  useEffect(() => {
    if (autoStart) start()
    return () => {
      controlsRef.current?.stop()
      controlsRef.current = null
    }
  }, [autoStart, start])

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border bg-navy', className)}>
      <div className="relative aspect-[5/3] w-full">
        {/* Flux vidéo */}
        <video
          ref={videoRef}
          className={cn(
            'absolute inset-0 h-full w-full object-cover transition-opacity',
            running && !error ? 'opacity-100' : 'opacity-0',
          )}
          playsInline
          muted
        />

        {/* État arrêté */}
        {!running && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-navy px-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-foreground/10 text-navy-foreground">
              <Camera className="h-6 w-6" />
            </span>
            <p className="text-sm text-navy-foreground/70">{t('scanner_idle_hint')}</p>
          </div>
        )}

        {/* Erreur caméra */}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-navy px-6 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-foreground/10 text-navy-foreground">
              <ZapOff className="h-6 w-6" />
            </span>
            <p className="flex items-center gap-1.5 text-sm font-medium text-navy-foreground">
              <AlertTriangle className="h-4 w-4" />
              {t('camera_denied')}
            </p>
          </div>
        )}

        {/* Cadre de visée pendant le scan */}
        {running && !error && (
          <>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-24 w-56 max-w-[75%] rounded-xl border-2 border-white/70">
                <span className="absolute -left-0.5 -top-0.5 h-5 w-5 rounded-tl-xl border-l-4 border-t-4 border-brand" />
                <span className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-tr-xl border-r-4 border-t-4 border-brand" />
                <span className="absolute -bottom-0.5 -left-0.5 h-5 w-5 rounded-bl-xl border-b-4 border-l-4 border-brand" />
                <span className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-br-xl border-b-4 border-r-4 border-brand" />
                <div className="scan-laser-inline absolute inset-x-2 top-0 h-0.5 rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.8)]" />
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5 text-xs font-medium text-white/90">
              {!ready && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {ready ? t('align_barcode') : t('starting_camera')}
            </div>
          </>
        )}
      </div>

      {/* Bouton Démarrer / Arrêter */}
      <div className="border-t border-navy-foreground/10 p-2">
        {running ? (
          <button
            type="button"
            onClick={stop}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground transition-all active:scale-[0.99]"
          >
            <Square className="h-4 w-4" />
            {t('stop_scanner')}
          </button>
        ) : (
          <button
            type="button"
            onClick={start}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-2.5 text-sm font-semibold text-brand-foreground transition-all active:scale-[0.99]"
          >
            <Play className="h-4 w-4" />
            {t('start_scanner')}
          </button>
        )}
      </div>

      <style jsx>{`
        .scan-laser-inline {
          animation: scanmove-inline 2s ease-in-out infinite;
        }
        @keyframes scanmove-inline {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(88px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
