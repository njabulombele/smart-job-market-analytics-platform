# Smart Job Market Analytics Platform

AI-powered platform that collects software engineering job postings daily and delivers market intelligence, salary predictions, resume matching, and career coaching.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Recharts |
| Backend | Spring Boot 3, Java 21, JWT, Swagger/OpenAPI |
| Database | PostgreSQL 16 (port 5432) |
| Cache | Redis 7 |
| Messaging | Apache Kafka |
| Data Pipeline | Python, Airflow, PySpark, DuckDB |
| ML Service | FastAPI, scikit-learn, LightGBM, Prophet, FAISS, Sentence Transformers |
| DevOps | Docker, Kubernetes (AKS), Helm, Terraform, GitHub Actions |
| Monitoring | Prometheus, Grafana, Loki |
| Cloud | Azure (App Service, PostgreSQL, Blob, Key Vault, ACR, AKS) |

## Quick Start (Local)

### Prerequisites
- Docker Desktop
- Java 21 + Maven
- Node.js 20
- Python 3.11

### 1. Start all services with Docker Compose

```bash
docker-compose up -d
```

This starts: PostgreSQL, Redis, Kafka, Zookeeper, Prometheus, Grafana.

### 2. Run the backend

```bash
cd backend
mvn spring-boot:run
```

API: http://localhost:8080  
Swagger UI: http://localhost:8080/swagger-ui.html

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:3000

### 4. Run the ML service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 5. Run the data pipeline

```bash
cd data-pipeline
pip install -r requirements.txt
# Airflow webserver: http://localhost:8888
```

## Services & Ports

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| ML Service | http://localhost:8000 |
| Airflow | http://localhost:8888 |
| Grafana | http://localhost:3001 (admin/admin) |
| Prometheus | http://localhost:9090 |
| Kafka | localhost:9092 |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

## Database

- Host: `localhost:5432`
- Database: `jobmarket`
- Username: `postgres`
- Password: `1234`

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```
JWT_SECRET=your-minimum-32-character-secret-key-here
OPENAI_API_KEY=sk-...          # Optional: AI Coach
ADZUNA_APP_ID=...              # Optional: job collection
ADZUNA_API_KEY=...             # Optional: job collection
RAPIDAPI_KEY=...               # Optional: JSearch collector
```

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`):

```
PR → Unit Tests → Build Docker → SonarQube → Trivy Scan → Push ACR → Deploy AKS → Smoke Test
```

## Deploy to Azure

```bash
cd terraform
terraform init
terraform plan -var="postgres_password=1234" -var="jwt_secret=your-secret"
terraform apply
```

Then deploy with Helm:

```bash
helm upgrade --install jobmarket ./helm/jobmarket \
  --namespace jobmarket --create-namespace \
  --set registry=<acr-login-server> \
  --set postgresPassword=1234 \
  --set jwtSecret=your-secret
```

## Project Structure

```
smart-job-market/
├── backend/              # Spring Boot API (Java 21)
├── frontend/             # Next.js 14 app
├── ml-service/           # FastAPI ML microservice
├── data-pipeline/        # Airflow DAGs + collectors
├── helm/                 # Kubernetes Helm charts
├── terraform/            # Azure infrastructure
├── monitoring/           # Prometheus + Grafana config
├── .github/workflows/    # GitHub Actions CI/CD
└── docker-compose.yml    # Local development stack
```
