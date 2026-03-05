import { useEffect, useMemo, useRef, useState } from 'react'

export default function App() {
  const [auth, setAuth] = useState(() => {
    const email = localStorage.getItem('aria_email') || ''
    const name = localStorage.getItem('aria_name') || ''
    const password = localStorage.getItem('aria_password') || ''
    if (email && password) return { email, password, name }
    return null
  })
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [stage, setStage] = useState('Introduction')
  const [scores, setScores] = useState({ 'Introduction': null, 'HR Round': null, 'Technical Round': null, Feedback: null })
  const [strengths, setStrengths] = useState({ 'Introduction': [], 'HR Round': [], 'Technical Round': [], Feedback: [] })
  const [improvements, setImprovements] = useState({ 'Introduction': [], 'HR Round': [], 'Technical Round': [], Feedback: [] })
  const [showSummary, setShowSummary] = useState(false)
  const listRef = useRef(null)
  const SpeechRecognition = useMemo(() => window.SpeechRecognition || window.webkitSpeechRecognition, [])
  const recognitionRef = useRef(null)
  const [micActive, setMicActive] = useState(false)
  const lastFeedbackRef = useRef('')

  useEffect(() => {
    const storedEmail = localStorage.getItem('aria_email') || ''
    const storedName = localStorage.getItem('aria_name') || ''
    const storedPassword = localStorage.getItem('aria_password') || ''
    if (storedEmail && storedPassword) setAuth({ email: storedEmail, password: storedPassword, name: storedName || '' })
  }, [])

  useEffect(() => {
    if (auth && messages.length === 0) {
      const greetName = auth.name?.trim() ? auth.name.trim() : auth.email
      setMessages([{ sender: 'aria', text: `Hi ${greetName}, welcome to your interview session. Let’s start the ${stage}.` }])
    }
  }, [auth])

  const voices = useMemo(() => {
    return window.speechSynthesis.getVoices()
  }, [])

  const chooseFemaleVoice = () => {
    const v = window.speechSynthesis.getVoices()
    const preferred = [
      'Microsoft Zira - English (United States)',
      'Google UK English Female',
      'Microsoft Jessa Online (Natural) - English (United States)',
      'Samantha',
      'Shelley',
      'Karen',
    ]
    for (const name of preferred) {
      const found = v.find((vv) => vv.name === name)
      if (found) return found
    }
    const generic = v.find((vv) => /female/i.test(vv.name)) || v.find((vv) => /en/i.test(vv.lang))
    return generic || v[0] || null
  }

  useEffect(() => {
    if (!messages.length) return
    const last = messages[messages.length - 1]
    if (last.sender === 'aria') {
      const voice = chooseFemaleVoice()
      const utter = new SpeechSynthesisUtterance(last.text)
      if (voice) utter.voice = voice
      utter.pitch = 1.1
      utter.rate = 1
      setIsSpeaking(true)
      utter.onend = () => setIsSpeaking(false)
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utter)
    }
  }, [messages])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const computeScore = (userText, ariaText) => {
    const len = Math.min(200, userText.length)
    let base = Math.ceil(len / 20)
    const keywords = ['impact', 'ownership', 'design', 'scalability', 'testing', 'leadership', 'metrics']
    for (const k of keywords) {
      if (new RegExp(k, 'i').test(userText)) base += 1
    }
    if (/clear|good|strong/i.test(ariaText)) base += 1
    return Math.max(1, Math.min(10, base))
  }

  const generateFeedback = (userText) => {
    const positives = []
    const areas = []
    if (/structure|outline|steps/i.test(userText)) positives.push('Clear structure')
    if (/impact|result|metric|increase|reduced/i.test(userText)) positives.push('Impact focus')
    if (/design|architecture|scalability|performance/i.test(userText)) positives.push('Technical depth')
    if (/team|stakeholder|communication|leadership/i.test(userText)) positives.push('Collaboration')
    if (positives.length === 0) areas.push('Add structure to your answer')
    if (!/impact|result|metric/i.test(userText)) areas.push('Highlight measurable impact')
    if (!/testing|quality|reliability/i.test(userText)) areas.push('Mention testing and reliability')
    let tone = 'motivate'
    if (positives.length >= 2) tone = 'encourage'
    else if (positives.length === 1) tone = 'improve'
    const lines = {
      encourage: [
        'Strong direction—great clarity and impact. Keep it up.',
        'Nice work. Confident and structured answer.',
        'Excellent—clear reasoning and measurable outcomes.',
      ],
      improve: [
        'Good start. Add structure and highlight impact to strengthen it.',
        'Promising answer—include metrics and testing for completeness.',
        'Improve by outlining steps and linking to results.',
      ],
      motivate: [
        'You’ve got this. Outline steps and highlight impact next time.',
        'No worries—try a concise structure and mention results.',
        'Let’s focus on steps, metrics, and testing for a stronger answer.',
      ],
    }
    // choose line not equal to last used
    const pool = lines[tone]
    let chosen = pool[0]
    for (const l of pool) {
      if (l !== lastFeedbackRef.current) {
        chosen = l
        break
      }
    }
    lastFeedbackRef.current = chosen
    return { positives, areas, tone, line: chosen }
  }

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    const userMsg = { sender: 'user', text: trimmed }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setIsLoading(true)
    try {
      const guidelines = `Guidelines: If correct encourage; if partial suggest improvements; if wrong motivate constructively; avoid repeating generic lines; be human and dynamic.`
      const structured = `[Stage: ${stage}] [Candidate: ${auth?.name || auth?.email || 'Guest'}] ${guidelines} ${trimmed}`
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: structured })
      })
      const data = await res.json()
      const reply = typeof data?.reply === 'string' ? data.reply : ''
      const ariaMsg = { sender: 'aria', text: reply || '...' }
      const fb = generateFeedback(trimmed)
      setMessages((m) => [...m, ariaMsg, { sender: 'aria', text: fb.line }])
      const stageKey = stage
      const score = computeScore(trimmed, reply || '')
      setScores((s) => ({ ...s, [stageKey]: score }))
      setStrengths((st) => ({ ...st, [stageKey]: fb.positives }))
      setImprovements((im) => ({ ...im, [stageKey]: fb.areas }))
      if (stage === 'Feedback') setShowSummary(true)
    } catch (e) {
      setMessages((m) => [...m, { sender: 'aria', text: 'Network error' }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  const startVoiceInput = () => {
    if (!SpeechRecognition) {
      setMessages((m) => [...m, { sender: 'aria', text: 'Voice recognition not supported in this browser.' }])
      return
    }
    // Stop existing
    if (recognitionRef.current) {
      try { recognitionRef.current.stop() } catch {}
    }
    const rec = new SpeechRecognition()
    recognitionRef.current = rec
    rec.continuous = false
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.onstart = () => setMicActive(true)
    rec.onerror = (err) => {
      setMicActive(false)
      setMessages((m) => [...m, { sender: 'aria', text: `Mic error: ${err.error || 'Permission or input issue'}` }])
    }
    rec.onend = () => setMicActive(false)
    rec.onresult = (event) => {
      let final = ''
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i]
        if (r.isFinal) final += r[0].transcript
        else interim += r[0].transcript
      }
      setInput((prev) => (final ? final : interim || prev))
    }
    try {
      rec.start()
    } catch {}
  }

  const progressClass = (label) => {
    if (label === stage) return 'step active'
    const order = ['HR Round', 'Technical Round', 'Feedback']
    const currentIndex = order.indexOf(stage)
    const labelIndex = order.indexOf(label)
    return labelIndex < currentIndex ? 'step done' : 'step'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] flex items-center justify-center p-4">
      {!auth ? (
        <div className="w-full max-w-md glass rounded-3xl p-8 shadow-soft">
          <div className="flex items-center gap-4 mb-6">
            <div className="glow-circle animate-glowPulse" />
            <div>
              <h2 className="text-2xl font-semibold neon">Aria AI - Interview Assistant</h2>
              <div className="text-xs text-white/70">🟢 Online</div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2 text-white/90">Full Name</label>
              <input
                className="w-full input-style rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-neonCyan transition"
                placeholder="Your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-white/90">Email</label>
              <input
                className="w-full input-style rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-neonCyan transition"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-white/90">Password</label>
              <input
                className="w-full input-style rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-neonCyan transition"
                placeholder="Enter password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="mt-2 text-xs text-white/70 hover:text-white transition"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide password' : 'Show password'}
              </button>
            </div>
            <button
              onClick={() => {
                if (!email.trim() || !password.trim() || !fullName.trim()) return
                localStorage.setItem('aria_name', fullName.trim())
                localStorage.setItem('aria_email', email.trim())
                localStorage.setItem('aria_password', password.trim())
                setAuth({ email: email.trim(), password: password.trim(), name: fullName.trim() })
              }}
              className="w-full rounded-xl px-4 py-3 font-medium bg-neonCyan text-black hover:brightness-110 transition"
            >
              Login
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-4xl glass rounded-3xl p-6 md:p-8 shadow-soft">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`glow-circle ${isSpeaking ? 'animate-speakingPulse' : 'animate-glowPulse'}`} />
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl md:text-2xl font-semibold neon">Aria AI - Interview Assistant</h2>
                  <span className="text-lg">🟢</span>
                  <span className="text-sm text-white/70">Online</span>
                </div>
                <div className="text-xs text-white/70">Signed in as {auth.name || auth.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="stage-pill rounded-xl px-3 py-2 text-xs md:text-sm">Stage: {stage}</span>
              <select
                className="input-style rounded-xl px-3 py-2 text-xs md:text-sm outline-none focus:ring-2 focus:ring-neonCyan transition"
                value={stage}
                onChange={(e) => setStage(e.target.value)}
              >
                <option>Introduction</option>
                <option>HR Round</option>
                <option>Technical Round</option>
                <option>Feedback</option>
              </select>
              <span className="rating-pill">Score: {scores[stage] ?? '—'}/10</span>
              <button
                className="text-white/70 hover:text-white transition text-sm"
                onClick={() => {
                  localStorage.removeItem('aria_email')
                  localStorage.removeItem('aria_password')
                  localStorage.removeItem('aria_name')
                  setAuth(null)
                  setMessages([])
                  setScores({ 'Introduction': null, 'HR Round': null, 'Technical Round': null, Feedback: null })
                  setStrengths({ 'Introduction': [], 'HR Round': [], 'Technical Round': [], Feedback: [] })
                  setImprovements({ 'Introduction': [], 'HR Round': [], 'Technical Round': [], Feedback: [] })
                }}
              >
                Logout
              </button>
            </div>
          </div>

          <div className="mt-4 progress">
            <div className={progressClass('HR Round')}>HR Round</div>
            <div className={progressClass('Technical Round')}>Technical Round</div>
            <div className={progressClass('Feedback')}>Feedback</div>
          </div>

          <div
            ref={listRef}
            className="scrollbar mt-6 h-[56vh] md:h-[58vh] overflow-y-auto rounded-2xl p-4 bg-white/5"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`w-full flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}
              >
                <div
                  className={`max-w-[80%] bubble rounded-2xl px-4 py-3 text-sm md:text-base animate-fadeIn ${
                    m.sender === 'user'
                      ? 'border border-neonCyan/40 text-white ml-6'
                      : 'border border-white/10 text-white mr-6'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="w-full flex justify-start mb-2">
                <div className="max-w-[60%] bubble rounded-2xl px-4 py-3 text-sm border border-white/10 text-white">
                  <div className="flex items-center gap-2">
                    <span>Aria is typing…</span>
                    <span className="inline-flex gap-1">
                      <span className="animate-thinkingDots">.</span>
                      <span className="animate-thinkingDots" style={{ animationDelay: '0.2s' }}>.</span>
                      <span className="animate-thinkingDots" style={{ animationDelay: '0.4s' }}>.</span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={startVoiceInput}
              className="h-11 w-11 rounded-xl bg-neonCyan text-black hover:brightness-110 transition flex items-center justify-center"
              title="Voice input"
            >
              {micActive ? '🛑' : '🎤'}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask interview questions or practice answers"
              className="flex-1 input-style rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-neonCyan transition"
            />
            <button
              onClick={sendMessage}
              className="rounded-xl px-5 py-3 bg-neonCyan text-black font-medium hover:brightness-110 transition"
            >
              Send
            </button>
            <button
              onClick={() => setShowSummary(true)}
              className="rounded-xl px-5 py-3 bg-white/10 text-white hover:bg-white/20 transition"
            >
              Summary
            </button>
          </div>

          {showSummary && (
            <div className="modal-overlay">
              <div className="modal-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="glow-circle animate-glowPulse" />
                  <div>
                    <div className="text-xl font-semibold neon">Interview Summary</div>
                    <div className="text-xs text-white/70">Candidate: {auth.email}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="rating-pill">Introduction: {scores['Introduction'] ?? '—'}/10</div>
                  <div className="rating-pill">HR Round: {scores['HR Round'] ?? '—'}/10</div>
                  <div className="rating-pill">Technical Round: {scores['Technical Round'] ?? '—'}/10</div>
                  <div className="rating-pill">Feedback: {scores['Feedback'] ?? '—'}/10</div>
                </div>
                <div className="bubble border border-white/10 rounded-2xl p-4 mb-4">
                  <div className="text-sm text-white/80">
                    Messages: {messages.length}. Aim for clarity, structure, and impact in responses to improve ratings.
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="bubble border border-white/10 rounded-2xl p-4">
                    <div className="text-sm font-semibold mb-2 neon">Strengths</div>
                    <ul className="text-sm text-white/80 space-y-1">
                      {(strengths['Introduction'].concat(strengths['HR Round'] || [], strengths['Technical Round'] || [], strengths['Feedback'] || [])).map((s, idx) => (
                        <li key={idx}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bubble border border-white/10 rounded-2xl p-4">
                    <div className="text-sm font-semibold mb-2 neon">Improvement Areas</div>
                    <ul className="text-sm text-white/80 space-y-1">
                      {(improvements['Introduction'].concat(improvements['HR Round'] || [], improvements['Technical Round'] || [], improvements['Feedback'] || [])).map((s, idx) => (
                        <li key={idx}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowSummary(false)}
                    className="rounded-xl px-4 py-2 bg-white/10 text-white hover:bg-white/20 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
