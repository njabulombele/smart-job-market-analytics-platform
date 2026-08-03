import os
import requests
import logging
from datetime import date
from typing import List, Dict

logger = logging.getLogger(__name__)

RAPIDAPI_KEY  = os.getenv("RAPIDAPI_KEY", "")
JSEARCH_HOST  = "jsearch.p.rapidapi.com"
JSEARCH_BASE  = f"https://{JSEARCH_HOST}"


class JsearchCollector:
    name = "jsearch"

    QUERIES = [
        "java developer", "python engineer", "cloud engineer",
        "devops kubernetes", "machine learning engineer",
    ]

    def collect(self) -> List[Dict]:
        if not RAPIDAPI_KEY:
            logger.warning("RapidAPI key not configured, using mock data")
            return self._mock_data()

        all_jobs = []
        for query in self.QUERIES:
            try:
                jobs = self._fetch_query(query, pages=2)
                all_jobs.extend(jobs)
                logger.info(f"Collected {len(jobs)} jobs for '{query}' from JSearch")
            except Exception as e:
                logger.error(f"Error collecting '{query}' from JSearch: {e}")

        return all_jobs

    def _fetch_query(self, query: str, pages: int) -> List[Dict]:
        jobs = []
        headers = {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": JSEARCH_HOST,
        }
        for page in range(1, pages + 1):
            resp = requests.get(
                f"{JSEARCH_BASE}/search",
                headers=headers,
                params={"query": query, "page": page, "num_pages": 1},
                timeout=15,
            )
            resp.raise_for_status()
            data = resp.json()

            for job in data.get("data", []):
                jobs.append({
                    "external_id": job.get("job_id"),
                    "title": job.get("job_title"),
                    "description": job.get("job_description"),
                    "company": job.get("employer_name"),
                    "city": job.get("job_city"),
                    "country": job.get("job_country", "US"),
                    "salary_min": job.get("job_min_salary"),
                    "salary_max": job.get("job_max_salary"),
                    "salary_currency": job.get("job_salary_currency", "USD"),
                    "remote_type": "REMOTE" if job.get("job_is_remote") else "ON_SITE",
                    "source_url": job.get("job_apply_link"),
                    "source_name": "jsearch",
                    "posted_at": job.get("job_posted_at_datetime_utc"),
                    "collected_date": str(date.today()),
                })

        return jobs

    def _mock_data(self) -> List[Dict]:
        return [
            {
                "external_id": f"mock-jsearch-{i}",
                "title": "Senior Python Engineer",
                "description": "AWS Lambda, Kafka, PostgreSQL, Docker required",
                "company": "Cloud Startup",
                "city": "San Francisco",
                "country": "US",
                "salary_min": 140000,
                "salary_max": 190000,
                "salary_currency": "USD",
                "remote_type": "REMOTE",
                "source_url": "https://example.com",
                "source_name": "jsearch",
                "posted_at": str(date.today()),
                "collected_date": str(date.today()),
            }
            for i in range(1, 11)
        ]
