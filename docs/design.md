# JanSahayak AI - System Design

## 1. System Overview
**JanSahayak AI** is a conversational AI platform designed to bridge the gap between Indian citizens and government welfare schemes. It serves as an intelligent intermediary that simplifies complex bureaucratic information into easy-to-understand, vernacular conversations. The system leverages Large Language Models (LLMs) and voice technologies to guide users through scheme discovery, eligibility checks, and application processes, functioning effectively over both a dedicated mobile interface and WhatsApp.

## 2. Architecture
The system follows a modular microservices architecture to ensure scalability and maintainability.

### High-Level Pipeline
1.  **User Interface:** User interacts via Voice or Text (Mobile App / WhatsApp).
2.  **Voice Processing:** Audio is converted to text (STT) in the user's native language.
3.  **Orchestrator:** The backend API receives the query and manages the workflow.
4.  **Knowledge Retrieval:** Relevant scheme details are fetched from a Vector Database.
5.  **LLM Reasoning:** The LLM processes the query + retrieved context to generate a natural response or determine eligibility.
6.  **Response Generation:** The answer is converted back to speech (TTS) and sent to the user.

## 3. Core Components

### Frontend Interface
*   **Mobile Web/App:** A lightweight, high-contrast UI optimized for low-end devices. Focuses on voice buttons and simple navigation.
*   **WhatsApp Bot:** Integration via Twilio/WhatsApp Business API for users who prefer chat interactions.

### Backend API (FastAPI)
*   Serves as the central brain.
*   Handles routing of requests between the frontend, database, and AI models.
*   Manages user sessions (state) to support multi-turn conversations (e.g., "What is the age limit?" -> "And for SC/ST?").

### AI & Reasoning Layer
*   **LLM (Large Language Model):** Powered by GPT-4 or AWS Bedrock (Claude/Titan). Responsible for understanding intent, summarization, and generating empathetic responses.
*   **Eligibility Engine:** A logic layer that compares user profile data (age, income, location, caste) against scheme criteria to output a binary "Eligible/Not Eligible" result with reasons.

### Knowledge Base (Vector Database)
*   Stores government scheme documents embedding vectors.
*   Allows for semantic search (e.g., matching "money for school" to "Pre-Matric Scholarship").
*   uses tools like **Pinecone** or **FAISS**.

### Voice Processing Module
*   **Speech-to-Text (STT):** Transcribes regional dialects into English/Hindi text for processing (e.g., OpenAI Whisper or Bhashini).
*   **Text-to-Speech (TTS):** Converts the AI response back into natural-sounding speech in the user's language.

## 4. Tech Stack

| Component | Technology |
| :--- | :--- |
| **Backend Framework** | Python (FastAPI) |
| **LLM / AI Model** | OpenAI GPT-4o / AWS Bedrock |
| **Vector Database** | Pinecone / ChromaDB |
| **Speech Recognition** | OpenAI Whisper / Google STT |
| **Text-to-Speech** | ElevenLabs / Google TTS |
| **Database (User Data)** | PostgreSQL / MongoDB |
| **Messaging Integration** | Twilio (WhatsApp) |
| **Deployment** | AWS / Render / Vercel |

## 5. Data Flow
1.  **Input:** User speaks: *"Mere paas 2 acre zameen hai, kya mujhe loan milega?"* (I have 2 acres of land, will I get a loan?)
2.  **Transcription:** STT engine converts audio to text.
3.  **Intent Classification:** Backend identifies intent: `Scheme_Eligibility_Check`.
4.  **Context Retrieval:** Vector DB retrieves schemes related to "Farmers", "Land Loans", and "Agricultural Subsidies".
5.  **Reasoning:** LLM analyzes the user's input against the retrieved scheme rules.
    *   *Check:* Does the scheme require < 2 acres? Yes.
6.  **Response Generation:** LLM generates: "Yes, under the PM Kisan Credit Card scheme, you are eligible for a low-interest loan..."
7.  **Output:** TTS engine converts this text to Hindi audio.
8.  **Delivery:** User hears the response.

## 6. Scalability
*   **Modular Language Support:** The architecture supports adding new languages simply by plugging in updated STT/TTS models and localized prompts, without rewriting core logic.
*   **State-wise Expansion:** Scheme data is tagged by state. The system can easily onboard new states (e.g., moving from UP schemes to Tamil Nadu schemes) by ingesting new documents into the Vector DB.
*   **Cloud Native:** Deployed on scalable cloud infrastructure (serverless functions or containerized services) to handle traffic spikes during government announcements.

## 7. Security & Privacy
*   **Minimal Data Collection:** We strictly collect only what is necessary (Age, Income, generic Location) to determine eligibility. PII like Aadhaar numbers or precise addresses are **never** stored.
*   **Buttressed Encryption:** All communication between user devices and servers is encrypted via TLS 1.3.
*   **Anonymized Logs:** Query logs for training are anonymized to remove any potential personal identifiers.
