import React, { useState } from 'react'

export default function SchemeCard({ scheme }) {
  const [expanded, setExpanded] = useState(false)
  const pct = Math.round(scheme.confidence * 100)

  return (
    <div style={styles.card}>
      <div style={styles.top}>
        <div style={styles.nameWrap}>
          <div style={styles.checkCircle}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span style={styles.name}>{scheme.name}</span>
        </div>
        <div style={styles.matchBar}>
          <div style={{ ...styles.matchFill, width: `${pct}%`, background: pct >= 85 ? '#10b981' : '#f59e0b' }} />
        </div>
        <span style={{ ...styles.matchLabel, color: pct >= 85 ? '#10b981' : '#f59e0b' }}>{pct}%</span>
      </div>

      <p style={styles.benefit}>{scheme.benefit}</p>

      <div style={styles.whyBlock}>
        <span style={styles.whyLabel}>Why you qualify</span>
        <p style={styles.whyText}>{scheme.why_eligible}</p>
      </div>

      {expanded && (
        <div style={{ animation: 'fadeSlideUp 0.25s ease' }}>
          <div style={styles.docsBlock}>
            <span style={styles.docsLabel}>Documents needed</span>
            <div style={styles.docList}>
              {scheme.documents_needed.map((doc, i) => (
                <div key={i} style={styles.docItem}>
                  <div style={styles.docCheck}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#d2d2d7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                    </svg>
                  </div>
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
          {scheme.apply_url && (
            <a href={scheme.apply_url} target="_blank" rel="noreferrer" style={styles.applyBtn}>
              Apply Now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 6 }}>
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          )}
        </div>
      )}

      <button
        style={styles.toggle}
        onClick={() => setExpanded(v => !v)}
        onMouseEnter={e => e.currentTarget.style.color = '#FF6B2C'}
        onMouseLeave={e => e.currentTarget.style.color = '#86868b'}
      >
        {expanded ? 'Show less' : 'Documents & Apply'}
        <svg
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ marginLeft: 4, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  )
}

const styles = {
  card: {
    background: '#ffffff',
    border: '1px solid #e5e5e7',
    borderRadius: 14,
    padding: '16px',
    transition: 'border-color 0.2s',
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  nameWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#ecfdf5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  name: {
    fontWeight: 600,
    fontSize: 14,
    color: '#1d1d1f',
    lineHeight: 1.3,
  },
  matchBar: {
    width: 48,
    height: 4,
    borderRadius: 2,
    background: '#f0f0f0',
    flexShrink: 0,
    overflow: 'hidden',
  },
  matchFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.5s ease',
  },
  matchLabel: {
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  benefit: {
    fontSize: 13,
    color: '#FF6B2C',
    fontWeight: 600,
    margin: '0 0 10px',
    lineHeight: 1.4,
  },
  whyBlock: {
    marginBottom: 4,
  },
  whyLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    display: 'block',
    marginBottom: 3,
  },
  whyText: {
    fontSize: 13,
    color: '#424245',
    margin: 0,
    lineHeight: 1.5,
  },
  docsBlock: {
    marginTop: 12,
    paddingTop: 12,
    borderTop: '1px solid #f0f0f0',
  },
  docsLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#86868b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    display: 'block',
    marginBottom: 8,
  },
  docList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  docItem: {
    display: 'flex',
    gap: 8,
    alignItems: 'center',
    fontSize: 13,
    color: '#424245',
  },
  docCheck: {
    flexShrink: 0,
  },
  applyBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    marginTop: 14,
    padding: '9px 18px',
    background: '#FF6B2C',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    transition: 'background 0.2s',
  },
  toggle: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    color: '#86868b',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    padding: '8px 0 0',
    transition: 'color 0.2s',
    fontFamily: "'Inter', sans-serif",
  },
}
