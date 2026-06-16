'use client'

import { useEffect, useRef, useState } from 'react'

const NAVY = '#0d2137'
const GREEN = '#1e7e3e'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  color: string
  size: number
  r0: number
  a0: number
  captured: boolean
}

/**
 * Animation de lancement (~3.2s) — pilotée par canvas :
 *  - 0 à 1s   : des milliers de pixels bleu marine / vert volent au hasard sur fond blanc.
 *  - 1 à 2s   : tous les pixels forment un vortex anti-horaire vers le centre.
 *  - 2 à 2.5s : le logo SMART REGLILI apparaît au centre (zoom), sans bordure blanche (mix-blend multiply).
 *  - 2.5 à 3.2s : le logo glisse vers le haut tandis que la Welcome Screen apparaît dessous.
 */
export function LaunchAnimation({ onComplete }: { onComplete: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  // 1 = pixels, 2 = vortex, 3 = logo, 4 = glissement
  const [phase, setPhase] = useState<1 | 2 | 3 | 4>(1)

  // Séquence temporelle
  useEffect(() => {
    const t2 = setTimeout(() => setPhase(2), 1000)
    const t3 = setTimeout(() => setPhase(3), 2000)
    const t4 = setTimeout(() => setPhase(4), 2500)
    const tEnd = setTimeout(onComplete, 3200)
    return () => {
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(tEnd)
    }
  }, [onComplete])

  // Système de particules sur canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = window.innerWidth
    let H = window.innerHeight

    function resize() {
      W = window.innerWidth
      H = window.innerHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const count = Math.max(700, Math.min(1700, Math.floor((W * H) / 550)))
    const particles: Particle[] = []
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 260,
        vy: (Math.random() - 0.5) * 260,
        color: Math.random() > 0.5 ? NAVY : GREEN,
        size: Math.random() > 0.7 ? 3 : 2,
        r0: 0,
        a0: 0,
        captured: false,
      })
    }

    const start = performance.now()
    let last = start
    let raf = 0

    function frame(now: number) {
      const elapsed = now - start
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now

      const cx = W / 2
      const cy = H / 2

      ctx.clearRect(0, 0, W, H)
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, W, H)

      let alpha = 1
      if (elapsed > 2000) alpha = Math.max(0, 1 - (elapsed - 2000) / 500)

      for (const p of particles) {
        if (elapsed < 1000) {
          // Phase 1 : vol aléatoire (rebond sur les bords)
          p.x += p.vx * dt
          p.y += p.vy * dt
          if (p.x < 0 || p.x > W) p.vx *= -1
          if (p.y < 0 || p.y > H) p.vy *= -1
          p.x = Math.max(0, Math.min(W, p.x))
          p.y = Math.max(0, Math.min(H, p.y))
        } else {
          // Capture des coordonnées polaires au début du vortex
          if (!p.captured) {
            const dx = p.x - cx
            const dy = p.y - cy
            p.r0 = Math.hypot(dx, dy)
            p.a0 = Math.atan2(dy, dx)
            p.captured = true
          }
          // Phase 2/3 : vortex anti-horaire vers le centre
          const prog = Math.min(1, (elapsed - 1000) / 1200)
          const eased = prog * prog
          const r = p.r0 * (1 - eased)
          const a = p.a0 - eased * 6 // anti-horaire
          p.x = cx + r * Math.cos(a)
          p.y = cy + r * Math.sin(a)
        }

        ctx.globalAlpha = alpha
        ctx.fillStyle = p.color
        ctx.fillRect(p.x, p.y, p.size, p.size)
      }
      ctx.globalAlpha = 1

      if (elapsed < 2600) {
        raf = requestAnimationFrame(frame)
      } else {
        ctx.clearRect(0, 0, W, H)
      }
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {/* Fond blanc qui s'efface pour révéler la Welcome Screen */}
      <div
        className="absolute inset-0 bg-white transition-opacity duration-700 ease-out"
        style={{ opacity: phase >= 4 ? 0 : 1 }}
      />
      {/* Canvas des particules */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* Logo : zoom (phase 3) puis glissement vers le haut (phase 4) */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          transition: 'transform 0.7s cubic-bezier(0.5,0,0.3,1), opacity 0.5s ease-out',
          opacity: phase >= 3 ? (phase >= 4 ? 0 : 1) : 0,
          transform:
            phase >= 4
              ? 'translate(-50%, -50%) translateY(-32vh) scale(0.45)'
              : phase >= 3
                ? 'translate(-50%, -50%) scale(1)'
                : 'translate(-50%, -50%) scale(0.2)',
        }}
      >
        <img
          src="/logo-smart-reglili.jpeg"
          alt="SMART REGLILI"
          width={176}
          height={176}
          className="h-40 w-40 object-contain mix-blend-multiply sm:h-44 sm:w-44"
        />
      </div>
    </div>
  )
}
