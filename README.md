# SupportMind — AI Customer Support Agent with Long-Term Memory

> **Hackathon:** HackWithHyderabad 3.0  
> **Tagline:** "Support that remembers."  
> **Memory Architecture:** Hindsight Cloud (`hindsight-client`)

---

## 📌 Problem

Traditional customer support systems suffer from **conversational amnesia**:
1. **Repetitive Questioning:** Every time a customer returns with a recurring hardware, network, or software bug, they are forced to repeat their device model, OS, and troubleshooting history.
2. **Context Fragmentation:** Agents and chatbots do not retain past failed troubleshooting steps (e.g., driver updates, port resets), frequently suggesting solutions that already failed.
3. **Impersonal Experience:** Customers expect modern AI systems to recognize them, their preferences, and their technical environment.

---

## 💡 Solution

**SupportMind** is an enterprise-grade AI customer support platform powered by **Hindsight** as its persistent long-term memory system.

* **Autonomous Memory Extraction:** During natural support chats, SupportMind extracts high-signal context (device specifications, recurring symptoms, successful fixes, and failed attempts) and commits them to Hindsight Cloud.
* **Semantic & Temporal Recall:** When a customer returns, SupportMind recalls their isolated memory bank to provide context-aware, personalized resolution immediately.
* **Strict Role & Privacy Separation:** The Support Agent interface and Customer Portal are completely partitioned. Customers can only access their own private memory bank.

---

## 🧠 Why Hindsight?

Unlike naive vector databases that merely perform cosine similarity over raw chat chunks, **Hindsight** provides:
1. **Multi-Strategy Retrieval:** Parallel semantic, sparse, temporal, and entity-graph search.
2. **Bank Partitioning:** Dedicated, isolated memory banks per customer (`SupportMind-{customer_id}`) ensuring zero cross-tenant leakage.
3. **Entity Extraction & World Fact Synthesis:** Distills high-level observations and facts from raw conversation streams.
4. **Token-Budget Optimization:** Supplies concise, relevant historical context to the LLM without overflowing context windows.

---

## 🔄 Hindsight Memory Workflow

```
Customer Message: "My Wi-Fi problem is back."
          ↓
[1] Identify Customer & Authenticate (JWT)
          ↓
[2] Recall Relevant Memories from Hindsight Cloud
    (Query: "What previous Wi-Fi problem did Rahul Sharma have?")
    ↳ Returns: Device: Dell XPS 15 | Pattern: Zoom calls | Fix tried: Driver update (temporary)
          ↓
[3] Synthesize Context: Current Problem + Recalled Memories + Technical Knowledge
          ↓
[4] LLM Response Generation (Groq / Context Engine)
    ↳ "I remember our previous discussion regarding your Wi-Fi disconnections on your Dell XPS 15.
       Since updating the driver wasn't a permanent fix, let's adjust PCIe Power Management..."
          ↓
[5] Post-Interaction Extraction
    ↳ Extracts new facts (e.g., symptoms, fixes confirmed)
          ↓
[6] Retain Context in Hindsight Cloud
          ↓
[7] Return Personalized Response to Customer
```

---

## 🏗️ Architecture & Tech Stack

```
SupportMind/
├── frontend/                     # React 19 + Vite 8 + Tailwind CSS v4 + Framer Motion
│   ├── src/
│   │   ├── components/           # UI components (Header, Sidebar, ChatPanel, MemoryPanel, etc.)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # Role Selection, Agent Login, Customer Login & Signup
│   │   │   ├── AdminDashboard.jsx# Support Agent internal console with Hindsight memory inspector
│   │   │   └── CustomerDashboard.jsx # Isolated personal support portal
│   │   ├── services/api.js       # Client API abstraction
│   │   └── App.jsx               # Protected role-based routing
│   └── package.json
│
├── backend/                      # Python 3.14 + FastAPI + Async Uvicorn
│   ├── main.py                   # App lifecycle & CORS middleware
│   ├── config.py                 # Pydantic Settings with .env loading & key masking
│   ├── hindsight_service.py      # Async Hindsight Cloud SDK integration (aretain, arecall, alist_memories)
│   ├── llm_service.py            # Groq / xAI / contextual synthesis engine
│   ├── agent.py                  # SupportMind Agent memory orchestrator
│   ├── customer_store.py         # Dynamic customer store & privacy guard
│   ├── auth.py                   # Role-based JWT authentication
│   ├── models.py                 # Pydantic data schemas
│   ├── routes/
│   │   ├── auth_routes.py        # /api/auth/login, /api/auth/register, /api/auth/me
│   │   ├── customer_routes.py    # /api/customers, /api/customers/{id}/memories
│   │   └── chat_routes.py        # /api/chat
│   └── tests/
│       ├── test_hindsight_integration.py # Live Hindsight retain/recall verification
│       └── test_backend_api.py   # Privacy isolation & chat workflow pytest suite
│
├── .env                          # Local environment secrets (IGNORED BY GIT)
├── .env.example                  # Secret placeholder template
├── .gitignore                    # Prevents leaking .env or build files
└── README.md
```

* **Frontend:** React 19, Vite 8, Tailwind CSS v4, Framer Motion (SmoothUI animations), Lucide React.
* **Backend:** Python 3.14, FastAPI, Uvicorn, Pydantic v2.
* **Long-Term Memory:** Hindsight Cloud (`hindsight-client` Python SDK).
* **LLM Engine:** Groq API (`llama-3.3-70b-versatile`) with contextual fallback engine.
* **Security:** JWT role-based access control, cryptographic isolation, zero hardcoded secrets.

---

## 🔒 Security & Privacy Enforcement

1. **Strict Customer Isolation:** Customers cannot query `/api/customers` or inspect another user's memories/conversations. Attempts trigger HTTP 403 Forbidden.
2. **Dedicated Memory Partitioning:** Each customer's memories are stored in an isolated Hindsight bank: `SupportMind-{customer_id}`.
3. **Zero Secrets in Code or Logs:** All API keys are loaded via environment variables and masked in diagnostics (`hsk_...2a29`). `.env` is ignored by Git.

---

## 🚀 Getting Started

### 1. Prerequisites
* Python 3.10+ (Tested on Python 3.14)
* Node.js v18+ & npm

### 2. Configuration
Copy `.env.example` to `.env` and provide your credentials:
```bash
cp .env.example .env
```

```ini
# Hindsight Cloud
HINDSIGHT_BASE_URL=https://api.hindsight.vectorize.io
HINDSIGHT_API_KEY=your_hindsight_api_key
HINDSIGHT_BANK_ID=SupportMind

# LLM Configuration
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile

# Backend
PORT=8000
HOST=0.0.0.0
JWT_SECRET=your_jwt_secret_token
```

### 3. Install Dependencies

**Backend:**
```bash
pip install -r backend/requirements.txt
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Running the Application

**Start the FastAPI Backend:**
```bash
cd backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Start the React Frontend:**
```bash
cd frontend
npm run dev
```

* **Frontend:** [http://localhost:5173](http://localhost:5173)
* **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
* **Health Check:** [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

## 🧪 Testing Hindsight Integration

To test connectivity, memory retention, and memory recall with Hindsight Cloud:
```bash
python backend/tests/test_hindsight_integration.py
```

To run the automated backend test suite (privacy isolation, dynamic registration, chat):
```bash
python -c "import sys; sys.path.insert(0, 'backend'); import pytest; sys.exit(pytest.main(['backend/tests/test_backend_api.py', '-v']))"
```

---

## 🎬 Hackathon Demo Scenario

1. **Open Landing Page:** Navigate to `http://localhost:5173`.
2. **Select Role:** Click **"Continue as Customer"** (or **"Continue as Support Agent"**).
3. **Register or Sign In:**
   * Customer: Register a new account (e.g., *Rahul Sharma*, Dell XPS 15).
   * Agent: Sign in with `admin@supportmind.ai` / `admin123`.
4. **Interaction 1:** Customer asks: *"My Wi-Fi keeps disconnecting."*
   * Agent requests device and symptom details.
5. **Interaction 2:** Customer states: *"I'm using a Dell XPS 15 and it happens mostly during Zoom."*
   * SupportMind extracts and retains these facts into Hindsight Cloud.
6. **Interaction 3 (Later Session):** Customer returns stating: *"My Wi-Fi problem is back."*
   * SupportMind recalls memories from Hindsight and immediately responds with context:
     *"I remember our previous discussion regarding your Wi-Fi disconnections on your Dell XPS 15 during Zoom calls..."*
7. **Inspect in Admin Dashboard:** Log into Support Agent console to view the customer's live Hindsight Memory Bank and raw memory units!

---

## 👥 Hackathon Team

* **Project:** SupportMind
* **Hackathon:** HackWithHyderabad 3.0
* **Category:** AI Customer Support Agent with Long-Term Memory
