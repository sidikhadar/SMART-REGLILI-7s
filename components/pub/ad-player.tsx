'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Play, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SCENES, type AdLang, type AdScene } from './scenes'
import { createMusic, type AdMusic } from './music'

type Status = 'idle' | 'playing' | 'done'

const VOICE_LANG: Record<AdLang, string> = { fr: 'fr-FR', ar: 'ar-SA' }

function speak(text: string, lang: AdLang, onEnd: () => void) {
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
  if (!synth) {
    onEnd()
    return
  }
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = VOICE_LANG[lang]
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang))
  if (voice) utterance.voice = voice
  utterance.rate = 1
  utterance.onend = onEnd
  utterance.onerror = onEnd
  synth.speak(utterance)
}

export function AdPlayer() {
  const [status, setStatus] = useState<Status>('idle')
  const [index, setIndex] = useState(0)
  const [lang, setLang] = useState<AdLang>('fr')
  const [muted, setMuted] = useState(false)
  const musicRef = useRef<AdMusic | null>(null)

  const stopMusic = () => {
    musicRef.current?.stop()
    musicRef.current = null
  }

  useEffect(() => {
    if (status !== 'playing') return
    const scene = SCENES[index]
    let spoken = false
    let minElapsed = false
    let cancelled = false

    const advance = () => {
      if (cancelled || !spoken || !minElapsed) return
      if (index < SCENES.length - 1) {
        setIndex(index + 1)
      } else {
        setStatus('done')
        stopMusic()
      }
    }
    const markSpoken = () => {
      spoken = true
      advance()
    }

    const minTimer = window.setTimeout(() => {
      minElapsed = true
      advance()
    }, scene.minMs)
    const safetyTimer = window.setTimeout(markSpoken, scene.minMs + 9000)
    speak(scene.voice[lang], lang, markSpoken)

    return () => {
      cancelled = true
      window.clearTimeout(minTimer)
      window.clearTimeout(safetyTimer)
    }
  }, [status, index, lang])

  useEffect(
    () => () => {
      window.speechSynthesis?.cancel()
      stopMusic()
    },
    [],
  )

  const start = () => {
    window.speechSynthesis?.speak(new SpeechSynthesisUtterance(''))
    stopMusic()
    musicRef.current = createMusic()
    musicRef.current?.setMuted(muted)
    setIndex(0)
    setStatus('playing')
  }

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    musicRef.current?.setMuted(next)
  }

  const scene = SCENES[index]
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  return (
    <main className="flex min-h-dvh items-center justify-center bg-navy text-navy-foreground">
      <div
        dir={dir}
        className="relative flex aspect-[9/16] w-full max-w-[min(100vw,56.25dvh)] flex-col overflow-hidden bg-navy"
      >
        {status === 'idle' ? (
          <IdleScreen lang={lang} onLang={setLang} onStart={start} />
        ) : (
          <>
            <ProgressBar index={index} done={status === 'done'} />
            <SceneView key={`${scene.id}-${lang}`} scene={scene} lang={lang} />
            <div className="absolute bottom-4 end-4 flex gap-2">
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? 'Activer la musique' : 'Couper la musique'}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-foreground/10 backdrop-blur"
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              {status === 'done' && (
                <button
                  type="button"
                  onClick={start}
                  className="flex h-11 items-center gap-2 rounded-full bg-brand px-4 text-sm font-semibold text-brand-foreground"
                >
                  <RotateCcw className="h-4 w-4" />
                  {lang === 'fr' ? 'Rejouer' : 'إعادة'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

function ProgressBar({ index, done }: { index: number; done: boolean }) {
  return (
    <div className="absolute inset-x-4 top-4 z-10 flex gap-1" aria-hidden="true">
      {SCENES.map((s, i) => (
        <div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-navy-foreground/20">
          <div
            className={cn(
              'h-full rounded-full bg-brand transition-all duration-500',
              i < index || done ? 'w-full' : i === index ? 'w-1/2' : 'w-0',
            )}
          />
        </div>
      ))}
    </div>
  )
}

function SceneView({ scene, lang }: { scene: AdScene; lang: AdLang }) {
  if (scene.kind !== 'screen') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
        <div className="animate-in zoom-in-50 fade-in duration-700">
          <Image
            src="/logo-emblem.png"
            alt="Smart Reglili"
            width={140}
            height={140}
            className="h-32 w-32 rounded-3xl bg-navy-foreground object-contain p-3"
            priority
          />
        </div>
        <h2 className="animate-in fade-in slide-in-from-bottom-6 fill-mode-both font-heading text-4xl font-bold leading-tight text-balance delay-300 duration-700">
          {scene.title[lang]}
        </h2>
        <p className="animate-in fade-in fill-mode-both text-lg leading-relaxed text-navy-foreground/80 text-pretty delay-700 duration-700">
          {scene.caption[lang]}
        </p>
        {scene.kind === 'outro' && (
          <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both rounded-full bg-brand px-6 py-3 font-heading text-base font-semibold text-brand-foreground delay-1000 duration-700">
            {lang === 'fr' ? 'Commencez dès aujourd’hui' : 'ابدأ اليوم'}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center gap-4 px-6 pb-20 pt-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="animate-in fade-in zoom-in-75 rounded-full bg-brand px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-foreground duration-500">
          {lang === 'fr' ? `Étape ${scene.step}` : `الخطوة ${scene.step}`}
        </span>
        <h2 className="animate-in fade-in slide-in-from-bottom-4 fill-mode-both font-heading text-3xl font-bold leading-tight text-balance delay-150 duration-700">
          {scene.title[lang]}
        </h2>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-12 fill-mode-both relative min-h-0 flex-1 delay-300 duration-700">
        <div className="h-full overflow-hidden rounded-[2rem] border-4 border-navy-foreground/20 shadow-2xl">
          <Image
            src={scene.image!}
            alt={scene.title[lang]}
            width={390}
            height={844}
            className="h-full w-auto object-cover object-top"
            priority
          />
        </div>
      </div>

      <p className="animate-in fade-in fill-mode-both absolute inset-x-6 bottom-20 rounded-2xl bg-navy/90 px-4 py-3 text-center text-base font-medium leading-relaxed text-pretty backdrop-blur delay-500 duration-500">
        {scene.caption[lang]}
      </p>
    </div>
  )
}

function IdleScreen({
  lang,
  onLang,
  onStart,
}: {
  lang: AdLang
  onLang: (lang: AdLang) => void
  onStart: () => void
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8 text-center">
      <Image
        src="/logo-emblem.png"
        alt="Smart Reglili"
        width={120}
        height={120}
        className="h-28 w-28 rounded-3xl bg-navy-foreground object-contain p-3"
        priority
      />
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-bold text-balance">
          {lang === 'fr' ? 'La pub Smart Reglili' : 'إعلان سمارت رقليلي'}
        </h1>
        <p className="leading-relaxed text-navy-foreground/75 text-pretty">
          {lang === 'fr'
            ? 'Textes, voix off et musique. Montez le volume.'
            : 'نصوص وتعليق صوتي وموسيقى. ارفع الصوت.'}
        </p>
      </div>

      <div className="flex rounded-full bg-navy-foreground/10 p-1" role="group" aria-label="Langue">
        {(['fr', 'ar'] as const).map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => onLang(l)}
            aria-pressed={lang === l}
            className={cn(
              'h-11 rounded-full px-5 text-sm font-semibold transition-colors',
              lang === l ? 'bg-navy-foreground text-navy' : 'text-navy-foreground/80',
            )}
          >
            {l === 'fr' ? 'Français' : 'العربية'}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onStart}
        className="flex h-16 items-center gap-3 rounded-full bg-brand px-8 font-heading text-lg font-semibold text-brand-foreground shadow-lg transition-transform active:scale-95"
      >
        <Play className="h-6 w-6 fill-current" />
        {lang === 'fr' ? 'Lancer la pub' : 'شغّل الإعلان'}
      </button>

      <p className="text-sm leading-relaxed text-navy-foreground/60 text-pretty">
        {lang === 'fr'
          ? 'Astuce : lancez l’enregistrement d’écran de votre téléphone avant de jouer la pub pour obtenir la vidéo avec le son.'
          : 'نصيحة: شغّل تسجيل الشاشة في هاتفك قبل تشغيل الإعلان للحصول على الفيديو مع الصوت.'}
      </p>
    </div>
  )
}
