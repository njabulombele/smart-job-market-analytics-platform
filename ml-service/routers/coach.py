import os
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional

logger = logging.getLogger(__name__)
router = APIRouter()

CAREER_KB = {
    "java": "Java developers should focus on: Spring Boot 3, Java 21 features (virtual threads), microservices, cloud deployment (AWS/Azure), and containerization with Docker/Kubernetes.",
    "python": "Python developers should learn: FastAPI or Django, async programming, data science libraries (pandas, NumPy), ML frameworks (scikit-learn, PyTorch), and cloud services.",
    "cloud engineer": "To become a Cloud Engineer: start with AWS or Azure fundamentals, earn cloud certifications (AWS Solutions Architect, AZ-900), learn Terraform for IaC, Kubernetes for orchestration, and CI/CD with GitHub Actions.",
    "interview": "Common Spring Boot interview questions: 1. Explain dependency injection. 2. How does Spring Security work? 3. What is the difference between @RestController and @Controller? 4. How do you configure database connections? 5. Explain JWT authentication flow.",
    "salary": "Software engineer salaries vary widely. Java developers in the US earn $100k-$180k depending on experience and location. Python developers: $95k-$170k. Cloud engineers: $120k-$200k.",
    "skills": "Most in-demand skills in 2024: Python, AWS, Kubernetes, React, TypeScript, Terraform, Spring Boot, Go, machine learning, and LLM/AI development.",
}


class ChatRequest(BaseModel):
    message: str
    sessionId: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    sessionId: str
    responseTimeMs: int


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    import time
    start = time.time()

    openai_key = os.getenv("OPENAI_API_KEY", "")
    if openai_key:
        reply = await _rag_chat(request.message, openai_key)
    else:
        reply = _keyword_chat(request.message)

    elapsed = int((time.time() - start) * 1000)
    return ChatResponse(
        reply=reply,
        sessionId=request.sessionId or "default",
        responseTimeMs=elapsed,
    )


async def _rag_chat(message: str, api_key: str) -> str:
    try:
        from openai import AsyncOpenAI
        client = AsyncOpenAI(api_key=api_key)

        context = _retrieve_context(message)

        system_prompt = f"""You are an expert AI Career Coach for software engineers.
Use the following job market data to answer questions accurately:

{context}

Keep answers concise, actionable, and specific to software engineering careers."""

        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": message},
            ],
            max_tokens=500,
            temperature=0.7,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.warning(f"OpenAI call failed: {e}")
        return _keyword_chat(message)


def _retrieve_context(message: str) -> str:
    msg_lower = message.lower()
    relevant = []
    for keyword, content in CAREER_KB.items():
        if keyword in msg_lower:
            relevant.append(content)
    return "\n".join(relevant) if relevant else "\n".join(list(CAREER_KB.values())[:2])


def _keyword_chat(message: str) -> str:
    msg_lower = message.lower()

    if any(w in msg_lower for w in ["learn", "skill", "next"]):
        return CAREER_KB["skills"]
    if any(w in msg_lower for w in ["cloud engineer", "cloud"]):
        return CAREER_KB["cloud engineer"]
    if any(w in msg_lower for w in ["interview", "question"]):
        return CAREER_KB["interview"]
    if any(w in msg_lower for w in ["salary", "pay", "earn"]):
        return CAREER_KB["salary"]
    if "java" in msg_lower:
        return CAREER_KB["java"]
    if "python" in msg_lower:
        return CAREER_KB["python"]

    return ("I can help you with career guidance, skill recommendations, interview preparation, "
            "and salary insights. Try asking about a specific technology or career path!")
