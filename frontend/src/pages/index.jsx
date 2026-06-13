import React, { useState } from 'react'
import ChatInterface from '../components/ChatInterface.jsx'

const EXAMPLES = [
  { icon: '👨‍🌾', text: 'I am a 35 year old farmer in Bihar with 2 acres land, income ₹80,000' },
  { icon: '🎓', text: 'I am a 22 year old OBC student in Maharashtra, family income ₹1.5 lakh' },
  { icon: '👩', text: 'I am a 28 year old woman with BPL card in UP, no LPG connection' },
  { icon: '👷', text: 'I am a 40 year old daily wage worker in Rajasthan, income ₹60,000' },
]

export default function IndexPage() {
  const [language, setLanguage] = useState('en')
  const [seedMessage, setSeedMessage] = useState(null)

  const handleExample = (text) => {
    setSeedMessage(text)
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.brand}>
            <img src="/logo.png" alt="JanSahayak AI" style={styles.logo} />
          </div>
          <div style={styles.langToggle}>
            <button
              style={language === 'en' ? styles.langActive : styles.langBtn}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
            <button
              style={language === 'hi' ? styles.langActive : styles.langBtn}
              onClick={() => setLanguage('hi')}
            >
              हिं
            </button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        <ChatInterface
          language={language}
          seedMessage={seedMessage}
          onSeedConsumed={() => setSeedMessage(null)}
          examples={EXAMPLES}
          onExampleClick={handleExample}
        />
      </main>
    </div>
  )
}

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    background: '#f5f5f7',
  },
  header: {
    background: '#ffffff',
    borderBottom: '1px solid #e5e5e7',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerInner: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    height: 38,
    width: 'auto',
    maxWidth: 160,
    objectFit: 'contain',
    borderRadius: 8,
  },
  langToggle: {
    display: 'flex',
    background: '#f5f5f7',
    borderRadius: 8,
    padding: 3,
    gap: 2,
  },
  langBtn: {
    padding: '6px 14px',
    borderRadius: 6,
    border: 'none',
    background: 'transparent',
    color: '#86868b',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    transition: 'all 0.2s',
  },
  langActive: {
    padding: '6px 14px',
    borderRadius: 6,
    border: 'none',
    background: '#ffffff',
    color: '#1d1d1f',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    transition: 'all 0.2s',
  },
  main: {
    flex: 1,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
}
