import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import SchemeCard from './SchemeCard.jsx'
import VoiceInput from './VoiceInput.jsx'
import config from '../config.js'

const SESSION_KEY = 'jansahayak_session_id'

function getOrCreateSession() {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = 'web_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

const WELCOME = {
  en: "Namaste 🙏 I'm JanSahayak AI — your personal welfare guide.\n\nTell me about yourself (age, occupation, income, state) and I'll find all the government schemes you qualify for.\n\nExample: \"I am a 35 year old farmer in Bihar with 2 acres land and annual income of ₹80,000\"",
  hi: "नमस्ते 🙏 मैं JanSahayak AI हूँ — आपका व्यक्तिगत कल्याण मार्गदर्शक।\n\nमुझे अपने बारे में बताएं (उम्र, काम, आमदनी, राज्य) और मैं उन सभी सरकारी योजनाओं को खोजूँगा जिनके लिए आप पात्र हैं।",
}

export default function ChatInterface() {
  const [language, setLanguage] = useState('en')
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId] = useState(getOrCreateSession)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    setMessages([{ role: 'assistant', content: WELCOME[language], schemes: [] }])
  }, [language])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const msg = text || input.trim()
    if (!msg || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const { data } = await axios.post(`${config.API_BASE_URL}/chat`, {
        session_id: sessionId,
        message: msg,
        language,
      })
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response + (data.next_question ? `\n\n${data.next_question}` : ''),
          schemes: data.schemes_matched || [],
          provider: data.provider_used,
        },
      ])
    } catch (err) {
      const errMsg = language === 'hi'
        ? 'क्षमा करें, कोई समस्या हुई। कृपया बैकएंड सर्वर की जाँच करें।'
        : 'Sorry, something went wrong. Please check the backend server is running on port 8000.'
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg, schemes: [] }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <div style={styles.container}>
      {/* Language toggle */}
      <div style={styles.langRow}>
        <button style={{ ...styles.langBtn, ...(language === 'en' ? styles.langActive : {}) }} onClick={() => setLanguage('en')}>English</button>
        <button style={{ ...styles.langBtn, ...(language === 'hi' ? styles.langActive : {}) }} onClick={() => setLanguage('hi')}>हिंदी</button>
        <span style={styles.sessionLabel}>Session: {sessionId.slice(-8)}</span>
      </div>

      {/* Messages */}
      <div style={styles.feed}>
        {messages.map((msg, i) => (
          <div key={i}>
            <div style={{ ...styles.bubble, ...(msg.role === 'user' ? styles.userBubble : styles.botBubble) }}>
              {msg.content.split('\n').map((line, j) => (
                <span key={j}>{line}{j < msg.content.split('\n').length - 1 && <br />}</span>
              ))}
              {msg.provider && <span style={styles.providerTag}> [{msg.provider}]</span>}
            </div>
            {msg.schemes?.length > 0 && (
              <div style={styles.schemesWrap}>
                <p style={styles.schemesHeading}>
                  {language === 'hi' ? `${msg.schemes.length} योजनाएं मिलीं:` : `${msg.schemes.length} schemes found for you:`}
                </p>
                {msg.schemes.map((s, j) => <SchemeCard key={j} scheme={s} />)}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ ...styles.bubble, ...styles.botBubble }}>
            <span style={styles.typing}>
              <span />
              <span />
              <span />
            </span>
            <style>{`
              @keyframes typingDot { 0%,60%,100%{opacity:.3;transform:translateY(0)} 30%{opacity:1;transform:translateY(-4px)} }
              .typing-dot { display:inline-block; width:7px; height:7px; border-radius:50%; background:#aaa; margin:0 2px; animation:typingDot 1.2s ease infinite; }
              .typing-dot:nth-child(2){animation-delay:.2s}
              .typing-dot:nth-child(3){animation-delay:.4s}
            `}</style>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={styles.inputBar}>
        <VoiceInput language={language} onTranscript={(t) => { setInput(t); send(t) }} />
        <textarea
          ref={inputRef}
          style={styles.textarea}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder={language === 'hi' ? 'अपनी बात यहाँ लिखें...' : 'Type your message here…'}
          rows={1}
        />
        <button
          style={{ ...styles.sendBtn, opacity: (input.trim() && !loading) ? 1 : 0.5 }}
          onClick={() => send()}
          disabled={!input.trim() || loading}
        >
          ➤
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex', flexDirection: 'column', height: '100%', background: '#FAFAF8',
  },
  langRow: {
    display: 'flex', gap: 8, padding: '10px 16px', background: '#fff',
    borderBottom: '1px solid #eee', alignItems: 'center',
  },
  langBtn: {
    padding: '5px 14px', borderRadius: 20, border: '1.5px solid #FF9933',
    background: 'transparent', color: '#FF9933', cursor: 'pointer',
    fontFamily: "'Hind', sans-serif", fontWeight: 600, fontSize: 13, transition: 'all 0.2s',
  },
  langActive: { background: '#FF9933', color: '#fff' },
  sessionLabel: { marginLeft: 'auto', fontSize: 11, color: '#bbb', fontFamily: 'monospace' },
  feed: {
    flex: 1, overflowY: 'auto', padding: '16px 12px 8px',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  bubble: {
    maxWidth: '80%', padding: '10px 14px', borderRadius: 16, fontSize: 14,
    lineHeight: 1.55, fontFamily: "'Hind', sans-serif", whiteSpace: 'pre-wrap', wordBreak: 'break-word',
  },
  userBubble: {
    alignSelf: 'flex-end', background: '#FF9933', color: '#fff',
    borderBottomRightRadius: 4, marginBottom: 6,
  },
  botBubble: {
    alignSelf: 'flex-start', background: '#fff', color: '#1a1a1a',
    border: '1px solid #eee', borderBottomLeftRadius: 4, marginBottom: 6,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  providerTag: { fontSize: 10, opacity: 0.4, fontFamily: 'monospace' },
  schemesWrap: { marginLeft: 4, marginBottom: 8, maxWidth: 420 },
  schemesHeading: {
    fontSize: 12, fontWeight: 700, color: '#FF6600', textTransform: 'uppercase',
    letterSpacing: 0.5, margin: '0 0 8px', fontFamily: "'Baloo 2', sans-serif",
  },
  typing: { display: 'inline-flex', gap: 3, alignItems: 'center', padding: '2px 0' },
  inputBar: {
    display: 'flex', gap: 8, padding: '10px 12px', background: '#fff',
    borderTop: '1px solid #eee', alignItems: 'flex-end',
  },
  textarea: {
    flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 12, padding: '10px 12px',
    fontSize: 14, fontFamily: "'Hind', sans-serif", resize: 'none', outline: 'none',
    lineHeight: 1.4, maxHeight: 100, overflowY: 'auto',
    transition: 'border-color 0.2s',
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: '50%', background: '#FF9933',
    color: '#fff', border: 'none', fontSize: 16, cursor: 'pointer',
    flexShrink: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
}
