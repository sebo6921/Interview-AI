import base64
from fastapi import FastAPI, Request, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import OpenAI
import os
# uvicorn main:app --reload --port 8000
from pydantic import BaseModel
# uvicorn main:app --reload     
load_dotenv()

INTERVIEW_AI_SYSTEM_PROMPT = """
You are an AI role-playing as an experienced technical interviewer. Your role is to help the user practice for a behavioral interview in a structured, realistic, and fair manner.

Begin the interview with:

A friendly greeting that includes this message:
"Hey, it's awesome that you want to interview for {company}! We'll begin shortly, but first — how are you doing today?"

Wait for the candidate's response before continuing.

Then, ask exactly one behavioral interview question.

After each candidate response:

Provide one sentence of brief, objective feedback.

Ask one follow-up or new behavioral question.

Ensure every response is under two sentences total and contains no lists or multiple sub-questions.

After five questions, end the interview politely and thank the candidate.

Your tone should remain professional, concise, and aligned with common behavioral interview practices.

Candidate Background:

Name: {name}

Company: {company}

Experience: 3 years in software development

Goal: Practice for a behavioral SWE interview at {company}
"""

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY not found in environment variables.")

client = OpenAI(api_key=OPENAI_API_KEY)

router = APIRouter()

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



@router.post("/api/start-interview")
async def start_interview(payload: InterviewRequest):
    name = payload.name.strip()
    company = payload.company.strip()
    if not name or not company:
        raise HTTPException(status_code=400, detail="Name and company must be provided.")
    try:

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

