# JanSahayak AI 🇮🇳

> **JanSahayak AI – A multilingual AI assistant that helps citizens understand and access government welfare schemes through conversational voice and chat.**

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Hackathon](https://img.shields.io/badge/Status-Hackathon%20Submission-orange)
![AI Powered](https://img.shields.io/badge/AI-Powered-green)

<!-- Topics -->
![Topic](https://img.shields.io/badge/Topic-AI-blue)
![Topic](https://img.shields.io/badge/Topic-FastAPI-teal)
![Topic](https://img.shields.io/badge/Topic-React-61dafb)
![Topic](https://img.shields.io/badge/Topic-LLM-yellow)
![Topic](https://img.shields.io/badge/Topic-Public_Services-purple)
![Topic](https://img.shields.io/badge/Topic-Hackathon-orange)
![Topic](https://img.shields.io/badge/Topic-Chatbot-pink)

---

## 🎯 Project Goal

To democratize access to government welfare schemes for the **65% of India's population** residing in rural areas. JanSahayak AI bridges the digital divide by removing **language barriers** and **complex navigation** challenges, acting as a personal welfare consultant that citizens can talk to in their native language.

---

## ✨ Features

-   **🗣️ Multilingual Voice Support**: Interact naturally in Hindi, Tamil, Telugu, and other regional languages.
-   **✅ Smart Eligibility Check**: Automatically analyzes age, income, and occupation to recommend relevant schemes.
-   **💬 WhatsApp Integration**: Accessible directly through WhatsApp, eliminating the need for a separate app download.
-   **📄 Document Guidance**: Provides clear, simplified lists of required documents for every application.
-   **📜 Jargon-Free Summaries**: Converts complex legal terms into simple, easy-to-understand explanations.

---

## 🛠️ Tech Stack

| Component | Technology | Owner |
| :--- | :--- | :--- |
| **Frontend** | React Native / WhatsApp Business API | Asna |
| **Backend** | Python, FastAPI | Ritesh |
| **AI Models** | OpenAI GPT-4o / AWS Bedrock | Ritesh |
| **Speech Services** | OpenAI Whisper (STT) / ElevenLabs (TTS) | Ritesh |
| **Database** | PostgreSQL (User Data), Pinecone (Vector DB) | Ritesh |
| **Cloud** | AWS / Render | Ritesh |

---

## 📂 Folder Structure

```
JanSahayak-AI/
├── backend/          # FastAPI application (Logic & API)
│   ├── app/
│   │   ├── main.py       # Application entry point
│   │   ├── routes/       # API endpoints (health, chat)
│   │   └── config.py     # Configuration settings
│   └── requirements.txt  # Python dependencies
├── frontend/         # React Native App (User Interface)
├── docs/             # Documentation and guides
└── README.md         # Project overview
```

---

## 🚀 How to Run

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Run the server:
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be live at `http://localhost:8000`.

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the application:
    ```bash
    npm start
    ```

---

## 👥 Team Members

| Name | Role | Responsibilities |
| :--- | :--- | :--- |
| **Asna Abdul Kareem** | Frontend & UX Developer | Mobile app development, user interface design, WhatsApp integration |
| **Ritesh Bonthalakoti** | Backend & Infrastructure Developer | API development, AI integration, database management, deployment |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
