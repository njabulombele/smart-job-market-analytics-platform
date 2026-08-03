from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator

default_args = {
    "owner": "jobmarket",
    "depends_on_past": False,
    "email_on_failure": True,
    "email_on_retry": False,
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}

with DAG(
    dag_id="daily_job_collector",
    default_args=default_args,
    description="Daily pipeline: collect → clean → store → transform → warehouse → reports",
    schedule_interval="0 6 * * *",
    start_date=datetime(2024, 1, 1),
    catchup=False,
    tags=["jobmarket", "pipeline"],
) as dag:

    def collect_jobs(**context):
        from collectors.adzuna_collector import AdzunaCollector
        from collectors.jsearch_collector import JsearchCollector

        collectors = [AdzunaCollector(), JsearchCollector()]
        total = 0
        for collector in collectors:
            jobs = collector.collect()
            total += len(jobs)
            context["ti"].xcom_push(key=f"{collector.name}_count", value=len(jobs))

        print(f"Collected {total} jobs total")
        return total

    def clean_data(**context):
        from processors.cleaner import JobCleaner
        cleaner = JobCleaner()
        result = cleaner.clean_today()
        print(f"Cleaned {result['processed']} jobs, dropped {result['dropped']} invalid")
        return result

    def store_raw(**context):
        from storage.blob_uploader import BlobUploader
        uploader = BlobUploader()
        path = uploader.upload_daily_raw()
        print(f"Uploaded raw data to: {path}")
        return path

    def spark_transform(**context):
        import subprocess
        result = subprocess.run(
            ["spark-submit", "--master", "local[*]",
             "/opt/airflow/plugins/spark/transform_jobs.py"],
            capture_output=True, text=True
        )
        if result.returncode != 0:
            raise RuntimeError(f"Spark job failed: {result.stderr}")
        print(result.stdout)

    def load_warehouse(**context):
        from warehouse.duckdb_loader import DuckDBLoader
        loader = DuckDBLoader()
        result = loader.load_today()
        print(f"Loaded {result['rows_inserted']} rows into warehouse")
        return result

    def generate_reports(**context):
        from reporting.daily_reporter import DailyReporter
        reporter = DailyReporter()
        reporter.generate()
        print("Daily reports generated")

    t_collect   = PythonOperator(task_id="collect_jobs",     python_callable=collect_jobs)
    t_clean     = PythonOperator(task_id="clean_data",       python_callable=clean_data)
    t_store     = PythonOperator(task_id="store_raw",        python_callable=store_raw)
    t_transform = PythonOperator(task_id="spark_transform",  python_callable=spark_transform)
    t_load      = PythonOperator(task_id="load_warehouse",   python_callable=load_warehouse)
    t_report    = PythonOperator(task_id="generate_reports", python_callable=generate_reports)

    t_collect >> t_clean >> t_store >> t_transform >> t_load >> t_report
