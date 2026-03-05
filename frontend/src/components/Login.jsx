import { useState } from 'react'

export default function Login({ onContinue }) {
  const [name, setName] = useState('')
  const [mood, setMood] = useState('Happy')
  const canContinue = name.trim().length > 0

  const handleContinue = () => {
    if (!canContinue) return
    localStorage.setItem('aria_name', name.trim())
    localStorage.setItem('aria_mood', mood)
    onContinue({ name: name.trim(), mood })
  }

  return (
    <div className="w-full max-w-md glass rounded-3xl p-8 shadow-soft animate-fadeIn">
      <div className="flex flex-col items-center gap-4">
        <div className="glow-circle animate-glowPulse" />
        <h1 className="text-2xl font-semibold neon">Aria AI</h1>
        <p className="text-sm text-white/70">Interview Assistant</p>
      </div>
      <div className="mt-8 space-y-4">
        <div>
          <label className="block text-sm mb-2 text-white/90">Your Name</label>
          <input
            className="w-full input-style rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-neonCyan transition"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm mb-2 text-white/90">Mood</label>
          <select
            className="w-full input-style rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-neonCyan transition"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          >
            <option>Happy</option>
            <option>Nervous</option>
            <option>Confident</option>
            <option>Tired</option>
          </select>
        </div>
        <button
          onClick={handleContinue}
          disabled={!canContinue}
          className={`w-full mt-2 rounded-xl px-4 py-3 font-medium transition ${
            canContinue
              ? 'bg-neonCyan text-black hover:brightness-110'
              : 'bg-white/10 text-white/50 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  )
}
