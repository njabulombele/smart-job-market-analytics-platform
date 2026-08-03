import io
import re
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np

router = APIRouter()

TECH_SKILLS = [
    "python", "java", "javascript", "typescript", "react", "angular", "vue",
    "spring boot", "django", "fastapi", "node.js", "express", "docker",
    "kubernetes", "aws", "azure", "gcp", "terraform", "postgresql", "mysql",
    "mongodb", "redis", "kafka", "spark", "airflow", "machine learning",
    "deep learning", "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
    "sql", "git", "ci/cd", "github actions", "jenkins", "rest api", "graphql",
    "microservices", "agile", "scrum", "linux", "bash", "go", "rust", "kotlin",
    "swift", "flutter", "react native", "next.js", "tailwind", "figma",
    "elasticsearch", "rabbitmq", "grpc", "oauth", "jwt", "openapi",
]


class ResumeMatchResponse(BaseModel):
    score: float
    matchedSkills: List[str]
    missingSkills: List[str]
    explanation: str


def extract_text_from_pdf(content: bytes) -> str:
    try:
        import pdfplumber
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            return "\n".join(page.extract_text() or "" for page in pdf.pages)
    except Exception:
        return content.decode("utf-8", errors="ignore")


def extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    return [skill for skill in TECH_SKILLS if skill in text_lower]


def compute_similarity(skills_a: List[str], skills_b: List[str]) -> float:
    from core.model_loader import get_model
    model = get_model("sentence_transformer")

    if not skills_a or not skills_b:
        return 0.0

    if model is None:
        set_a, set_b = set(skills_a), set(skills_b)
        intersection = len(set_a & set_b)
        union = len(set_a | set_b)
        return intersection / union if union > 0 else 0.0

    emb_a = model.encode([" ".join(skills_a)])[0]
    emb_b = model.encode([" ".join(skills_b)])[0]
    cosine = np.dot(emb_a, emb_b) / (np.linalg.norm(emb_a) * np.linalg.norm(emb_b) + 1e-9)
    return float(cosine)


@router.post("/match", response_model=ResumeMatchResponse)
async def match_resume(
    resume: UploadFile = File(...),
    job_id: str = Form(...),
):
    content = await resume.read()
    resume_text = extract_text_from_pdf(content)

    if not resume_text.strip():
        raise HTTPException(400, "Could not extract text from resume")

    resume_skills = extract_skills(resume_text)

    sample_job_skills = ["python", "aws", "docker", "postgresql", "rest api", "kafka", "spark"]

    score = compute_similarity(resume_skills, sample_job_skills)
    matched = [s for s in sample_job_skills if s in resume_skills]
    missing = [s for s in sample_job_skills if s not in resume_skills]

    explanation = (
        f"Your resume matches {len(matched)} of {len(sample_job_skills)} required skills. "
        f"You have strong alignment with {', '.join(matched[:3]) if matched else 'none of the key skills'}. "
        f"Consider developing: {', '.join(missing[:3]) if missing else 'no critical gaps found'}."
    )

    return ResumeMatchResponse(
        score=round(score, 4),
        matchedSkills=matched,
        missingSkills=missing,
        explanation=explanation,
    )
