import os
import requests
import logging
from datetime import date
from typing import List, Dict

logger = logging.getLogger(__name__)

ADZUNA_APP_ID  = os.getenv("ADZUNA_APP_ID", "")
ADZUNA_API_KEY = os.getenv("ADZUNA_API_KEY", "")
ADZUNA_BASE    = "https://api.adzuna.com/v1/api/jobs"


class AdzunaCollector:
    name = "adzuna"

    SEARCH_TERMS = [
        "software engineer", "java developer", "python developer",
        "cloud engineer", "devops engineer", "data engineer",
        "machine learning engineer", "full stack developer",
    ]

    def collect(self) -> List[Dict]:
        if not ADZUNA_APP_ID:
            logger.warning("Adzuna credentials not configured, using mock data")
            return self._mock_data()

        all_jobs = []
        for term in self.SEARCH_TERMS:
            try:
                jobs = self._fetch_term(term, country="us", pages=3)
                all_jobs.extend(jobs)
                logger.info(f"Collected {len(jobs)} jobs for '{term}' from Adzuna")
            except Exception as e:
                logger.error(f"Error collecting '{term}' from Adzuna: {e}")

        return all_jobs

    def _fetch_term(self, term: str, country: str, pages: int) -> List[Dict]:
        jobs = []
        for page in range(1, pages + 1):
            resp = requests.get(
                f"{ADZUNA_BASE}/{country}/search/{page}",
                params={
                    "app_id": ADZUNA_APP_ID,
                    "app_key": ADZUNA_API_KEY,
                    "what": term,
                    "results_per_page": 50,
                    "content-type": "application/json",
                },
                timeout=15,
            )
            resp.raise_for_status()
            data = resp.json()

            for job in data.get("results", []):
                jobs.append({
                    "external_id": job.get("id"),
                    "title": job.get("title"),
                    "description": job.get("description"),
                    "company": job.get("company", {}).get("display_name"),
                    "city": job.get("location", {}).get("display_name"),
                    "country": country.upper(),
                    "salary_min": job.get("salary_min"),
                    "salary_max": job.get("salary_max"),
                    "source_url": job.get("redirect_url"),
                    "source_name": "adzuna",
                    "posted_at": job.get("created"),
                    "collected_date": str(date.today()),
                })

        return jobs

    def _mock_data(self) -> List[Dict]:
        return [
            {
                "external_id": f"mock-adzuna-{i}",
                "title": f"Software Engineer {i}",
                "description": "Java Spring Boot microservices experience required",
                "company": "Tech Corp",
                "city": "New York",
                "country": "US",
                "salary_min": 100000,
                "salary_max": 150000,
                "source_url": "https://example.com",
                "source_name": "adzuna",
                "posted_at": str(date.today()),
                "collected_date": str(date.today()),
            }
            for i in range(1, 11)
        ]
