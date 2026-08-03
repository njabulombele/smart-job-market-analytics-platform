from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List
import logging
from datetime import date, timedelta
import math

logger = logging.getLogger(__name__)
router = APIRouter()


class DemandForecastRequest(BaseModel):
    skill: str
    months: int = Field(ge=1, le=24, default=6)


class ForecastPoint(BaseModel):
    period: str
    predicted: float
    lower: float
    upper: float


class DemandForecastResponse(BaseModel):
    skill: str
    model: str
    forecast: List[ForecastPoint]


@router.post("/forecast", response_model=DemandForecastResponse)
def forecast_demand(request: DemandForecastRequest):
    try:
        forecast = _prophet_forecast(request.skill, request.months)
        model_used = "prophet"
    except Exception as e:
        logger.warning(f"Prophet unavailable ({e}), using trend model")
        forecast = _trend_forecast(request.skill, request.months)
        model_used = "trend"

    return DemandForecastResponse(
        skill=request.skill,
        model=model_used,
        forecast=forecast,
    )


def _prophet_forecast(skill: str, months: int) -> List[ForecastPoint]:
    from prophet import Prophet
    import pandas as pd
    import numpy as np

    today = date.today()
    dates = [today - timedelta(days=30 * i) for i in range(24, 0, -1)]
    base_jobs = 500 + hash(skill) % 500

    df = pd.DataFrame({
        "ds": pd.to_datetime(dates),
        "y": [base_jobs + 10 * i + 30 * math.sin(i * 0.5) + np.random.normal(0, 20)
              for i in range(24)],
    })

    model = Prophet(yearly_seasonality=True, weekly_seasonality=False)
    model.fit(df)

    future = model.make_future_dataframe(periods=months, freq="MS")
    forecast_df = model.predict(future)
    forecast_rows = forecast_df.tail(months)

    return [
        ForecastPoint(
            period=str(row["ds"])[:7],
            predicted=round(max(0, row["yhat"]), 1),
            lower=round(max(0, row["yhat_lower"]), 1),
            upper=round(max(0, row["yhat_upper"]), 1),
        )
        for _, row in forecast_rows.iterrows()
    ]


def _trend_forecast(skill: str, months: int) -> List[ForecastPoint]:
    today = date.today()
    base = 500 + hash(skill) % 500
    trend = 10 if skill.lower() in ["python", "aws", "kubernetes", "react"] else 3

    result = []
    for i in range(1, months + 1):
        period_date = date(today.year, today.month, 1) + timedelta(days=32 * i)
        period_date = date(period_date.year, period_date.month, 1)
        predicted = base + trend * i
        result.append(ForecastPoint(
            period=period_date.strftime("%Y-%m"),
            predicted=float(predicted),
            lower=float(predicted * 0.9),
            upper=float(predicted * 1.1),
        ))
    return result
