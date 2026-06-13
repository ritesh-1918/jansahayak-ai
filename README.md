# JanSahayak AI 🇮🇳

> **JanSahayak AI — India's autonomous welfare navigator. Multilingual AI that helps every citizen discover, verify, and apply for government welfare schemes through voice and chat.**

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Hackathon](https://img.shields.io/badge/Hackarena-2.0-orange)
![Status](https://img.shields.io/badge/Status-Live%20Demo-brightgreen)
![AI Powered](https://img.shields.io/badge/AI-Agentic%20Loop-purple)

<!-- Topics -->
![Topic](https://img.shields.io/badge/Topic-FastAPI-teal)
![Topic](https://img.shields.io/badge/Topic-React-61dafb)
![Topic](https://img.shields.io/badge/Topic-LangGraph-yellow)
![Topic](https://img.shields.io/badge/Topic-WhatsApp-25D366)
![Topic](https://img.shields.io/badge/Topic-Bhashini-orange)
![Topic](https://img.shields.io/badge/Topic-Public_Services-purple)

---

## 🎯 Project Goal

To democratize access to government welfare schemes for the **65% of India's population** residing in rural areas. JanSahayak AI bridges the digital divide by removing **language barriers** and **complex navigation** challenges — acting as a personal welfare consultant that citizens can talk to in their native language via WhatsApp or web.

**₹73,000 Cr in government benefits go unclaimed every year. JanSahayak AI fixes that.**

---

## ✨ Features

- **🗣️ Multilingual Voice** — Hindi, Tamil, Telugu, and 9 more Indian languages via Bhashini
- **✅ Smart Eligibility Check** — Autonomous agent verifies age, income, occupation, and documents
- **💬 WhatsApp Integration** — Works on Meta WhatsApp Cloud API; no app download needed
- **📄 Document Guidance** — Simplified checklist for every scheme application
- **📜 Jargon-Free Summaries** — Complex legal text converted to plain language
- **🤖 Agentic Loop** — OBSERVE → REASON → ACT → VERIFY cycle via LangGraph orchestration
- **🔄 Multi-LLM Fallback** — Automatic failover across LLM providers for reliability

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React (Vite) PWA — deployed on Vercel |
| **Backend** | Python 3.11, FastAPI |
| **AI Orchestration** | LangGraph — autonomous agentic loop |
| **LLM** | Multi-LLM fallback chain (no single vendor lock-in) |
| **Voice (STT/TTS)** | Bhashini API — 12 Indian languages |
| **WhatsApp** | Meta WhatsApp Cloud API (free tier, 1000 conv/month) |
| **Knowledge Base** | ChromaDB (vector search) |
| **Database** | SQLite (dev) |
| **Deployment** | Vercel (frontend) · Hugging Face Spaces (backend) |

---

## 🤖 The Agentic Loop

```
User message
     │
     ▼
 OBSERVE — parse input, extract profile fields (age, income, location)
     │
     ▼
 REASON  — query knowledge base, evaluate eligibility rules
     │
     ▼
   ACT    — fetch scheme details, generate multilingual response
     │
     ▼
 VERIFY  — cross-check facts, confirm document requirements
     │
     ▼
 Reply to user (WhatsApp / Web)
```

---

## 📂 Folder Structure

```
JanSahayak-AI/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py           # Entry point + CORS
│   │   ├── config.py         # Settings (pydantic-settings)
│   │   ├── agents/           # LangGraph agentic loop
│   │   ├── routes/           # API endpoints
│   │   │   ├── chat.py
│   │   │   ├── whatsapp_meta.py  # Meta WhatsApp webhook
│   │   │   └── health.py
│   │   ├── services/         # Voice, messaging, eligibility
│   │   └── models/           # SQLAlchemy DB models
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                 # React (Vite) PWA
│   ├── src/
│   │   ├── App.jsx           # React Router — / = landing, /app = chat
│   │   ├── pages/
│   │   │   ├── Landing.jsx   # Marketing landing page
│   │   │   └── index.jsx     # Chat interface
│   │   └── components/
│   └── vercel.json
├── docs/
│   └── Presentation/         # Hackarena 2.0 pitch deck (HTML)
└── README.md
```

---

## 🚀 How to Run

### Backend

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt

# Copy and fill in env vars
cp .env.example .env

uvicorn app.main:app --reload
# API live at http://localhost:8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# App live at http://localhost:5173
# / = landing page   /app = chat interface
```

### WhatsApp Bot (local demo)

```bash
# 1. Start backend (above)
# 2. Expose with ngrok
ngrok http 8000
# 3. Set webhook in Meta Developer Console:
#    https://<your-ngrok-url>/meta/webhook
#    Verify Token: jansahayak2024
```

---

## 🌐 Live Deployments

| Service | URL |
| :--- | :--- |
| Landing page | [jansahayak.vercel.app](https://jansahayak.vercel.app) |
| Backend API | [Hugging Face Spaces](https://huggingface.co/spaces/ritesh19180/janshayak-ai-backend) |

---

## 👥 Team

| Name | Role |
| :--- | :--- |
| **Ritesh Bonthalakoti** | Lead Developer & AI Architect |
| **Shreya Goyal** | UX Researcher & Domain Expert |

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
