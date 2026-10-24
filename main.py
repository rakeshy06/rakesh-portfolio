# //import os
# import json

# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from pydantic import BaseModel
# from dotenv import load_dotenv
# from google import genai
# from google.genai import types

# load_dotenv()

# app = FastAPI(title="Portfolio Chatbot API")

# # Allow your portfolio website to call this API
# app.add_middleware(
#     CORSMiddleware,
#    allow_origins=[
#         "https://rakesh-portfolio-psi-ivory.vercel.app",  # Your live Vercel domain
#         "https://rakesh-portfolio-8kmr.onrender.com",     # Your Render backend
#         "http://localhost:3000",
#         "http://127.0.0.1:5500",
#         "http://localhost:5500",
#     ],
#     allow_credentials=True,
#     allow_methods=["*"],  # Allows GET, POST, OPTIONS, etc.
#     allow_headers=["*"],  # Allows all headers
# )

# # Serve HTML, CSS, JS from the static folder
# app.mount("/static", StaticFiles(directory="static"), name="static")


# # Load your profile data
# try:
#     with open("profile_data.json", "r", encoding="utf-8") as file:
#         profile_data = json.load(file)
# except FileNotFoundError:
#     raise RuntimeError("profile_data.json file not found")


# SYSTEM_PROMPT = f"""
# You are the personal portfolio assistant for {profile_data.get('name', 'the website owner')}.

# Rules:
# 1. Answer only using the PROFILE DATA below.
# 2. Do not invent skills, projects, certificates, education, or contact details.
# 3. If the answer is not available in the profile data, say:
#    "I don't have that information right now."
# 4. Keep answers short, clear, and professional.
# 5. If someone asks for contact details, share only the details present in the profile data.

# PROFILE DATA:
# {json.dumps(profile_data, indent=2)}
# """


# class ChatRequest(BaseModel):
#     message: str
#     history: list = []


# class ChatResponse(BaseModel):
#     reply: str


# client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# @app.get("/")
# def home():
#     return {
#         "message": "Portfolio Chatbot API is running. Open /static/index.html"
#     }


# @app.post("/api/chat", response_model=ChatResponse)
# def chat(request: ChatRequest):
#     user_message = request.message.strip()

#     if not user_message:
#         raise HTTPException(status_code=400, detail="Message cannot be empty")

#     try:
#         response = client.models.generate_content(
#             model="gemini-3.5-flash-lite",
#             contents=user_message,
#             config=types.GenerateContentConfig(
#                 system_instruction=SYSTEM_PROMPT,
#                 temperature=0.3,
#                 max_output_tokens=300,
#             ),
#         )

#         reply = response.text

#         if not reply:
#             raise ValueError("Empty response from Gemini")

#         return ChatResponse(reply=reply)

#     except Exception as error:
#         print("GEMINI ERROR:", error)
#         raise HTTPException(
#             status_code=500,
#             detail="The AI assistant is temporarily unavailable. Please try again later."
#         )


import json
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from google import genai
from google.genai import types
from pydantic import BaseModel

load_dotenv()

app = FastAPI(title="Portfolio Chatbot API")

# Allow your portfolio website to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://rakesh-portfolio-psi-ivory.vercel.app",
        "https://rakesh-portfolio-8kmr.onrender.com",
        "http://localhost:3000",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Safely mount static directory if it exists
static_dir = Path("static")
if static_dir.exists():
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Load profile data with absolute/relative path safety
profile_path = Path(__file__).resolve().parent / "profile_data.json"
if not profile_path.exists():
    profile_path = Path("profile_data.json")

try:
    with open(profile_path, "r", encoding="utf-8") as file:
        profile_data = json.load(file)
except FileNotFoundError:
    raise RuntimeError("profile_data.json file not found")

SYSTEM_PROMPT = f"""
You are the personal portfolio assistant for {profile_data.get('name', 'the website owner')}.

Rules:
1. Answer only using the PROFILE DATA below.
2. Do not invent skills, projects, certificates, education, or contact details.
3. If the answer is not available in the profile data, say:
   "I don't have that information right now."
4. Keep answers short, clear, and professional.
5. If someone asks for contact details, share only the details present in the profile data.

PROFILE DATA:
{json.dumps(profile_data, indent=2)}
"""


class ChatRequest(BaseModel):
    message: str
    history: list = []


class ChatResponse(BaseModel):
    reply: str


# Initialize GenAI Client
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key) if api_key else None


@app.get("/")
def home():
    return {
        "message": "Portfolio Chatbot API is running. Open /static/index.html"
    }


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    user_message = request.message.strip()

    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    if not client:
        raise HTTPException(
            status_code=500,
            detail="GEMINI_API_KEY environment variable is not configured.",
        )

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.3,
                max_output_tokens=300,
            ),
        )

        reply = response.text

        if not reply:
            raise ValueError("Empty response from Gemini")

        return ChatResponse(reply=reply)

    except Exception as error:
        print("GEMINI ERROR:", error)
        raise HTTPException(
            status_code=500,
            detail="The AI assistant is temporarily unavailable. Please try again later.",
        )