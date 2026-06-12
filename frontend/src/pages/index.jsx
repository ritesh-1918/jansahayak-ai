import React from 'react'
import ChatInterface from '../components/ChatInterface.jsx'

export default function IndexPage() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logoWrap}>
          <div style={styles.logoIcon}>🇮🇳</div>
          <div>
            <h1 style={styles.logoText}>JanSahayak AI</h1>
            <p style={styles.tagline}>India's Autonomous Welfare Navigator</p>
          </div>
        </div>
        <div style={styles.badges}>
          <span style={styles.badge}>LangGraph Agent</span>
          <span style={{ ...styles.badge, background: '#16a34a22', color: '#15803d' }}>10 Schemes</span>
          <span style={{ ...styles.badge, background: '#7c3aed22', color: '#6d28d9' }}>HackArena 2.0</span>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.chatBox}>
          <ChatInterface />
        </div>

        <aside style={styles.sidebar}>
          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>How it works</h3>
            <div style={styles.step}><span style={styles.stepNum}>1</span><span>Tell me your age, occupation, income & state</span></div>
            <div style={styles.step}><span style={styles.stepNum}>2</span><span>AI matches you to eligible government schemes</span></div>
            <div style={styles.step}><span style={styles.stepNum}>3</span><span>Get documents checklist + direct apply links</span></div>
          </div>

          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>Try these examples</h3>
            {EXAMPLES.map((ex, i) => (
              <button key={i} style={styles.exampleBtn} onClick={() => {
                const ta = document.querySelector('textarea')
                if (ta) { ta.value = ex; ta.dispatchEvent(new Event('input', { bubbles: true })) }
              }}>
                {ex}
              </button>
            ))}
          </div>

          <div style={styles.infoCard}>
            <h3 style={styles.infoTitle}>Agentic Loop</h3>
            {['OBSERVE', 'REASON', 'ACT', 'VERIFY'].map((phase, i) => (
              <div key={i} style={styles.phase}>
                <div style={styles.phaseNum}>{i + 1}</div>
                <div>
                  <div style={styles.phaseName}>{phase}</div>
                  <div style={styles.phaseDesc}>{PHASE_DESC[phase]}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </main>

      <footer style={styles.footer}>
        Built for Bharat &nbsp;·&nbsp; Powered by LangGraph + Groq/Gemini &nbsp;·&nbsp; HackArena 2.0
      </footer>
    </div>
  )
}

const EXAMPLES = [
  'I am a 35 year old farmer in Bihar with 2 acres land and annual income of 80000',
  'I am a 22 year old OBC student in Maharashtra with income 1.5 lakh',
  'I am a 28 year old woman with BPL card in UP, no LPG connection',
  'I am a 40 year old daily wage worker in Rajasthan, income 60000',
]

const PHASE_DESC = {
  OBSERVE: 'Parse input, extract profile fields',
  REASON: 'Run eligibility engine across 10 schemes',
  ACT: 'Generate matched schemes + doc checklist',
  VERIFY: 'Ask clarifying questions if data incomplete',
}

const styles = {
  page: { display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 24px', background: '#fff', borderBottom: '1px solid #FF993320',
    boxShadow: '0 2px 8px rgba(255,153,51,0.07)', flexShrink: 0, flexWrap: 'wrap', gap: 8,
  },
  logoWrap: { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon: { fontSize: 32 },
  logoText: { fontFamily: "'Baloo 2', sans-serif", fontWeight: 800, fontSize: 22, color: '#FF6600', lineHeight: 1 },
  tagline: { fontSize: 12, color: '#888', fontFamily: "'Hind', sans-serif", marginTop: 2 },
  badges: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  badge: {
    fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
    background: '#FF993322', color: '#c2410c', fontFamily: "'Hind', sans-serif",
  },
  main: {
    flex: 1, display: 'flex', overflow: 'hidden', gap: 0,
  },
  chatBox: {
    flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden',
    borderRight: '1px solid #f0ede8',
    minWidth: 0,
  },
  sidebar: {
    width: 300, overflowY: 'auto', padding: '16px 14px', display: 'flex',
    flexDirection: 'column', gap: 12, background: '#fef9f4',
    '@media (max-width: 768px)': { display: 'none' },
  },
  infoCard: {
    background: '#fff', border: '1px solid #FF993320', borderRadius: 12,
    padding: '14px 16px', boxShadow: '0 1px 6px rgba(255,153,51,0.06)',
  },
  infoTitle: {
    fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 13,
    color: '#FF6600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10,
  },
  step: { display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8, fontSize: 13, color: '#444', lineHeight: 1.4 },
  stepNum: {
    width: 20, height: 20, borderRadius: '50%', background: '#FF9933', color: '#fff',
    fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  exampleBtn: {
    display: 'block', width: '100%', background: '#fff8f0', border: '1px solid #FF993330',
    borderRadius: 8, padding: '7px 10px', fontSize: 12, color: '#444', cursor: 'pointer',
    textAlign: 'left', marginBottom: 6, fontFamily: "'Hind', sans-serif", lineHeight: 1.4,
    transition: 'background 0.2s',
  },
  phase: { display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 10 },
  phaseNum: {
    width: 22, height: 22, borderRadius: '50%', background: '#FF993315', color: '#FF6600',
    fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, border: '1.5px solid #FF993340',
  },
  phaseName: { fontWeight: 700, fontSize: 12, color: '#1a1a1a', fontFamily: "'Baloo 2', sans-serif" },
  phaseDesc: { fontSize: 11, color: '#777', marginTop: 1, fontFamily: "'Hind', sans-serif" },
  footer: {
    textAlign: 'center', padding: '8px', fontSize: 11, color: '#bbb',
    background: '#fff', borderTop: '1px solid #eee', flexShrink: 0,
    fontFamily: "'Hind', sans-serif",
  },
}
