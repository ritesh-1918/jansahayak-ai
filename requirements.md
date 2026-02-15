# JanSahayak AI

## Goal
An AI assistant that helps Indian citizens discover and understand government schemes using voice and chat in local languages.

## 1. Problem Statement
Despite the existence of numerous government welfare schemes, a significant portion of the intended beneficiaries fails to access them. The primary barriers include:
*   **Language & Literacy Barriers:** Most official information is in English or formal Hindi, which is difficult for rural citizens to understand.
*   **Complex Portals:** Navigation through multiple government websites is confusing and requires technical literacy.
*   **Eligibility Confusion:** Citizens are often unaware of which schemes apply to them due to complex eligibility criteria.
*   **Lack of Guidance:** There is no immediate support to guide users through the application process step-by-step.

## 2. Target Users
*   **Rural Citizens:** Individuals in villages with limited access to information centers.
*   **Farmers:** Seeking agricultural subsidies, loans, and insurance schemes.
*   **Students:** Looking for scholarships and educational grants.
*   **Elderly People:** Needing assistance with pension and healthcare schemes.
*   **First-time Smartphone Users:** People who are comfortable with voice and chat (like WhatsApp) but struggle with traditional app interfaces.

## 3. Core Features
*   **Voice Interaction in Regional Languages:** Users can speak to the assistant in their native language (Hindi, Tamil, Telugu, Bengali, etc.) and receive voice responses.
*   **Personalized Eligibility Detection:** The system analyzes user profiles (age, income, location, occupation) to recommend relevant schemes.
*   **Step-by-Step Application Guidance:** Interactive walkthroughs that explain required documents and form-filling procedures in simple terms.
*   **WhatsApp Integration:** A familiar chat interface for users who do not want to download a separate app.
*   **Low Bandwidth Mode:** Optimized for 2G/3G networks common in remote areas.

## 4. Functional Requirements
### User Interface
*   Simple, high-contrast UI with large buttons and voice-first navigation.
*   Support for microphone input and text-to-speech output.

### Authentication & Profiling
*   OTP-based login (via mobile number).
*   Profile creation (Age, Gender, Location, Income Group, Occupation) to filter schemes.

### Scheme Discovery & Search
*   Voice search capability ("Mujhe kisan nitish yojana ke baare mein batao").
*   Categorized browsing (Agriculture, Education, Health, Housing).

### AI Assistant (Chatbot/Voicebot)
*   Natural Language Processing (NLP) to understand intent and context in Indian languages.
*   Ability to summarize long government notifications into simple, actionable points.
*   Q&A capability for specific questions regarding documents and deadlines.

### Application Assistance
*   Checklist generation for required documents.
*   Direct links to official application portals.

## 5. Non-Functional Requirements
*   **Performance:** Voice response latency should be under 2 seconds for a seamless experience.
*   **Accessibility:** Adherence to WCAG standards for visually impaired users (screen reader compatibility).
*   **Multilingual Support:** Architecture must support easy addition of new regional languages.
*   **Scalability:** System should handle high concurrency during scheme announcements.
*   **Data Privacy:** Minimal data collection; strict adherence to Indian data protection laws.

## 6. Expected Impact
*   **Increased Awareness:** Bridging the information gap between the government and the grassroots level.
*   **Higher Utilization:** Increasing the enrollment rate in welfare schemes by simplifying the discovery process.
*   **Empowerment:** Enabling citizens to access their rights without identifying as "beneficiaries" but as informed participants.
