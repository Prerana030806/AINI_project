Aria – AI Interview Intelligence System 🤖

Aria is an AI-powered Interview Practice Assistant built using Python and Streamlit.
It simulates a structured interview environment with basic emotional intelligence, performance tracking, and voice-based answer input.

📌 Project Objective
The objective of this project is to build a structured AI system that:
Detects basic user emotions
Conducts HR and technical interviews
Evaluates answers using keyword logic
Stores user performance data
Tracks improvement over time
Supports voice-based answer input (Speech-to-Text)

🚀 Features
🔐 Name + Email Login System
😊 Emotional Response Detection (Welcome Stage)
🧑‍💼 Structured Interview Flow (HR → Technical)
🧠 Keyword-Based Answer Evaluation
🎤 Voice-to-Text Answer Input (Browser-based Speech Recognition)
📊 Score Calculation System
📈 Dashboard with Performance Graph
💾 Persistent Memory Storage using memory.json
🔄 State-Based Navigation
(Login → Welcome → Interview → Dashboard)

🌙 Modern Dark UI with Background Design
🏗️ System Architecture
Frontend: Streamlit UI
Backend Logic: Python
Memory Storage: JSON-based structured file (memory.json)
The application uses:
st.session_state for temporary state handling
JSON file for persistent user-level performance tracking

🔄 Application States
The system is divided into four structured states:
Login
Welcome
Interview
Dashboard
State transitions are managed using Streamlit’s session_state.

🧠 Core Concepts Used
State Management
Session Handling
JSON Data Storage
Keyword-Based Evaluation Logic
Basic Emotion Detection using Conditional Logic
Speech-to-Text using Browser Web Speech API
Performance Tracking with Graph Visualization

🛠️ Technologies Used
Python
Streamlit
JSON
HTML + CSS (Custom Styling)
Browser Web Speech API (for Voice Input)

📂 Project Structure
AINI_project/
│
├── app.py
├── questions.py
├── memory.json
├── image.png
└── README.md

▶️ How to Run the Project
Install Streamlit (if not installed):
pip install streamlit
Run the application:
python -m streamlit run app.py
Open in Google Chrome for Voice Input support.
Allow microphone permissions when prompted.

💡 Future Improvements
AI-based response evaluation using LLMs (Gemini/OpenAI)
Real-time feedback generation
Text-to-Speech output
Advanced sentiment analysis
Database integration instead of JSON

📌 Conclusion
AINI demonstrates a structured AI Interview Assistant with emotional awareness, scoring logic, voice integration, and performance tracking.
It provides a practical simulation of a real interview environment while maintaining a clean and interactive user experience.
