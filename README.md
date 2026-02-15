# AINI – AI Interview Intelligence System 🤖

AINI is an AI-based Interview Practice Assistant built using Python and Streamlit.  
It simulates a structured interview environment with basic emotional intelligence and performance tracking.
---
## 📌 Project Objective
The objective of this project is to build a structured AI system that:
- Detects basic user emotions
- Conducts HR and technical interviews
- Evaluates answers using keyword logic
- Stores user performance data
- Tracks improvement over time
---
## 🚀 Features
- Name + Email Login System
- Emotional Response Detection
- HR Questions First (Professional Interview Flow)
- Technical Questions (OOP, Python, Machine Learning)
- Keyword-Based Answer Evaluation
- Score Calculation System
- Dashboard with Performance Graph
- Short-Term and Long-Term Memory Storage
- State-Based Navigation (Login → Welcome → Interview → Dashboard)
---
## 🏗️ System Architecture
**Frontend:** Streamlit UI  
**Backend Logic:** Python  
**Memory Storage:** JSON-based structured file (`memory.json`)
The application uses session state for temporary data handling and JSON for persistent user-level storage.
---
## 🔄 States Implemented
The system is divided into four structured states:
1. Login  
2. Welcome  
3. Interview  
4. Dashboard  
State transitions are managed using Streamlit's `session_state`.
---
## 🧠 Core Concepts Used
- State Management
- Session Handling
- JSON Data Storage
- Keyword-Based Evaluation Logic
- Basic Emotion Detection using Conditional Logic
- Performance Tracking with Graph Visualization
---
## 🛠️ Technologies Used
- Python  
- Streamlit  
- JSON  
---
