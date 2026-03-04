# Aria AI - Week 3: Bring Her Alive

## Objective
Week 3 focuses on giving Aria AI a "brain" to not just converse, but think, verify, decide, and act.  
The goal is to improve reliability, emotional intelligence, and human-like interaction.

---

## Features Implemented
- React + Tailwind Frontend for UI  
- Login system (email + password + name)  
- Chat interface connected to FastAPI backend  
- Voice input/output using `speechSynthesis` API (female voice)  
- Premium dark navy glassmorphism UI  
- Basic interview stages: HR Round → Technical Round → Feedback  
- Encouragement and motivational responses based on user's mood

---

## Planned Improvements
- Multi-Model API Orchestration (accuracy + comparison logic)  
- Feedback loop system with ratings and logging  
- Agent task abilities (step-by-step reasoning, tool use)  
- Trust & reliability layer (fact-checking, confidence scoring)

---

## Tech Stack
- Frontend: React.js, TailwindCSS  
- Backend: FastAPI (Python)  
- API: Multi-modal AI model (Gemini 2.5 Flash, or any configured LLM)  
- Voice: Browser `speechSynthesis`  

---

## How to Run
### Backend

-cd backend
-python -m venv venv
-source venv/Scripts/activate   # Windows PowerShell
-python -m uvicorn main:app --reload
### Frontend

-cd frontend
-npm install
-npm run dev

Open in your browser (Chrome)

### Week 3 Learning

-Built a secure login system with username and email

-Connected frontend to backend with API fetch calls

-Implemented voice input/output for real-time interaction

-Learned about multi-model orchestration, feedback systems, and reliability layers conceptually

-Focused on modern UI/UX and human-like AI behavior
