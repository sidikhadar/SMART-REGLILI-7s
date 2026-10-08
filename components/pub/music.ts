const CHORDS = [
  [261.63, 329.63, 392.0],
  [220.0, 261.63, 329.63],
  [174.61, 220.0, 261.63],
  [196.0, 246.94, 293.66],
]

const VOLUME = 0.05

export interface AdMusic {
  setMuted: (muted: boolean) => void
  stop: () => void
}

export function createMusic(): AdMusic | null {
  const AudioCtx =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtx) return null

  const ctx = new AudioCtx()
  void ctx.resume()
  const master = ctx.createGain()
  master.gain.value = VOLUME
  master.connect(ctx.destination)

  const note = (freq: number, length: number, type: OscillatorType, level: number) => {
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(level, t + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, t + length)
    osc.connect(gain).connect(master)
    osc.start(t)
    osc.stop(t + length + 0.05)
  }

  let step = 0
  const timer = window.setInterval(() => {
    const chord = CHORDS[Math.floor(step / 8) % CHORDS.length]
    const octave = step % 8 >= 4 ? 2 : 1
    note(chord[step % 3] * octave, 0.4, 'triangle', 0.8)
    if (step % 8 === 0) note(chord[0] / 2, 1.8, 'sine', 1)
    step++
  }, 240)

  return {
    setMuted: (muted) => {
      master.gain.value = muted ? 0 : VOLUME
    },
    stop: () => {
      window.clearInterval(timer)
      void ctx.close()
    },
  }
}
