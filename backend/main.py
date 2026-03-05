import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")

client = genai.Client(api_key=api_key)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/chat")
def chat(req: ChatRequest):
    try:
        prompt = f"""
You are Aria, a highly intelligent, emotionally aware female AI interview assistant.

Your behavior rules:

1. Start like a real interviewer:
   - Greet politely.
   - Ask how the candidate is feeling.

2. Detect emotional tone:
   - If confident → match confidence.
   - If nervous/anxious → motivate gently.
   - If sad → encourage before continuing.

3. Interview Structure:
   - Ask for self-introduction first.
   - Then ask multiple HR questions:
        • Why should we hire you?
        • Where do you see yourself in 5 years?
        • What are your strengths and weaknesses?
        • Tell me about a challenge you faced.
   - Then clearly say:
        "We will now move to the technical round."

   - Ask multiple technical questions related to:
        • Programming
        • OOP
        • Data Structures
        • AI / ML basics
        • Web Development

4. After each answer:
   - Evaluate correctness.
   - If correct → encourage confidently.
   - If partially correct → improve and guide.
   - If wrong → explain correct answer gently.
   - Always motivate.

5. At end:
   - Give overall feedback.
   - Rate performance out of 10.
   - Mention strengths and improvement areas.

Speak naturally like a real human interviewer.
Be warm, confident, professional.

User message:
{req.message}
        """

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        return {"reply": response.text}

    except Exception as e:
        return {"reply": str(e)}
