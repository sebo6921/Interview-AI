from fastapi import APIRouter, UploadFile, File, Request, Depends
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
import fitz  # PyMuPDF
from openai import OpenAI
import os, json, re
from dotenv import load_dotenv
from backend.App.models import User
from backend.App.routes.database import get_db
from backend.App.routes.database import update_user_cv_data
router = APIRouter()
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

INTERVIEW_AI_SYSTEM_PROMPT = (
    "You are a system that extracts structured data from a CV. "
    "Return the response strictly in this JSON format, inside triple backticks with 'json':\n"
    "```json\n"
    "{\n"
    "  \"full_name\": \"\",\n"
    "  \"phone\": \"\",\n"
    "  \"skills\": [],\n"
    "  \"education\": [],\n"
    "  \"work_experience\": [],\n"
    "  \"other_info\": \"\"\n"
    "}\n"
    "```\n"
    "Leave fields empty if information is missing."
)

def extract_text_from_pdf(file):
    doc = fitz.open(stream=file, filetype="pdf")
    return "".join([page.get_text() for page in doc])

def update_user_cv_data(db: Session, user_id: int, data: dict):
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise Exception("User not found")

    user.full_name = data.get("full_name", user.full_name)
    user.phone = data.get("phone", user.phone)
    user.skills = json.dumps(data.get("skills", {}))
    user.education = json.dumps(data.get("education", {}))
    user.work_experience = json.dumps(data.get("work_experience", []))
    user.other_info = json.dumps(data.get("other_info", {}))

    db.commit()
    db.refresh(user)
    return user

@router.post("/extract-text-from-pdf")
async def upload_cv(request: Request, file: UploadFile = File(...), db: Session = Depends(get_db)):
    print("=== COOKIE DEBUG ===")
    print("All cookies:", dict(request.cookies))
    print("Raw cookie header:", request.headers.get("cookie"))
    print("User-Agent:", request.headers.get("user-agent"))
    
    user_id = request.cookies.get("user_id")
    print(f"Extracted user_id: '{user_id}' (type: {type(user_id)})")
    print("===================")
    
    if not user_id:
        return JSONResponse(status_code=401, content={
            "error": "User not authenticated.",
            "debug": {
                "cookies_received": dict(request.cookies),
                "cookie_header": request.headers.get("cookie")
            }
        })
    try:
        file_content = await file.read()
        extracted_text = extract_text_from_pdf(file_content)
        messages = [
            {"role": "system", "content": INTERVIEW_AI_SYSTEM_PROMPT},
            {"role": "user", "content": extracted_text}
        ]

        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=messages,
            temperature=0.7,
            max_tokens=800
        )
        # Clean and load JSON
        raw_content = response.choices[0].message.content
        #print("🧠 OpenAI Raw Content:\n", raw_content)

        json_str = re.search(r"```json\s*(.*?)\s*```", raw_content, re.DOTALL)
        if not json_str:
            print("❌ Invalid OpenAI response format.") 
            return JSONResponse(status_code=500, content={"error": "Invalid OpenAI response format."})
        parsed_data = json.loads(json_str.group(1))
        #print("✅ Parsed data being saved:", parsed_data)
        updated_user = update_user_cv_data(db, user_id, parsed_data)
        print(updated_user)
        if not updated_user:
            return JSONResponse(status_code=404, content={"error": "User not found."})
        return {"message": "User CV data updated", "user": updated_user.email}

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
