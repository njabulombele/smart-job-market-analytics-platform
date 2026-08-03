import json
import logging
import os
from datetime import date
from pathlib import Path
from typing import Dict

import duckdb

logger = logging.getLogger(__name__)

CLEAN_DIR      = Path("/tmp/jobmarket/clean")
WAREHOUSE_PATH = os.getenv("DUCKDB_PATH", "/data/warehouse/jobmarket.duckdb")


class DuckDBLoader:

    def __init__(self):
        os.makedirs(os.path.dirname(WAREHOUSE_PATH), exist_ok=True)
        self.conn = duckdb.connect(WAREHOUSE_PATH)
        self._ensure_schema()

    def _ensure_schema(self):
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS jobs_warehouse (
                external_id     VARCHAR,
                title           VARCHAR,
                description     TEXT,
                company         VARCHAR,
                city            VARCHAR,
                country         VARCHAR,
                salary_min      DOUBLE,
                salary_max      DOUBLE,
                salary_currency VARCHAR,
                remote_type     VARCHAR,
                source_url      VARCHAR,
                source_name     VARCHAR,
                posted_at       VARCHAR,
                skills          VARCHAR[],
                loaded_date     DATE,
                PRIMARY KEY (source_name, external_id)
            )
        """)
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS skill_demand_daily (
                skill       VARCHAR,
                job_count   INTEGER,
                load_date   DATE,
                PRIMARY KEY (skill, load_date)
            )
        """)

    def load_today(self) -> Dict:
        today = str(date.today())
        clean_file = CLEAN_DIR / f"{today}.json"

        if not clean_file.exists():
            logger.warning(f"No clean file for {today}")
            return {"rows_inserted": 0}

        with open(clean_file) as f:
            jobs = json.load(f)

        inserted = 0
        for job in jobs:
            try:
                self.conn.execute("""
                    INSERT OR REPLACE INTO jobs_warehouse VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                """, [
                    job["external_id"], job["title"], job["description"],
                    job["company"], job["city"], job["country"],
                    job["salary_min"], job["salary_max"], job["salary_currency"],
                    job["remote_type"], job["source_url"], job["source_name"],
                    job["posted_at"], job["skills"], today
                ])
                inserted += 1
            except Exception as e:
                logger.error(f"Error inserting job {job.get('external_id')}: {e}")

        self._update_skill_demand(today)

        logger.info(f"Loaded {inserted} rows for {today}")
        return {"rows_inserted": inserted, "date": today}

    def _update_skill_demand(self, date_str: str):
        self.conn.execute("""
            INSERT OR REPLACE INTO skill_demand_daily
            SELECT unnest(skills) AS skill, COUNT(*) AS job_count, ?::DATE
            FROM jobs_warehouse
            WHERE loaded_date = ?::DATE
            GROUP BY 1
        """, [date_str, date_str])

    def query(self, sql: str):
        return self.conn.execute(sql).fetchdf()
