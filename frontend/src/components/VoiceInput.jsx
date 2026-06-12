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
    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript
      onTranscript(transcript)
    }

    recognition.start()
  }

  const stop = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  return (
    <button
      style={{
        ...styles.btn,
        background: listening ? '#ef4444' : '#f5f5f5',
        color: listening ? '#fff' : '#666',
        animation: listening ? 'pulse 1s ease infinite' : 'none',
      }}
      onMouseDown={start}
      onMouseUp={stop}
      onTouchStart={start}
      onTouchEnd={stop}
      title={listening ? 'Release to stop' : 'Hold to speak'}
      type="button"
    >
      🎤
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }`}</style>
    </button>
  )
}

const styles = {
  btn: {
    width: 42, height: 42, borderRadius: '50%', border: 'none',
    cursor: 'pointer', fontSize: 18, flexShrink: 0,
    transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
}
