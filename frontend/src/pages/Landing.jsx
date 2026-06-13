import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── CONFIG — update WA_NUMBER with the actual WhatsApp test number ────────────
// Format: E.164 without + e.g. "919876543210" for +91 98765 43210
// Get it from: Meta Developer Console → WhatsApp → API Setup → test phone number
const WA_NUMBER = import.meta.env.VITE_WA_NUMBER || ''
const WA_HREF = WA_NUMBER
  ? `https://wa.me/${WA_NUMBER}`
  : null  // null = hide WhatsApp buttons until number is configured

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const C = {
  orange: '#FF6B2C',
  saffron: '#FF9933',
  green: '#138808',
  navy: '#1B2A4A',
  navyMid: '#2D4470',
  cream: '#FFF8F2',
  cream2: '#FFF3E8',
  white: '#FFFFFF',
  gray50: '#FAFAFA',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray900: '#111827',
}

// ─── ANIMATION STYLES (injected once) ─────────────────────────────────────────
const GLOBAL_CSS = `
  html { scroll-behavior: smooth; }

  [data-reveal] {
    opacity: 0;
    transition: opacity 0.72s cubic-bezier(0.16,1,0.3,1),
                transform 0.72s cubic-bezier(0.16,1,0.3,1);
  }
  [data-reveal="up"]    { transform: translateY(44px); }
  [data-reveal="left"]  { transform: translateX(-44px); }
  [data-reveal="right"] { transform: translateX(44px); }
  [data-reveal="scale"] { transform: scale(0.88); }
  [data-reveal="fade"]  { transform: none; }
  [data-reveal][data-vis] { opacity: 1 !important; transform: none !important; }

  [data-stagger] > * {
    opacity: 0;
    transform: translateY(32px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  [data-stagger][data-vis] > *:nth-child(1) { opacity:1;transform:none;transition-delay:0.00s; }
  [data-stagger][data-vis] > *:nth-child(2) { opacity:1;transform:none;transition-delay:0.09s; }
  [data-stagger][data-vis] > *:nth-child(3) { opacity:1;transform:none;transition-delay:0.18s; }
  [data-stagger][data-vis] > *:nth-child(4) { opacity:1;transform:none;transition-delay:0.27s; }
  [data-stagger][data-vis] > *:nth-child(5) { opacity:1;transform:none;transition-delay:0.36s; }
  [data-stagger][data-vis] > *:nth-child(6) { opacity:1;transform:none;transition-delay:0.45s; }

  @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  .marquee-track {
    animation: marquee 32s linear infinite;
    display: flex;
    will-change: transform;
    transform: translateZ(0);
  }
  .marquee-track:hover { animation-play-state: paused; }

  @keyframes float-a { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-14px) rotate(1.5deg)} }
  @keyframes float-b { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-8px) rotate(-2deg)} }
  .float-a { animation: float-a 7s ease-in-out infinite; }
  .float-b { animation: float-b 5s ease-in-out infinite; }

  @keyframes btn-glow {
    0%,100% { box-shadow: 0 4px 24px rgba(255,107,44,0.32); }
    50%      { box-shadow: 0 4px 40px rgba(255,107,44,0.56); }
  }
  .btn-primary { animation: btn-glow 2.8s ease-in-out infinite; }

  @keyframes orb {
    0%,100% { transform: translate(0,0) scale(1); }
    40%      { transform: translate(30px,-20px) scale(1.06); }
    70%      { transform: translate(-15px,15px) scale(0.96); }
  }
  .orb { animation: orb 12s ease-in-out infinite; }

  .tilt { transition: box-shadow 0.35s ease, transform 0.1s ease; transform-style: preserve-3d; }
  .tilt:hover { box-shadow: 0 28px 56px -8px rgba(0,0,0,0.13), 0 8px 20px -4px rgba(255,107,44,0.1) !important; }

  .nav-glass {
    background: rgba(255,255,255,0.94) !important;
    backdrop-filter: blur(16px) !important;
    -webkit-backdrop-filter: blur(16px) !important;
    box-shadow: 0 1px 0 rgba(0,0,0,0.07) !important;
  }

  .dot-grid {
    background-image: radial-gradient(circle, #FF6B2C1A 1.2px, transparent 1.2px);
    background-size: 26px 26px;
  }

  @media (max-width: 900px) {
    .hero-row { flex-direction: column !important; text-align: center; align-items: center !important; }
    .phone-wrap { display: none !important; }
    .hero-h1 { font-size: 38px !important; }
    .feat-grid { grid-template-columns: 1fr 1fr !important; }
    .hide-mob { display: none !important; }
    .step-row { flex-direction: column !important; gap: 20px !important; }
    .step-conn { display: none !important; }
    .team-grid { grid-template-columns: 1fr 1fr !important; }
    .hero-pills { justify-content: center !important; }
  }
  @media (max-width: 600px) {
    .feat-grid { grid-template-columns: 1fr !important; }
    .team-grid { grid-template-columns: 1fr !important; }
    .stats-grid { grid-template-columns: 1fr 1fr !important; }
    .hero-h1 { font-size: 30px !important; }
    .cta-h2 { font-size: 28px !important; }
  }
`

function WaIcon({ color = 'currentColor' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

// ─── HOOKS ────────────────────────────────────────────────────────────────────

function useScrollEffects() {
  useEffect(() => {
    // Reveal observer
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        const el = e.target
        if (el.hasAttribute('data-reveal') || el.hasAttribute('data-stagger')) {
          el.setAttribute('data-vis', '')
          io.unobserve(el)
        }
        if (el.hasAttribute('data-counter')) {
          runCounter(el)
          io.unobserve(el)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

    // Tilt
    const tilt3d = (e) => {
      const card = e.currentTarget
      const r = card.getBoundingClientRect()
      const x = (e.clientX - r.left) / r.width - 0.5
      const y = (e.clientY - r.top) / r.height - 0.5
      card.style.transform = `perspective(900px) rotateY(${x * 13}deg) rotateX(${-y * 13}deg) translateZ(6px)`
    }
    const tiltOff = (e) => {
      e.currentTarget.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateZ(0)'
    }

    // Sticky nav
    const nav = document.getElementById('land-nav')
    const onScroll = () => nav && (window.scrollY > 50 ? nav.classList.add('nav-glass') : nav.classList.remove('nav-glass'))
    window.addEventListener('scroll', onScroll, { passive: true })

    // Observe after a tick so DOM is settled
    const tid = setTimeout(() => {
      document.querySelectorAll('[data-reveal],[data-stagger],[data-counter]').forEach(el => io.observe(el))
      document.querySelectorAll('.tilt').forEach(card => {
        card.addEventListener('mousemove', tilt3d)
        card.addEventListener('mouseleave', tiltOff)
      })
    }, 80)

    return () => {
      clearTimeout(tid)
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
      document.querySelectorAll('.tilt').forEach(card => {
        card.removeEventListener('mousemove', tilt3d)
        card.removeEventListener('mouseleave', tiltOff)
      })
    }
  }, [])
}

function runCounter(el) {
  const target = parseInt(el.getAttribute('data-counter'), 10)
  const suffix = el.getAttribute('data-suffix') || ''
  const dur = 1800
  const t0 = performance.now()
  const tick = (now) => {
    const p = Math.min((now - t0) / dur, 1)
    const eased = 1 - Math.pow(1 - p, 4)
    el.textContent = Math.floor(eased * target) + suffix
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// ─── SECTION LABEL ────────────────────────────────────────────────────────────
function SectionLabel({ children }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: '#FFF0E6', color: C.orange, borderRadius: 100,
      padding: '5px 14px', fontSize: 12, fontWeight: 700, letterSpacing: 0.6,
      textTransform: 'uppercase', marginBottom: 16,
      border: '1px solid #FFD4B8',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.orange, display: 'inline-block' }} />
      {children}
    </div>
  )
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ onCTA }) {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <nav id="land-nav" style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 300,
      background: 'rgba(255,255,255,0.8)', transition: 'all 0.3s ease',
    }}>
      <div style={{ height: 3, background: `linear-gradient(90deg, ${C.saffron} 33.3%, #fff 33.3% 66.6%, ${C.green} 66.6%)` }} />
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 28px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <img src="/logo.png" alt="JanSahayak AI" style={{ height: 36, width: 'auto', maxWidth: 160, objectFit: 'contain' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hide-mob">
          {['#video', '#features', '#schemes', '#team'].map((href, i) => (
            <a key={i} href={href} style={{ color: C.gray600, textDecoration: 'none', fontSize: 14, fontWeight: 500, padding: '6px 14px', borderRadius: 8, transition: 'color 0.2s, background 0.2s' }}
              onMouseEnter={e => { e.target.style.color = C.orange; e.target.style.background = '#FFF0E6' }}
              onMouseLeave={e => { e.target.style.color = C.gray600; e.target.style.background = 'transparent' }}>
              {['Demo', 'Features', 'Schemes', 'Team'][i]}
            </a>
          ))}
          <button onClick={onCTA} className="btn-primary" style={{
            background: C.orange, color: '#fff', border: 'none', borderRadius: 10,
            padding: '10px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            fontFamily: 'Inter, sans-serif', marginLeft: 10,
            transition: 'background 0.2s, transform 0.1s',
          }}
            onMouseEnter={e => { e.target.style.background = '#e85a20'; e.target.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { e.target.style.background = C.orange; e.target.style.transform = 'scale(1)' }}>
            Try Now →
          </button>
        </div>
        {/* Mobile CTA */}
        <button onClick={onCTA} style={{ display: 'none' }} className="show-mob"
          onMouseEnter={e => e} onMouseLeave={e => e}>Try Now →</button>
      </div>
    </nav>
  )
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero({ onCTA }) {
  return (
    <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: C.white, position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
      {/* Dot grid bg */}
      <div className="dot-grid" style={{ position: 'absolute', inset: 0, opacity: 0.7 }} />
      {/* Orbs */}
      <div className="orb" style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,153,51,0.12) 0%, transparent 70%)', top: -100, right: -120, pointerEvents: 'none' }} />
      <div className="orb" style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,44,0.08) 0%, transparent 70%)', bottom: 0, left: -80, animationDelay: '-5s', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '60px 28px', width: '100%', position: 'relative', zIndex: 1 }}>
        <div className="hero-row" style={{ display: 'flex', alignItems: 'center', gap: 64, justifyContent: 'space-between' }}>
          {/* Left */}
          <div style={{ flex: 1, maxWidth: 600 }}>
            <div data-reveal="up" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#FFF0E6', color: C.orange, borderRadius: 100, padding: '6px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', border: '1px solid #FFD4B8', marginBottom: 24 }}>
              🇮🇳 &nbsp;Agentic AI for Bharat
            </div>
            <h1 className="hero-h1" data-reveal="up" style={{ fontSize: 58, fontWeight: 900, lineHeight: 1.1, letterSpacing: -1.5, color: C.navy, marginBottom: 24, fontFamily: "'Baloo 2', sans-serif" }}>
              Every Indian Deserves to Know Their{' '}
              <span style={{ background: `linear-gradient(135deg, ${C.orange}, ${C.saffron})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Rights
              </span>
            </h1>
            <p data-reveal="up" style={{ fontSize: 18, color: C.gray600, lineHeight: 1.7, marginBottom: 36, maxWidth: 500 }}>
              JanSahayak AI finds every government scheme you qualify for — in Hindi or English — and tells you exactly how to apply. Free. No app needed.
            </p>
            <div data-reveal="up" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
              <button onClick={onCTA} className="btn-primary" style={{
                background: C.orange, color: '#fff', border: 'none', borderRadius: 12,
                padding: '14px 32px', fontSize: 16, fontWeight: 700, cursor: 'pointer',
                fontFamily: 'Inter, sans-serif',
              }}>
                Try Web App →
              </button>
              {WA_HREF ? (
                <a href={WA_HREF} target="_blank" rel="noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#25D366', color: '#fff', borderRadius: 12,
                  padding: '14px 28px', fontSize: 16, fontWeight: 700,
                  textDecoration: 'none', border: 'none',
                }}>
                  <WaIcon /> WhatsApp
                </a>
              ) : (
                <a href="https://wa.me" target="_blank" rel="noreferrer" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: '#E8F5E9', color: '#388E3C', borderRadius: 12,
                  padding: '14px 28px', fontSize: 16, fontWeight: 700,
                  textDecoration: 'none', border: '1.5px solid #A5D6A7',
                }}>
                  <WaIcon color="#388E3C" /> WhatsApp — Beta
                </a>
              )}
            </div>
            {/* Trust pills */}
            <div data-reveal="up" className="hero-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {['✓ Free to use', '✓ Hindi + English', '✓ 10+ Schemes', '✓ No app needed'].map((p, i) => (
                <span key={i} style={{ background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0', borderRadius: 100, padding: '5px 14px', fontSize: 12, fontWeight: 600 }}>{p}</span>
              ))}
            </div>
          </div>

          {/* Right: Phone Mockup */}
          <div className="phone-wrap float-a" style={{ position: 'relative', flexShrink: 0 }}>
            {/* Floating match card */}
            <div className="float-b" style={{
              position: 'absolute', top: -18, right: -40, zIndex: 10,
              background: '#fff', borderRadius: 16, padding: '12px 18px',
              boxShadow: '0 12px 40px rgba(0,0,0,0.12)', border: `1px solid ${C.gray100}`,
              minWidth: 150,
            }}>
              <div style={{ fontSize: 10, color: C.gray400, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Match found</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>PM-KISAN</div>
              <div style={{ fontSize: 12, color: C.green, fontWeight: 700, marginTop: 2 }}>₹6,000 / year ✓</div>
              <div style={{ marginTop: 8, background: '#DCFCE7', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 700, color: '#166534', display: 'inline-block' }}>96% match</div>
            </div>
            {/* Floating schemes count */}
            <div style={{
              position: 'absolute', bottom: 60, left: -44, zIndex: 10,
              background: C.orange, borderRadius: 16, padding: '12px 18px',
              boxShadow: '0 8px 32px rgba(255,107,44,0.3)',
              minWidth: 130,
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1 }}>4</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginTop: 2 }}>schemes found</div>
            </div>
            {/* Phone */}
            <div style={{
              width: 268, height: 540, borderRadius: 46,
              background: 'linear-gradient(145deg, #2a2a2a, #111)',
              padding: 10,
              boxShadow: '0 48px 96px rgba(0,0,0,0.24), inset 0 0 0 1px rgba(255,255,255,0.08)',
            }}>
              <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', width: 90, height: 24, background: '#111', borderRadius: 20, zIndex: 5 }} />
              <div style={{ width: '100%', height: '100%', borderRadius: 38, overflow: 'hidden', background: '#E8DDD3', display: 'flex', flexDirection: 'column' }}>
                {/* WA Header */}
                <div style={{ background: '#1FAD60', padding: '32px 14px 10px', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: '50%', background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 800, color: '#fff', fontFamily: 'Baloo 2, sans-serif' }}>J</div>
                  <div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>JanSahayak AI</div>
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 10 }}>online</div>
                  </div>
                </div>
                {/* Chat */}
                <div style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <Bubble sent="I'm 35, farmer in Bihar with 2 acres land, income ₹80k" fromUser />
                  <Bubble sent="Found 4 schemes for you! 🎉 PM-KISAN: ₹6,000/yr, Fasal Bima, Kisan Credit Card…" />
                  <Bubble sent="Documents needed?" fromUser />
                  <Bubble sent="Aadhaar + bank passbook for PM-KISAN. Visit pmkisan.gov.in or nearest CSC." />
                </div>
                {/* Input */}
                <div style={{ background: '#F0ECE8', padding: 8, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <div style={{ flex: 1, background: '#fff', borderRadius: 22, padding: '5px 12px', fontSize: 9, color: '#aaa' }}>Type a message…</div>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1FAD60', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>🎤</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{ position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, opacity: 0.5 }}>
        <span style={{ fontSize: 11, color: C.gray500, fontWeight: 500, letterSpacing: 1 }}>SCROLL</span>
        <div style={{ width: 1, height: 40, background: `linear-gradient(${C.orange}, transparent)` }} />
      </div>
    </section>
  )
}

function Bubble({ sent, fromUser }) {
  return (
    <div style={{ alignSelf: fromUser ? 'flex-end' : 'flex-start', maxWidth: '82%', background: fromUser ? '#DCF8C6' : '#fff', borderRadius: fromUser ? '12px 12px 3px 12px' : '12px 12px 12px 3px', padding: '6px 10px', fontSize: 10, lineHeight: 1.5, boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
      {sent}
    </div>
  )
}

// ─── STATS ────────────────────────────────────────────────────────────────────
function Stats() {
  return (
    <section style={{ background: C.navy, padding: '64px 28px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div className="stats-grid" data-stagger style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2 }}>
          {[
            { value: 10, suffix: '+', label: 'Govt Schemes', sub: 'central + state' },
            { value: 2, suffix: '', label: 'Languages', sub: 'Hindi & English' },
            { value: 1000, suffix: '+', label: 'Free Chats/Month', sub: 'via WhatsApp' },
            { value: 500, suffix: 'M+', label: 'Indians Eligible', sub: 'welfare schemes' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '32px 28px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.08)' : 'none', textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', fontFamily: "'Baloo 2', sans-serif", lineHeight: 1 }}
                data-counter={s.value} data-suffix={s.suffix}>
                {s.value + s.suffix}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginTop: 8 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── DEMO VIDEO ───────────────────────────────────────────────────────────────
function DemoVideo() {
  const [playing, setPlaying] = useState(false)
  return (
    <section id="video" style={{ padding: '112px 28px', background: C.cream }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <SectionLabel>See It In Action</SectionLabel>
          <h2 data-reveal="up" style={{ fontSize: 42, fontWeight: 900, color: C.navy, fontFamily: "'Baloo 2', sans-serif", letterSpacing: -1, lineHeight: 1.15 }}>
            Watch JanSahayak AI Find<br />Your Schemes in 3 Minutes
          </h2>
          <p data-reveal="up" style={{ fontSize: 17, color: C.gray500, marginTop: 16, lineHeight: 1.6 }}>
            From entering your profile to receiving a personalised scheme list with application steps.
          </p>
        </div>
        {/* Video placeholder */}
        <div data-reveal="scale" style={{
          position: 'relative', borderRadius: 24, overflow: 'hidden',
          aspectRatio: '16/9', background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 100%)`,
          boxShadow: '0 32px 80px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.06)',
          cursor: 'pointer',
        }} onClick={() => setPlaying(true)}>
          {/* Decorative grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
          {/* Center content */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            {/* Logo watermark */}
            <img src="/logo.png" alt="" style={{ height: 52, width: 'auto', objectFit: 'contain', opacity: 0.5, marginBottom: 8 }} />
            {/* Play button */}
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 16px rgba(255,107,44,0.15)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 0 0 20px rgba(255,107,44,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 0 16px rgba(255,107,44,0.15)' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 4 }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: 700 }}>Demo Video — Coming Soon</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, marginTop: 4 }}>3-minute walkthrough · Hindi + English</div>
            </div>
          </div>
          {/* Duration badge */}
          <div style={{ position: 'absolute', bottom: 20, right: 20, background: 'rgba(0,0,0,0.6)', color: '#fff', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 600 }}>
            3:00
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { num: '01', title: 'Tell us about yourself', desc: 'Share your age, occupation, income, category, and state — in Hindi or English, on WhatsApp or web.', icon: '👤', color: '#FFF0E6', border: '#FFD4B8' },
    { num: '02', title: 'AI reasons over 10+ schemes', desc: 'Our agentic AI cross-checks your profile against eligibility criteria for central and state schemes.', icon: '🧠', color: '#EEF2FF', border: '#C7D2FE' },
    { num: '03', title: 'Get your personalised list', desc: 'Receive matched schemes with benefits, document checklists, and direct application links.', icon: '📋', color: '#F0FDF4', border: '#BBF7D0' },
  ]
  return (
    <section style={{ padding: '112px 28px', background: C.white }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <SectionLabel>How It Works</SectionLabel>
          <h2 data-reveal="up" style={{ fontSize: 42, fontWeight: 900, color: C.navy, fontFamily: "'Baloo 2', sans-serif", letterSpacing: -1 }}>
            From Profile to Schemes in 60 Seconds
          </h2>
        </div>
        <div className="step-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
          {steps.map((s, i) => (
            <React.Fragment key={i}>
              <div data-reveal="up" style={{ flex: 1, padding: '0 24px', textAlign: 'center', position: 'relative' }}>
                {/* Step number */}
                <div style={{ fontSize: 11, fontWeight: 800, color: C.orange, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>{s.num}</div>
                {/* Icon circle */}
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: s.color, border: `2px solid ${s.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>
                  {s.icon}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 800, color: C.navy, marginBottom: 12, lineHeight: 1.3 }}>{s.title}</h3>
                <p style={{ fontSize: 15, color: C.gray500, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
              {i < 2 && (
                <div className="step-conn" style={{ paddingTop: 38, width: 80, flexShrink: 0, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 4 }}>
                  {[0, 1, 2, 3, 4].map(j => (
                    <div key={j} style={{ width: 8, height: 8, borderRadius: '50%', background: j % 2 === 0 ? C.orange : C.gray200, opacity: j % 2 === 0 ? 0.6 + j * 0.1 : 1 }} />
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────
function Features() {
  const feats = [
    { icon: '🧠', title: 'Agentic Reasoning', desc: 'Multi-step AI agent: Observe → Reason → Act → Verify. Not a simple chatbot — a structured decision engine.', tag: 'Core AI', tagColor: '#EEF2FF', tagText: '#4338CA' },
    { icon: '🗣️', title: 'Hindi & Hinglish', desc: 'Understands mixed Hindi-English naturally. Switch languages mid-conversation without losing context.', tag: 'Language', tagColor: '#FFF7ED', tagText: '#C2410C' },
    { icon: '📱', title: 'WhatsApp First', desc: 'Zero app downloads. Users message on WhatsApp — 1,000 free conversations/month via Meta Cloud API.', tag: 'Access', tagColor: '#F0FDF4', tagText: '#166534' },
    { icon: '🎯', title: 'Precision Matching', desc: 'Cross-references age, income, category, state, occupation against exact scheme eligibility criteria.', tag: 'Intelligence', tagColor: '#FFF0E6', tagText: '#C2410C' },
    { icon: '📄', title: 'Document Checklist', desc: 'Every matched scheme includes a precise list — Aadhaar, ration card, caste cert — so you go prepared.', tag: 'Practical', tagColor: '#EFF6FF', tagText: '#1D4ED8' },
    { icon: '🔒', title: 'Session-only Privacy', desc: 'No profile stored, no database retention. Conversation ends, data is gone. No signup required.', tag: 'Privacy', tagColor: '#FDF4FF', tagText: '#7E22CE' },
  ]
  return (
    <section id="features" style={{ padding: '112px 28px', background: C.cream }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ marginBottom: 64 }}>
          <SectionLabel>What It Does</SectionLabel>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 24 }}>
            <h2 data-reveal="left" style={{ fontSize: 42, fontWeight: 900, color: C.navy, fontFamily: "'Baloo 2', sans-serif", letterSpacing: -1, maxWidth: 500 }}>
              Built for Real India,<br />Not a Demo
            </h2>
            <p data-reveal="right" style={{ fontSize: 16, color: C.gray500, maxWidth: 320, lineHeight: 1.6 }}>
              Every feature designed for first-generation internet users in rural and semi-urban India.
            </p>
          </div>
        </div>
        <div data-stagger className="feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
          {feats.map((f, i) => (
            <div key={i} className="tilt" style={{
              background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 20,
              padding: '32px 28px', position: 'relative', overflow: 'hidden',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
            }}>
              {/* Top accent line */}
              <div style={{ position: 'absolute', top: 0, left: 28, right: 28, height: 2, background: `linear-gradient(90deg, ${C.orange}, transparent)`, borderRadius: 1 }} />
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ background: f.tagColor, color: f.tagText, borderRadius: 6, padding: '3px 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{f.tag}</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: C.navy, marginBottom: 10, lineHeight: 1.3 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: C.gray500, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── SCHEMES MARQUEE ──────────────────────────────────────────────────────────
const SCHEMES = [
  'PM-KISAN', 'Ayushman Bharat', 'PM Awas Yojana', 'MGNREGA',
  'Beti Bachao Beti Padhao', 'Jan Dhan Yojana', 'Ujjwala Yojana',
  'Kisan Credit Card', 'SC/ST Scholarship', 'Sukanya Samriddhi',
  'PM Mudra Yojana', 'Maternity Benefit', 'Kaushal Vikas', 'PM Kaushal',
]

function SchemesMarquee() {
  const doubled = [...SCHEMES, ...SCHEMES]
  return (
    <section id="schemes" style={{ padding: '100px 0', background: C.white, overflow: 'hidden' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 28px', textAlign: 'center', marginBottom: 52 }}>
        <SectionLabel>Schemes Covered</SectionLabel>
        <h2 data-reveal="up" style={{ fontSize: 38, fontWeight: 900, color: C.navy, fontFamily: "'Baloo 2', sans-serif", letterSpacing: -0.8 }}>
          Welfare Schemes We Find For You
        </h2>
        <p data-reveal="up" style={{ fontSize: 16, color: C.gray500, marginTop: 12 }}>
          Central government schemes across agriculture, health, housing, education, and women empowerment.
        </p>
      </div>
      {/* Row 1 */}
      <div style={{ display: 'flex', overflow: 'hidden', marginBottom: 14 }}>
        <div className="marquee-track" style={{ whiteSpace: 'nowrap', gap: 12, display: 'flex' }}>
          {doubled.map((s, i) => (
            <div key={i} style={{
              background: C.cream, border: `1px solid #FFD4B8`, borderRadius: 100,
              padding: '10px 22px', fontSize: 14, fontWeight: 600, color: C.navy,
              flexShrink: 0, marginRight: 12,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}>
              <span style={{ marginRight: 8 }}>🏛️</span>{s}
            </div>
          ))}
        </div>
      </div>
      {/* Row 2 — reversed */}
      <div style={{ display: 'flex', overflow: 'hidden' }}>
        <div className="marquee-track" style={{ whiteSpace: 'nowrap', gap: 12, display: 'flex', animationDirection: 'reverse', animationDuration: '38s' }}>
          {[...doubled].reverse().map((s, i) => (
            <div key={i} style={{
              background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 100,
              padding: '10px 22px', fontSize: 14, fontWeight: 600, color: '#166534',
              flexShrink: 0, marginRight: 12,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            }}>
              <span style={{ marginRight: 8 }}>✅</span>{s}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── AGENTIC LOOP EXPLAINER ───────────────────────────────────────────────────
function AgenticLoop() {
  const steps = [
    { label: 'OBSERVE', desc: 'Reads your profile: age, income, category, state', color: '#EEF2FF', text: '#4338CA', icon: '👁️' },
    { label: 'REASON', desc: 'Maps criteria against each scheme in knowledge base', color: '#FFF7ED', text: '#C2410C', icon: '🧠' },
    { label: 'ACT', desc: 'Selects top matching schemes and ranks them', color: '#FFF0E6', text: '#9A3412', icon: '⚡' },
    { label: 'VERIFY', desc: 'Cross-checks eligibility, returns confidence score', color: '#F0FDF4', text: '#166534', icon: '✅' },
  ]
  return (
    <section style={{ padding: '112px 28px', background: C.navy, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,153,51,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,107,44,0.05) 0%, transparent 50%)' }} />
      <div style={{ maxWidth: 1160, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', gap: 80, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 340px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,107,44,0.15)', color: C.saffron, borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', border: '1px solid rgba(255,153,51,0.2)', marginBottom: 24 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.saffron, display: 'inline-block' }} />
              The Technology
            </div>
            <h2 data-reveal="left" style={{ fontSize: 40, fontWeight: 900, color: '#fff', fontFamily: "'Baloo 2', sans-serif", letterSpacing: -1, lineHeight: 1.15, marginBottom: 20 }}>
              An Agentic Loop,<br />Not Just a Chatbot
            </h2>
            <p data-reveal="left" style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: 380 }}>
              JanSahayak AI uses a four-stage reasoning loop to find every scheme you qualify for — with confidence scores, not guesses.
            </p>
          </div>
          <div data-stagger style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '18px 22px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: s.color === C.cream ? C.saffron : s.color, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5 }}>{s.desc}</div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 20, color: 'rgba(255,255,255,0.15)', flexShrink: 0 }}>→</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── TEAM ─────────────────────────────────────────────────────────────────────
function Team() {
  const members = [
    { name: 'Ritesh Bonthalakoti', role: 'Lead Developer & AI Architect', avatar: 'R', img: '/ritesh.png', color: C.orange, badge: '🚀', desc: 'Backend, agentic loop, multi-LLM orchestration, WhatsApp integration, and cloud deployment.' },
    { name: 'Shreya Goyal', role: 'UX Researcher & Domain Expert', avatar: 'S', img: '/shreya.jpg', color: C.green, badge: '🎨', desc: 'Human-centred design for rural citizens, welfare scheme research, and accessibility.' },
  ]
  return (
    <section id="team" style={{ padding: '112px 28px', background: C.cream }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <SectionLabel>The Team</SectionLabel>
          <h2 data-reveal="up" style={{ fontSize: 40, fontWeight: 900, color: C.navy, fontFamily: "'Baloo 2', sans-serif", letterSpacing: -1 }}>
            Built with Purpose
          </h2>
          <p data-reveal="up" style={{ fontSize: 16, color: C.gray500, marginTop: 12, maxWidth: 440, margin: '12px auto 0' }}>
            A small team building technology that gives 500 million Indians access to welfare they already deserve.
          </p>
        </div>
        <div data-stagger className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 32, maxWidth: 760, margin: '0 auto' }}>
          {members.map((m, i) => (
            <div key={i} className="tilt" style={{ background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 22, padding: '40px 32px', textAlign: 'center', boxShadow: '0 2px 16px rgba(0,0,0,0.04)' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', overflow: 'hidden', boxShadow: `0 8px 28px ${m.color}55`, border: `3px solid ${m.color}33` }}>
                  <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }} />
                </div>
                <div style={{ position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%', background: C.white, border: `2px solid ${C.gray100}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
                  {m.badge}
                </div>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: C.navy, marginBottom: 6 }}>{m.name}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: m.color, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 16 }}>{m.role}</div>
              <p style={{ fontSize: 13, color: C.gray500, lineHeight: 1.7 }}>{m.desc}</p>
            </div>
          ))}
        </div>
        <div data-reveal="up" style={{ marginTop: 52, background: C.white, border: `1px solid ${C.gray100}`, borderRadius: 16, padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', maxWidth: 760, margin: '52px auto 0' }}>
          <div style={{ fontSize: 36 }}>🏆</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.navy }}>Hackarena 2.0 — Built for Bharat</div>
            <div style={{ fontSize: 13, color: C.gray500, marginTop: 4 }}>JanSahayak AI is a mission-driven project bridging the gap between Indian citizens and welfare schemes they already qualify for.</div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────
function CTA({ onCTA }) {
  return (
    <section style={{ padding: '112px 28px', background: `linear-gradient(135deg, ${C.orange} 0%, #ff9033 100%)`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0,0,0,0.1) 0%, transparent 40%)' }} />
      {/* Ashoka wheel watermark */}
      <div style={{ position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)', width: 400, height: 400, opacity: 0.05, fontSize: 400, lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>☸</div>
      <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff', borderRadius: 100, padding: '5px 16px', fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', border: '1px solid rgba(255,255,255,0.25)', marginBottom: 24 }}>
          🇮🇳 &nbsp;Free for All Indians
        </div>
        <h2 className="cta-h2" data-reveal="up" style={{ fontSize: 44, fontWeight: 900, color: '#fff', fontFamily: "'Baloo 2', sans-serif", letterSpacing: -1, lineHeight: 1.15, marginBottom: 20 }}>
          Find Your Government<br />Schemes Right Now
        </h2>
        <p data-reveal="up" style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6, marginBottom: 40 }}>
          Millions of Indians miss welfare they're entitled to — not because they don't qualify, but because they don't know. JanSahayak AI fixes that.
        </p>
        <div data-reveal="up" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={onCTA} style={{ background: '#fff', color: C.orange, border: 'none', borderRadius: 12, padding: '16px 36px', fontSize: 16, fontWeight: 800, cursor: 'pointer', fontFamily: 'Inter, sans-serif', boxShadow: '0 8px 32px rgba(0,0,0,0.15)', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            Start Web Chat →
          </button>
          {WA_HREF && (
            <a href={WA_HREF} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: '#25D366', color: '#fff', borderRadius: 12, padding: '16px 32px', fontSize: 16, fontWeight: 700, textDecoration: 'none', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              <WaIcon /> Open in WhatsApp
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ background: C.gray900, padding: '52px 28px 32px' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 40, marginBottom: 48 }}>
          <div style={{ maxWidth: 320 }}>
            <img src="/logo.png" alt="JanSahayak AI" style={{ height: 36, width: 'auto', objectFit: 'contain', marginBottom: 16, filter: 'brightness(0) invert(1)' }} />
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              AI-powered government scheme finder for every Indian citizen. Free, instant, in your language.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
              {['🇮🇳 Made in India', '🤝 Open Mission'].map((b, i) => (
                <span key={i} style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600 }}>{b}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 60, flexWrap: 'wrap' }}>
            {[
              { heading: 'Product', links: ['Web Chat', 'WhatsApp Bot', 'Features', 'How It Works'] },
              { heading: 'Schemes', links: ['PM-KISAN', 'Ayushman Bharat', 'PM Awas', 'View All →'] },
              { heading: 'Project', links: ['GitHub', 'Team', 'Contact'] },
            ].map((col, i) => (
              <div key={i}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 }}>{col.heading}</div>
                {col.links.map((l, j) => (
                  <div key={j} style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 10, cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.9)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}>
                    {l}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>© 2025 JanSahayak AI · Gratian Technologies · ritesh@gratiantechnologies.com</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>Information purposes only — verify on official portals</div>
        </div>
      </div>
    </footer>
  )
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function Landing() {
  const navigate = useNavigate()
  useScrollEffects()

  const goToChat = () => navigate('/app')

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }} />
      <Navbar onCTA={goToChat} />
      <Hero onCTA={goToChat} />
      <Stats />
      <DemoVideo />
      <HowItWorks />
      <Features />
      <SchemesMarquee />
      <AgenticLoop />
      <Team />
      <CTA onCTA={goToChat} />
      <Footer />
    </>
  )
}
