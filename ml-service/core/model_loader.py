import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

models = {}

MODELS_DIR = Path(os.getenv("MODELS_DIR", "/app/models"))


async def load_all_models():
    await _load_sentence_transformer()
    await _load_salary_model()
    logger.info("Model loading complete")


async def _load_sentence_transformer():
    try:
        from sentence_transformers import SentenceTransformer
        model_name = os.getenv("SENTENCE_TRANSFORMER_MODEL", "all-MiniLM-L6-v2")
        models["sentence_transformer"] = SentenceTransformer(model_name)
        logger.info(f"Loaded sentence transformer: {model_name}")
    except Exception as e:
        logger.warning(f"Could not load sentence transformer: {e}")


async def _load_salary_model():
    salary_path = MODELS_DIR / "salary_model.joblib"
    if salary_path.exists():
        try:
            import joblib
            models["salary_model"] = joblib.load(salary_path)
            logger.info("Loaded salary prediction model")
        except Exception as e:
            logger.warning(f"Could not load salary model: {e}")
    else:
        logger.info("No pre-trained salary model found; will use fallback estimates")


def get_model(name: str):
    return models.get(name)
