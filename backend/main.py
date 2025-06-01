import base64
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
import os

from pydantic import BaseModel

# Load environment variables from .env file
load_dotenv()

# Constants
INTERVIEW_AI_SYSTEM_PROMPT = """
You are an AI designed to role-play as an experienced technical interviewer. Your purpose is to help a user practice for a behavioral interview in a structured and fair manner.

Start by greeting the candidate and asking how they are doing; then **wait for their answer** before continuing.

After the candidate responds to your greeting, ask exactly one behavioral interview question.

After each candidate response:
- Offer exactly ONE sentence of brief, objective feedback.
- Then ask exactly ONE follow-up question or transition to a new behavioral question.

Ensure your entire response is under 2 sentences and does not contain multiple sub-questions or lists.

After precisely 5 questions have been asked, conclude the interview by thanking the candidate.

Your tone should be professional, concise, and strictly adhere to all structural constraints.

Candidate background:
- Name: {name}
- Company: {company}
- Experience: 3 years software development.
- Goal: Practice behavioral interview for {company} SWE role.
"""

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables.")

client = OpenAI(api_key=OPENAI_API_KEY)

# FastAPI setup
app = FastAPI()

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",  # Add this
    "http://127.0.0.1:5174"   # Add this
    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# TTS using OpenAI
def synthesize_speech_with_openai(text: str):
    response = client.audio.speech.create(
        model="tts-1",
        voice="alloy",
        input=text
    )
    audio_bytes = response.read()
    return base64.b64encode(audio_bytes).decode("utf-8")
class InterviewRequest(BaseModel):
    name: str
    company: str


@app.post("/api/start-interview")
async def start_interview(payload: InterviewRequest):
    name = payload.name.strip()
    company = payload.company.strip()
    if not name or not company:
        raise HTTPException(status_code=400, detail="Name and company must be provided.")
    try:
        # Construct initial prompt for ChatCompletion
        formatted_prompt = INTERVIEW_AI_SYSTEM_PROMPT.format(name=name, company=company)
        messages = [
            {"role": "system", "content": formatted_prompt},
            
        ]

        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=150
        )

        reply_text = response.choices[0].message.content.strip()
        audio_base64 = synthesize_speech_with_openai(reply_text)

        return {
            "initial_question": reply_text,
            "audio_base64": audio_base64,
            "initial_history": messages + [{"role": "assistant", "content": reply_text}]
        }

    except Exception as e:
        print(f"Error starting interview: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to start interview: {str(e)}")

@app.post("/api/generate-answer")
async def generate_answer(request: Request):
    body = await request.json()
    print(f"Received body: {body}")
    user_message = body.get("user_message", "").strip()
    history = body.get("history", [])
    name = body.get("name", "").strip()
    company = body.get("company", "").strip()
    print(f" {name, company}")
    if not user_message:
        raise HTTPException(status_code=400, detail="No user message provided for this turn.")

    try:
        formatted_prompt = INTERVIEW_AI_SYSTEM_PROMPT.format(
            name=name,
            company=company
        )
        messages = [{"role": "system", "content": formatted_prompt}] + history
        messages.append({"role": "user", "content": user_message})

        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=200
        )

        reply = response.choices[0].message.content.strip()
        audio_base64 = synthesize_speech_with_openai(reply)

        updated_history = history + [{"role": "user", "content": user_message}, {"role": "assistant", "content": reply}]

        return {
            "answer": reply,
            "audio_base64": audio_base64,
            "updated_history": updated_history
        }

    except Exception as e:
        print(f"Error generating response: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")

    except Exception as e:
        print(f"Error generating response: {e}")
        raise HTTPException(status_code=500, detail=f"Error generating response: {str(e)}")
