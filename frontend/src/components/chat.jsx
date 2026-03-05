import { useEffect, useMemo, useRef, useState } from 'react'

export default function Chat({ name, mood, onReset }) {
  const [messages, setMessages] = useState([
    { sender: 'aria', text: `Hi ${name}. I am Aria. Ready for interview prep.` },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const listRef = useRef(null)
  const SpeechRecognition = useMemo(
    () => window.SpeechRecognition || window.webkitSpeechRecognition,
    []
  )
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (!messages.length) return
    const last = messages[messages.length - 1]
    if (last.sender === 'aria') {
      const utter = new SpeechSynthesisUtterance(last.text)
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

  const sendMessage = async () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    const userMsg = { sender: 'user', text: trimmed }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setIsLoading(true)
    try {
      const res = await fetch("http://127.0.0.1:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed })
      })
      const data = await res.json()
      const reply = typeof data?.reply === 'string' ? data.reply : ''
      const ariaMsg = { sender: 'aria', text: reply || '...' }
      setMessages((m) => [...m, ariaMsg])
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
    if (!SpeechRecognition) return
    const rec = new SpeechRecognition()
    recognitionRef.current = rec
    rec.continuous = false
    rec.interimResults = true
    rec.lang = 'en-US'
    rec.onresult = (event) => {
      let t = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        t += event.results[i][0].transcript
      }
      setInput(t)
    }
    rec.onerror = () => {}
    rec.onend = () => {}
    rec.start()
  }

  return (
    <div className="w-full max-w-4xl glass rounded-3xl p-6 md:p-8 shadow-soft animate-fadeIn">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`glow-circle ${isSpeaking ? 'animate-speakingPulse' : 'animate-glowPulse'}`} />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-semibold neon">Aria AI</h2>
              <span className="text-lg">🟢</span>
              <span className="text-sm text-white/70">Online</span>
            </div>
            <div className="text-xs text-white/70">With {name} • Mood: {mood}</div>
          </div>
        </div>
        <button
          className="text-white/70 hover:text-white transition text-sm"
          onClick={() => {
            localStorage.removeItem('aria_name')
            localStorage.removeItem('aria_mood')
            onReset()
          }}
        >
          Logout
        </button>
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
                <span>Aria is thinking</span>
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
          🎤
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
      </div>
    </div>
  )
}
