import re
import json
import logging
from datetime import date
from pathlib import Path
from typing import List, Dict

logger = logging.getLogger(__name__)

RAW_DIR   = Path("/tmp/jobmarket/raw")
CLEAN_DIR = Path("/tmp/jobmarket/clean")

SKILL_PATTERNS = [
    r'\bjava\b', r'\bpython\b', r'\bjavascript\b', r'\btypescript\b',
    r'\breact\b', r'\bangular\b', r'\bvue\b', r'\bspring\s?boot\b',
    r'\bdocker\b', r'\bkubernetes\b', r'\baws\b', r'\bazure\b', r'\bgcp\b',
    r'\bterraform\b', r'\bpostgresql\b', r'\bmongodb\b', r'\bredis\b',
    r'\bkafka\b', r'\bspark\b', r'\bairflow\b', r'\bmachine\s?learning\b',
    r'\bdeep\s?learning\b', r'\btensorflow\b', r'\bpytorch\b', r'\bgo\b',
    r'\brust\b', r'\bkotlin\b', r'\bnode\.js\b', r'\bnextjs\b',
    r'\bgraphql\b', r'\brest\s?api\b', r'\bmicroservices\b', r'\bgit\b',
    r'\bjenkins\b', r'\bgithub\s?actions\b', r'\bci\/cd\b',
]


class JobCleaner:

    def clean_today(self) -> Dict:
        today = str(date.today())
        raw_file = RAW_DIR / f"{today}.json"

        if not raw_file.exists():
            logger.warning(f"No raw file found for {today}")
            return {"processed": 0, "dropped": 0}

        with open(raw_file) as f:
            raw_jobs = json.load(f)

        cleaned = []
        dropped = 0

        for job in raw_jobs:
            result = self._clean_job(job)
            if result:
                cleaned.append(result)
            else:
                dropped += 1

        CLEAN_DIR.mkdir(parents=True, exist_ok=True)
        out_file = CLEAN_DIR / f"{today}.json"
        with open(out_file, "w") as f:
            json.dump(cleaned, f, indent=2, default=str)

        logger.info(f"Cleaned {len(cleaned)} jobs, dropped {dropped}")
        return {"processed": len(cleaned), "dropped": dropped}

    def _clean_job(self, job: Dict) -> Dict | None:
        title   = (job.get("title") or "").strip()
        company = (job.get("company") or "").strip()

        if not title or len(title) < 3:
            return None
        if not company:
            return None

        description = self._clean_text(job.get("description") or "")
        skills = self._extract_skills(description + " " + title)

        return {
            "external_id":     str(job.get("external_id", "")),
            "title":           title[:255],
            "description":     description[:5000],
            "company":         company[:255],
            "city":            self._clean_text(job.get("city") or ""),
            "country":         (job.get("country") or "US")[:10],
            "salary_min":      self._parse_salary(job.get("salary_min")),
            "salary_max":      self._parse_salary(job.get("salary_max")),
            "salary_currency": (job.get("salary_currency") or "USD")[:10],
            "remote_type":     job.get("remote_type") or "ON_SITE",
            "source_url":      (job.get("source_url") or "")[:500],
            "source_name":     job.get("source_name", "unknown"),
            "posted_at":       job.get("posted_at"),
            "skills":          skills,
        }

    def _clean_text(self, text: str) -> str:
        text = re.sub(r'<[^>]+>', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def _extract_skills(self, text: str) -> List[str]:
        text_lower = text.lower()
        found = []
        for pattern in SKILL_PATTERNS:
            if re.search(pattern, text_lower, re.IGNORECASE):
                skill = re.sub(r'\\b|\\s\?', '', pattern).replace('\\', '').strip()
                if skill not in found:
                    found.append(skill)
        return found

    def _parse_salary(self, value) -> float | None:
        if value is None:
            return None
        try:
            return float(str(value).replace(",", "").replace("$", ""))
        except (ValueError, TypeError):
            return None
