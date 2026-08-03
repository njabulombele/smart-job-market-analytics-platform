from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Optional
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

SKILL_PREMIUMS = {
    "aws": 15000, "azure": 14000, "kubernetes": 12000, "spark": 13000,
    "kafka": 11000, "machine learning": 18000, "deep learning": 20000,
    "tensorflow": 17000, "pytorch": 17000, "go": 10000, "rust": 12000,
    "java": 8000, "python": 9000, "react": 7000, "spring boot": 8000,
    "docker": 6000, "postgresql": 5000,
}

CITY_MULTIPLIERS = {
    "san francisco": 1.45, "new york": 1.35, "seattle": 1.30,
    "austin": 1.10, "boston": 1.20, "chicago": 1.10,
    "london": 1.25, "berlin": 1.05, "amsterdam": 1.10,
    "remote": 1.15,
}

BASE_SALARY = 80000
EXP_PREMIUM_PER_YEAR = 5000


class SalaryPredictionRequest(BaseModel):
    experienceYears: int = Field(ge=0, le=40)
    skills: List[str]
    city: str
    company: Optional[str] = None


class SalaryPredictionResponse(BaseModel):
    predictedSalary: float
    rangeLow: float
    rangeHigh: float
    confidence: float
    currency: str = "USD"


@router.post("/predict", response_model=SalaryPredictionResponse)
def predict_salary(request: SalaryPredictionRequest):
    from core.model_loader import get_model

    model = get_model("salary_model")

    if model is not None:
        try:
            features = _build_features(request)
            prediction = model.predict([features])[0]
        except Exception as e:
            logger.warning(f"Model prediction failed, using heuristic: {e}")
            prediction = _heuristic_predict(request)
    else:
        prediction = _heuristic_predict(request)

    return SalaryPredictionResponse(
        predictedSalary=round(prediction, 2),
        rangeLow=round(prediction * 0.85, 2),
        rangeHigh=round(prediction * 1.15, 2),
        confidence=0.82,
        currency="USD",
    )


def _heuristic_predict(req: SalaryPredictionRequest) -> float:
    salary = BASE_SALARY
    salary += req.experienceYears * EXP_PREMIUM_PER_YEAR

    skills_lower = [s.lower() for s in req.skills]
    for skill in skills_lower:
        salary += SKILL_PREMIUMS.get(skill, 0)

    city_lower = req.city.lower()
    multiplier = 1.0
    for city_key, mult in CITY_MULTIPLIERS.items():
        if city_key in city_lower:
            multiplier = mult
            break

    return salary * multiplier


def _build_features(req: SalaryPredictionRequest) -> list:
    skill_flags = [1 if s.lower() in [sk.lower() for sk in req.skills] else 0
                   for s in SKILL_PREMIUMS.keys()]
    city_mult = next(
        (v for k, v in CITY_MULTIPLIERS.items() if k in req.city.lower()), 1.0
    )
    return [req.experienceYears, city_mult] + skill_flags
