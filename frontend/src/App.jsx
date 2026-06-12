import React from 'react'
import IndexPage from './pages/index.jsx'

export default function App() {
  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; }
        body {
          font-family: 'Hind', sans-serif;
          background: linear-gradient(135deg, #fff8f0 0%, #fef9f4 100%);
          color: #1a1a1a;
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #FF993360; border-radius: 4px; }
        textarea:focus { border-color: #FF9933 !important; box-shadow: 0 0 0 3px rgba(255,153,51,0.12); }
      `}</style>
      <IndexPage />
    </>
  )
}
