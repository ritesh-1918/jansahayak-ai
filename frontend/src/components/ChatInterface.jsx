import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import SchemeCard from './SchemeCard.jsx'
import VoiceInput from './VoiceInput.jsx'
import config from '../config.js'

const SESSION_KEY = 'jansahayak_session_id'

function parseBold(line) {
  return line.split(/\*\*(.+?)\*\*/g).map((part, j) =>
    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
  )
}

function renderMarkdown(text) {
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim()
    if (trimmed === '') return <div key={i} style={{ height: 6 }} />

    // Bullet: *, +, - (with optional leading whitespace)
    if (/^[\*\+\-]\s/.test(trimmed)) {
      const content = trimmed.replace(/^[\*\+\-]\s/, '')
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginTop: 2, paddingLeft: 4 }}>
          <span style={{ color: '#FF6B2C', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>•</span>
          <span>{parseBold(content)}</span>
        </div>
      )
    }
    // Numbered: 1. 2. etc
    if (/^\d+\.\s/.test(trimmed)) {
      const num = trimmed.match(/^(\d+)\./)[1]
      const content = trimmed.replace(/^\d+\.\s*/, '')
      return (
        <div key={i} style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <span style={{ color: '#FF6B2C', fontWeight: 700, flexShrink: 0, minWidth: 18 }}>{num}.</span>
          <span style={{ fontWeight: 600 }}>{parseBold(content)}</span>
        </div>
      )
    }
    return <div key={i} style={{ marginTop: i === 0 ? 0 : 2 }}>{parseBold(trimmed)}</div>
  })
}

function getOrCreateSession() {
  let id = localStorage.getItem(SESSION_KEY)
  if (!id) {
    id = 'web_' + Math.random().toString(36).slice(2, 11) + '_' + Date.now()
    localStorage.setItem(SESSION_KEY, id)
  }
  return id
}

const WELCOME = {
  en: "Hello! I'm JanSahayak AI — your personal guide to government welfare schemes.\n\nTell me about yourself (age, occupation, income, state) and I'll find every scheme you qualify for.",
  hi: "नमस्ते! मैं JanSahayak AI हूँ — सरकारी कल्याण योजनाओं के लिए आपका निजी मार्गदर्शक।\n\nमुझे अपने बारे में बताएं (उम्र, काम, आमदनी, राज्य) और मैं आपके लिए सभी योजनाएं खोजूँगा।",
}

export default function ChatInterface({ language, seedMessage, onSeedConsumed, examples, onExampleClick }) {
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

  useEffect(() => {
    if (seedMessage) {
      send(seedMessage)
      onSeedConsumed()
    }
  }, [seedMessage])

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
      }, { timeout: 30000 })
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.response + (data.next_question ? `\n\n${data.next_question}` : ''),
          schemes: data.schemes_matched || [],
        },
      ])
    } catch {
      const errMsg = language === 'hi'
        ? 'क्षमा करें, कोई समस्या हुई। कृपया पुनः प्रयास करें।'
        : 'Something went wrong. Please try again.'
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg, schemes: [] }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const hasConversation = messages.length > 1

  return (
    <div style={styles.container}>
      <div style={styles.feed}>
        {!hasConversation && !loading && (
          <div style={styles.emptyState}>
            <img src="/logo.png" alt="" style={styles.heroLogo} />
            <h2 style={styles.heroTitle}>
              {language === 'hi' ? 'आपकी योजना, आपका अधिकार' : 'Your scheme, your right'}
            </h2>
            <p style={styles.heroSub}>
              {language === 'hi'
                ? 'अपनी जानकारी बताएं — उम्र, काम, आमदनी, राज्य — और सेकंडों में अपनी योजनाएं पाएं'
                : 'Share your details — age, occupation, income, state — and discover your eligible schemes in seconds'}
            </p>
            <div style={styles.exampleGrid}>
              {examples?.map((ex, i) => (
                <button
                  key={i}
                  style={styles.exampleCard}
                  onClick={() => onExampleClick(ex.text)}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF6B2C'; e.currentTarget.style.background = '#fff8f5' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e7'; e.currentTarget.style.background = '#ffffff' }}
                >
                  <span style={styles.exampleIcon}>{ex.icon}</span>
                  <span style={styles.exampleText}>{ex.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => {
          if (i === 0 && !hasConversation) return null
          return (
            <div
              key={i}
              style={{
                ...styles.msgRow,
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                animation: 'fadeSlideUp 0.3s ease',
              }}
            >
              {msg.role === 'assistant' && (
                <div style={styles.avatar}>
                  <span style={styles.avatarLetter}>J</span>
                </div>
              )}
              <div style={styles.msgGroup}>
                <div style={msg.role === 'user' ? styles.userBubble : styles.botBubble}>
                  {msg.role === 'user'
                    ? msg.content
                    : renderMarkdown(msg.content)
                  }
                </div>
                {msg.schemes?.length > 0 && (
                  <div style={styles.schemesWrap}>
                    <div style={styles.schemesHeader}>
                      <span style={styles.schemesDot} />
                      {language === 'hi'
                        ? `${msg.schemes.length} योजनाएं मिलीं`
                        : `${msg.schemes.length} scheme${msg.schemes.length > 1 ? 's' : ''} found`}
                    </div>
                    {msg.schemes.map((s, j) => <SchemeCard key={j} scheme={s} />)}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {loading && (
          <div style={{ ...styles.msgRow, animation: 'fadeSlideUp 0.3s ease' }}>
            <div style={styles.avatar}>
              <span style={styles.avatarLetter}>J</span>
            </div>
            <div style={styles.botBubble}>
              <div style={styles.typingDots}>
                <span style={{ ...styles.dot, animationDelay: '0s' }} />
                <span style={{ ...styles.dot, animationDelay: '0.2s' }} />
                <span style={{ ...styles.dot, animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={styles.inputArea}>
        <div style={styles.inputWrap}>
          <VoiceInput language={language} onTranscript={(t) => { setInput(t); send(t) }} />
          <textarea
            ref={inputRef}
            style={styles.textarea}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder={language === 'hi' ? 'अपनी बात यहाँ लिखें...' : 'Describe yourself to find schemes...'}
            rows={1}
          />
          <button
            style={{
              ...styles.sendBtn,
              opacity: (input.trim() && !loading) ? 1 : 0.4,
              transform: (input.trim() && !loading) ? 'scale(1)' : 'scale(0.9)',
            }}
            onClick={() => send()}
            disabled={!input.trim() || loading}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <p style={styles.disclaimer}>
          {language === 'hi'
            ? 'JanSahayak AI सरकारी योजनाओं की जानकारी प्रदान करता है। आधिकारिक पोर्टल पर सत्यापित करें।'
            : 'JanSahayak AI provides information about government schemes. Verify on official portals.'}
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    maxWidth: 900,
    width: '100%',
    margin: '0 auto',
  },
  feed: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 20px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  emptyState: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    animation: 'fadeSlideUp 0.5s ease',
  },
  heroLogo: {
    height: 56,
    width: 'auto',
    maxWidth: 200,
    marginBottom: 16,
    objectFit: 'contain',
  },
  heroTitle: {
    fontFamily: "'Baloo 2', sans-serif",
    fontWeight: 800,
    fontSize: 26,
    color: '#1d1d1f',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 15,
    color: '#86868b',
    textAlign: 'center',
    maxWidth: 460,
    lineHeight: 1.5,
    marginBottom: 28,
  },
  exampleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
    width: '100%',
    maxWidth: 560,
  },
  exampleCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '14px 16px',
    background: '#ffffff',
    border: '1px solid #e5e5e7',
    borderRadius: 12,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    fontFamily: "'Inter', sans-serif",
  },
  exampleIcon: {
    fontSize: 20,
    flexShrink: 0,
    marginTop: 1,
  },
  exampleText: {
    fontSize: 13,
    color: '#424245',
    lineHeight: 1.45,
  },
  msgRow: {
    display: 'flex',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 8,
    flexShrink: 0,
    marginTop: 2,
    background: 'linear-gradient(135deg, #FF6B2C, #ff9a6c)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 14,
    fontWeight: 700,
    color: '#ffffff',
    fontFamily: "'Baloo 2', sans-serif",
    lineHeight: 1,
  },
  msgGroup: {
    maxWidth: '80%',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  userBubble: {
    maxWidth: '100%',
    padding: '10px 16px',
    borderRadius: '18px 18px 4px 18px',
    background: '#FF6B2C',
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 1.55,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  botBubble: {
    maxWidth: '100%',
    padding: '12px 16px',
    borderRadius: '18px 18px 18px 4px',
    background: '#ffffff',
    color: '#1d1d1f',
    fontSize: 14,
    lineHeight: 1.6,
    wordBreak: 'break-word',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #e5e5e7',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  schemesWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    maxWidth: 440,
  },
  schemesHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    fontWeight: 600,
    color: '#10b981',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  schemesDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: '#10b981',
    flexShrink: 0,
  },
  typingDots: {
    display: 'flex',
    gap: 4,
    alignItems: 'center',
    padding: '4px 0',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    background: '#c7c7cc',
    display: 'inline-block',
    animation: 'dotPulse 1.2s ease infinite',
  },
  inputArea: {
    flexShrink: 0,
    padding: '12px 20px 16px',
    background: '#f5f5f7',
  },
  inputWrap: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 8,
    background: '#ffffff',
    border: '1px solid #d2d2d7',
    borderRadius: 16,
    padding: '8px 8px 8px 12px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  textarea: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    resize: 'none',
    lineHeight: 1.45,
    maxHeight: 120,
    overflowY: 'auto',
    padding: '4px 0',
    background: 'transparent',
    color: '#1d1d1f',
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: '#FF6B2C',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 11,
    color: '#aeaeb2',
    marginTop: 8,
    lineHeight: 1.4,
  },
}
