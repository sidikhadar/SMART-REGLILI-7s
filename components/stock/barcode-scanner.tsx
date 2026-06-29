'use client'

import { useEffect, useRef, useState } from 'react'
import { X, ZapOff, AlertTriangle } from 'lucide-react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'

export function BarcodeScanner({
  t,
  onClose,
  onDetected,
}: {
  t: (k: string) => string
  onClose: () => void
  onDetected: (code: string) => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    const reader = new BrowserMultiFormatReader()

    async function start() {
      try {
        // démarre la caméra arrière de préférence
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current!,
          (result) => {
            if (result && !cancelled) {
              // vibration de confirmation si supportée
              if (navigator.vibrate) navigator.vibrate(60)
              const text = result.getText()
              controls.stop()
              onDetected(text)
            }
          },
        )
        if (cancelled) {
          controls.stop()
          return
        }
        controlsRef.current = controls
        setReady(true)
      } catch (err) {
        console.log('[v0] scanner error', err)
        setError('camera')
      }
    }

    start()
    return () => {
      cancelled = true
      controlsRef.current?.stop()
    }
  }, [onDetected])

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h2 className="font-heading text-base font-bold text-white">
          {t('scan_barcode')}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={t('cancel')}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Zone vidéo */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          playsInline
          muted
        />

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white">
              <ZapOff className="h-7 w-7" />
            </span>
            <p className="flex items-center gap-2 text-sm font-medium text-white">
              <AlertTriangle className="h-4 w-4" />
              {t('camera_denied')}
            </p>
          </div>
        ) : (
          <>
            {/* Cadre de visée + ligne laser rouge */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative h-44 w-72 max-w-[80%] rounded-2xl border-2 border-white/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
                {/* coins */}
                <span className="absolute -left-0.5 -top-0.5 h-6 w-6 rounded-tl-2xl border-l-4 border-t-4 border-brand" />
                <span className="absolute -right-0.5 -top-0.5 h-6 w-6 rounded-tr-2xl border-r-4 border-t-4 border-brand" />
                <span className="absolute -bottom-0.5 -left-0.5 h-6 w-6 rounded-bl-2xl border-b-4 border-l-4 border-brand" />
                <span className="absolute -bottom-0.5 -right-0.5 h-6 w-6 rounded-br-2xl border-b-4 border-r-4 border-brand" />
                {/* ligne laser rouge animée */}
                <div className="scan-laser absolute inset-x-3 top-0 h-0.5 rounded-full bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.8)]" />
              </div>
            </div>

            <p className="absolute inset-x-0 bottom-10 text-center text-sm font-medium text-white/90">
              {ready ? t('align_barcode') : t('starting_camera')}
            </p>
          </>
        )}
      </div>

      <style jsx>{`
        .scan-laser {
          animation: scanmove 2s ease-in-out infinite;
        }
        @keyframes scanmove {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(168px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
