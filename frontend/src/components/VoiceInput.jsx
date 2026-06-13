import React, { useState, useRef } from 'react'

export default function VoiceInput({ onTranscript, language }) {
  const [listening, setListening] = useState(false)
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window)
  const recognitionRef = useRef(null)

  if (!supported) return null

  const start = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognitionRef.current = recognition
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onstart = () => setListening(true)
    recognition.onend = () => setListening(false)
    recognition.onerror = () => setListening(false)
    recognition.onresult = (e) => onTranscript(e.results[0][0].transcript)
    recognition.start()
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <button
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        border: 'none',
        background: listening ? '#fee2e2' : 'transparent',
        color: listening ? '#ef4444' : '#86868b',
        cursor: 'pointer',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
        animation: listening ? 'pulse 1s ease infinite' : 'none',
      }}
      onMouseDown={start}
      onMouseUp={stop}
      onTouchStart={start}
      onTouchEnd={stop}
      title={listening ? 'Release to stop' : 'Hold to speak'}
      type="button"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  )
}
