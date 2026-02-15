import streamlit as st
import json
import os
import base64
from datetime import datetime
from questions import questions   # YOUR QUESTIONS FILE

st.set_page_config(page_title="AINI AI", layout="wide")

# ---------------- BACKGROUND ---------------- #

def set_background():
    if os.path.exists("image.png"):
        with open("image.png", "rb") as f:
            data = f.read()
        encoded = base64.b64encode(data).decode()

        st.markdown(f"""
        <style>
        .stApp {{
            background:
            linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)),
            url("data:image/png;base64,{encoded}");
            background-size: cover;
            background-position: center;
        }}

        .card {{
            background: rgba(255,255,255,0.08);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(15px);
            margin-top: 60px;
        }}
        </style>
        """, unsafe_allow_html=True)

set_background()

# ---------------- MEMORY SAFE LOAD ---------------- #

if not os.path.exists("memory.json"):
    with open("memory.json", "w") as f:
        json.dump({"users": {}}, f)

with open("memory.json", "r") as f:
    memory = json.load(f)

if "users" not in memory:
    memory["users"] = {}

def save_memory():
    with open("memory.json", "w") as f:
        json.dump(memory, f, indent=4)

# ---------------- SESSION ---------------- #

if "page" not in st.session_state:
    st.session_state.page = "login"

if "question_index" not in st.session_state:
    st.session_state.question_index = 0

if "score" not in st.session_state:
    st.session_state.score = 0

if "answers" not in st.session_state:
    st.session_state.answers = []

# ---------------- LOGIN PAGE ---------------- #

if st.session_state.page == "login":

    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.title("🤖 Welcome to AINI")

    name = st.text_input("Enter Your Name")
    email = st.text_input("Enter Your Email")

    if st.button("Start"):
        if name and email:

            st.session_state.name = name
            st.session_state.email = email

            if email not in memory["users"]:
                memory["users"][email] = {}

            # SAFE KEYS
            memory["users"][email].setdefault("name", name)
            memory["users"][email].setdefault("conversations", [])
            memory["users"][email].setdefault("scores", [])

            save_memory()

            st.session_state.page = "welcome"
            st.rerun()

    st.markdown('</div>', unsafe_allow_html=True)

# ---------------- WELCOME + EMOTION ---------------- #

elif st.session_state.page == "welcome":

    st.markdown('<div class="card">', unsafe_allow_html=True)

    st.header(f"Hello {st.session_state.name} 👋")
    st.write("I am AINI 🤖 — your AI Interview Assistant.")

    feeling = st.text_input("How are you feeling today?")

    if feeling:
        text = feeling.lower()

        if any(w in text for w in ["tired","sad","upset"]):
            st.info("💙 I understand. It's okay. I'm here to help you grow stronger.")
        elif any(w in text for w in ["happy","excited"]):
            st.success("✨ That’s wonderful energy! Let's use it productively.")
        else:
            st.write("🙂 Thank you for sharing.")

    if st.button("Start Interview"):
        st.session_state.page = "interview"
        st.rerun()

    st.markdown('</div>', unsafe_allow_html=True)

# ---------------- INTERVIEW ---------------- #

elif st.session_state.page == "interview":

    st.markdown('<div class="card">', unsafe_allow_html=True)

    index = st.session_state.question_index

    if index < len(questions):

        q = questions[index]
        st.subheader(f"Question {index+1}")
        st.write(q["question"])

        answer = st.text_area("Your Answer", key=f"answer_{index}")

        col1, col2 = st.columns(2)

        with col1:
            if st.button("Submit Answer"):

                keywords = q["keywords"]
                match = sum(1 for k in keywords if k in answer.lower())

                if match >= 2:
                    st.success("✅ Good Answer!")
                    st.session_state.score += 10
                else:
                    st.warning("⚠ Try to include more technical keywords.")

                st.session_state.answers.append({
                    "question": q["question"],
                    "answer": answer
                })

        with col2:
            if st.button("Next Question"):
                st.session_state.question_index += 1
                st.rerun()

        if st.button("Finish Interview"):
            st.session_state.page = "dashboard"
            st.rerun()

    else:
        st.session_state.page = "dashboard"
        st.rerun()

    st.markdown('</div>', unsafe_allow_html=True)

# ---------------- DASHBOARD ---------------- #

elif st.session_state.page == "dashboard":

    st.markdown('<div class="card">', unsafe_allow_html=True)

    st.title("📊 Interview Dashboard")

    email = st.session_state.email

    # SAFE AGAIN
    memory["users"][email].setdefault("scores", [])
    memory["users"][email].setdefault("conversations", [])

    memory["users"][email]["scores"].append(st.session_state.score)
    memory["users"][email]["conversations"].extend(st.session_state.answers)

    save_memory()

    st.write(f"### Final Score: {st.session_state.score}")

    st.line_chart(memory["users"][email]["scores"], height=200)

    st.write("### Recent Answers:")
    for a in st.session_state.answers[-3:]:
        st.write("Q:", a["question"])
        st.write("Your Ans:", a["answer"])
        st.write("---")

    if st.button("Restart"):
        st.session_state.question_index = 0
        st.session_state.score = 0
        st.session_state.answers = []
        st.session_state.page = "welcome"
        st.rerun()

    st.markdown('</div>', unsafe_allow_html=True)
