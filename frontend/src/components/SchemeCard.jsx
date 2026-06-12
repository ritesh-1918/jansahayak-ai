import React, { useState } from 'react'

export default function SchemeCard({ scheme }) {
  const [expanded, setExpanded] = useState(false)
  const pct = Math.round(scheme.confidence * 100)

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.nameRow}>
          <span style={styles.badge}>✅</span>
          <span style={styles.name}>{scheme.name}</span>
        </div>
        <div style={{ ...styles.confidence, background: pct >= 90 ? '#16a34a22' : '#FF993322', color: pct >= 90 ? '#15803d' : '#c2410c' }}>
          {pct}% match
        </div>
      </div>

      <p style={styles.benefit}>{scheme.benefit}</p>

      <p style={styles.whyLabel}>Why you qualify:</p>
      <p style={styles.why}>{scheme.why_eligible}</p>

      {expanded && (
        <>
          <p style={styles.docsLabel}>Documents needed:</p>
          <ul style={styles.docList}>
            {scheme.documents_needed.map((doc, i) => (
              <li key={i} style={styles.docItem}>
                <span style={styles.checkbox}>☐</span> {doc}
              </li>
            ))}
          </ul>
          <a href={scheme.apply_url} target="_blank" rel="noreferrer" style={styles.applyBtn}>
            Apply Now →
          </a>
        </>
      )}

      <button style={styles.toggleBtn} onClick={() => setExpanded(v => !v)}>
        {expanded ? '▲ Show less' : '▼ Documents & Apply'}
      </button>
    </div>
  )
}

const styles = {
  card: {
    background: '#fff',
    border: '1.5px solid #FF993340',
    borderRadius: 14,
    padding: '16px 18px',
    marginBottom: 10,
    boxShadow: '0 2px 12px rgba(255,153,51,0.08)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  nameRow: { display: 'flex', gap: 6, alignItems: 'flex-start', flex: 1 },
  badge: { fontSize: 16, flexShrink: 0, marginTop: 1 },
  name: { fontFamily: "'Baloo 2', sans-serif", fontWeight: 700, fontSize: 14, color: '#1a1a1a', lineHeight: 1.3 },
  confidence: {
    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
    flexShrink: 0, letterSpacing: 0.3, fontFamily: "'Hind', sans-serif",
  },
  benefit: { fontSize: 13, color: '#FF6600', fontWeight: 600, margin: '0 0 8px', fontFamily: "'Hind', sans-serif" },
  whyLabel: { fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, margin: '0 0 3px' },
  why: { fontSize: 13, color: '#444', margin: '0 0 10px', lineHeight: 1.5, fontFamily: "'Hind', sans-serif" },
  docsLabel: { fontSize: 11, fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: 0.5, margin: '8px 0 4px' },
  docList: { paddingLeft: 4, margin: '0 0 12px', listStyle: 'none' },
  docItem: { fontSize: 13, color: '#333', marginBottom: 4, display: 'flex', gap: 6, alignItems: 'center', fontFamily: "'Hind', sans-serif" },
  checkbox: { color: '#FF9933', fontWeight: 700 },
  applyBtn: {
    display: 'inline-block', background: '#FF9933', color: '#fff',
    textDecoration: 'none', padding: '7px 16px', borderRadius: 8,
    fontSize: 13, fontWeight: 700, marginBottom: 8, fontFamily: "'Baloo 2', sans-serif",
  },
  toggleBtn: {
    background: 'none', border: 'none', color: '#FF9933', fontSize: 12,
    cursor: 'pointer', padding: '4px 0', fontWeight: 600, display: 'block',
    fontFamily: "'Hind', sans-serif",
  },
}
