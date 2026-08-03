from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from routers import resume, salary, demand, coach
from core.model_loader import load_all_models

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading ML models...")
    await load_all_models()
    logger.info("Models loaded successfully")
    yield
    logger.info("Shutting down ML service")


app = FastAPI(
    title="JobMarket ML Service",
    description="Machine Learning microservice for salary prediction, demand forecasting, resume matching, and AI career coaching",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://backend:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router, prefix="/api/resume", tags=["Resume Matcher"])
app.include_router(salary.router, prefix="/api/salary", tags=["Salary Prediction"])
app.include_router(demand.router, prefix="/api/demand", tags=["Demand Forecast"])
app.include_router(coach.router, prefix="/api/coach", tags=["Career Coach"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "ml-service"}
