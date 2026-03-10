# 🚀 GrowEasy AI: Lead Qualification Dashboard

**Intelligent. Decoupled. Production-Ready.**

GrowEasy AI is a high-performance, full-stack simulation environment designed to test and qualify leads using Gemini-powered conversational agents. It transitions from a simple "Test Environment" to a powerful "Workspace" for real-time lead telemetry.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | `Next.js 15+` (App Router) | Core Application Framework |
| **Styling** | `Tailwind CSS v3` | Modern, Utility-First UI |
| **Icons** | `Lucide React` | Clean, Minimalist Symbolism |
| **Backend** | `Node.js / Express` | Scalable Logic & API Layer |
| **AI Engine** | `Google Gemini 3.1 Flash` | Advanced NLP & Reasoning |
| **Dev Tools** | `Turbopack` | Instant HMR & Build Performance |

---

## 📂 Project Architecture

A clean, decoupled directory structure ensuring separation of concerns:

```text
testai/
├── backend/                # Express.js Server
│   ├── routes/             # API Endpoints (Chat, Classification)
│   ├── services/           # AI Logic (Gemini & Classifier)
│   ├── utils/              # Helper Scripts (Gibberish Detection)
│   ├── constants.js        # Centralized AI Rules & Industry Templates
│   └── server.js           # Entry Point & Middlewares
├── frontend/frontend/      # Next.js Application
│   ├── app/                # Pages & Layouts (Admin, Dashboard)
│   ├── components/         # Reusable UI Blocks (Chat, Config, Results)
│   ├── lib/                # API Clients & Centralized Constants
│   ├── types/              # Unified TypeScript Interfaces
│   └── public/             # Static Assets (Logos, Icons)
├── DEPLOYMENT.md           # Production Deployment Guide
└── README.md               # 👈 Your current location
```

---

## ⚡ Key Workflows

### 1. The Conversation Loop
- **Initialize:** User enters Lead Info & Business Config (Industry, Rules, Location).
- **Engage:** Gemini AI assumes a specific Persona and starts the qualification flow.
- **Auto-Suggest:** AI predicts 3 likely user responses to speed up the UX.
- **Safety:** Gibberish detection prevents waste; Inactivity Timeout (15s) auto-closes idle chats.

### 2. Lead Classification (The Judge)
Once a conversation ends (Naturally or via Timeout):
- **Telemetry:** The full transcript is sent to a specialized **Classifier AI**.
- **Extraction:** AI extracts Budget, Timeline, Intent, and Location.
- **Decision:** Lead is categorized as **Hot**, **Cold**, or **Invalid** based on industry-specific criteria.

---

## 🛰️ Major API Routes

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat/start` | Spins up a new session with custom persona overrides. |
| `POST` | `/api/chat/send` | Handles bidirectional messaging & AI response generation. |
| `POST` | `/api/chat/classify` | Forced ending of sessions for telemetry analysis. |
| `GET` | `/api/chat/:id` | Debug route to fetch raw session JSON. |

---

## 🚀 Getting Started

### 1. Configuration
Create a `.env` in the `backend/` folder:
```env
PORT=3001
GEMINI_API_KEY=your_key_here
FRONTEND_ORIGIN=http://localhost:3000
```

Create a `.env` in the `frontend/frontend/` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_INACTIVITY_TIMEOUT_MS=15000
```

### 2. Launch
```bash
# Terminal 1: Backend
cd backend && npm install && npm start

# Terminal 2: Frontend
cd frontend/frontend && npm install && npm run dev
```

> Built with ❤️ for **GrowEasy** by the Priyobrata Mondal.