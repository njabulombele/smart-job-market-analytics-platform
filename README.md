<div align="center">

# Smart Job Market Analytics Platform

### AI-powered job market intelligence for the South African tech industry

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![Kubernetes](https://img.shields.io/badge/Kubernetes-AKS-326CE5?style=flat-square&logo=kubernetes&logoColor=white)](https://kubernetes.io/)
[![Terraform](https://img.shields.io/badge/Terraform-Azure-7B42BC?style=flat-square&logo=terraform&logoColor=white)](https://www.terraform.io/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

[Features](#-features) · [Architecture](#-architecture) · [Tech Stack](#-tech-stack) · [Quick Start](#-quick-start) · [API Docs](#-api-documentation) · [Deploy](#-production-deployment)

</div>

---

## What Is This?

**Smart Job Market Analytics** is a production-grade platform that automatically collects thousands of South African tech job postings every day, analyses them with machine learning, and exposes the insights through a professional web dashboard.

It was built to answer the questions every software engineer in South Africa asks:

- *Which skills are companies hiring for right now?*
- *What is the market paying for Java / Python / Cloud roles in Johannesburg?*
- *How well does my CV match this specific job posting?*
- *What should I learn next to stay competitive?*

The platform combines a real-time data pipeline, an event-driven backend API, a Python ML service, and an AI career coach — all wired together with the same tools used in enterprise production systems.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📊 **Market Dashboard** | Live stat cards, top skills bar chart, top hiring cities, 30-day activity trend |
| 🔍 **Job Search** | Search and filter 124K+ postings by skill, city, remote type, experience level, and employment type |
| 📈 **Analytics** | Skill demand charts, 12-month trend lines, salary statistics by skill and city (ZAR) |
| 📉 **Trends** | Multi-skill comparison line charts showing 12-month demand curves |
| 🤖 **Resume Matcher** | Upload your CV, enter a job ID — AI scores the match and shows exactly which skills are missing |
| 💬 **AI Career Coach** | Chat with an LLM backed by real market data (RAG). Grounded advice, not generic tips |
| 🔐 **Auth & Roles** | JWT authentication, role-based access (USER / ANALYST / ADMIN) |
| 🛠️ **Admin Panel** | User management, platform stats, manual pipeline trigger |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (User)                        │
│             Next.js 14 Frontend  :3000                  │
└──────────────────────┬──────────────────────────────────┘
                       │ REST / JSON
┌──────────────────────▼──────────────────────────────────┐
│           Spring Boot Backend API  :8080                 │
│    JWT Auth · Controllers · Services · Redis Cache       │
└──────┬───────────────┬──────────────────┬───────────────┘
       │               │                  │
  PostgreSQL        Redis             Kafka
  (main DB)        (cache)         (event bus)
   :5434            :6379            :9092
       │                                  │
       │               ┌──────────────────▼──────────────┐
       │               │    Data Pipeline  (Airflow)      │
       │               │    Runs daily at 06:00 UTC       │
       │               │    Adzuna API + JSearch API       │
       │               └─────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────┐
│              ML Service (FastAPI)  :8000                 │
│  Salary prediction · Resume matching · Demand forecast   │
│  AI Career Coach  (LangChain + OpenAI + ChromaDB RAG)   │
└─────────────────────────────────────────────────────────┘
```

### Key Architecture Decisions

| Decision | Why |
|---|---|
| **Kafka** between pipeline and API | Decouples data ingestion from analytics computation — the pipeline publishes events; the backend updates asynchronously |
| **Redis** caching on analytics endpoints | Prevents expensive aggregation queries on every page visit — charts load in milliseconds |
| **Flyway** DB migrations | Schema changes are version-controlled and applied automatically on startup |
| **Airflow** for the daily pipeline | Built-in retry logic, dependency management, and visual run monitoring |
| **FastAPI** for ML | The Python ML/AI ecosystem (LangChain, sentence-transformers, Prophet) has no equivalent in Java |
| **RAG** for the AI Coach | ChromaDB stores real market facts as vectors — the LLM retrieves relevant context before answering, so advice is grounded in actual data |
| **Terraform** for infra | The entire Azure environment is reproducible and version-controlled — spin up from nothing in 10 minutes |

---

## 🛠 Tech Stack

### Backend — `backend/`
| Technology | Purpose |
|---|---|
| Java 21 + Spring Boot 3.2 | REST API, dependency injection, auto-configuration |
| Spring Security + JJWT | JWT authentication, role-based access control |
| Spring Data JPA + Hibernate | ORM — maps Java entities to PostgreSQL tables |
| Spring Data Redis | Caching analytics results with configurable TTL |
| Spring Kafka | Producing and consuming job events |
| Flyway | Versioned database schema migrations |
| MapStruct | Compile-time entity → DTO mapping |
| Lombok | Eliminates boilerplate (getters, builders, constructors) |
| SpringDoc / Swagger UI | Auto-generated interactive API documentation |
| Micrometer + Prometheus | Exports JVM, request, and Kafka metrics |

### Frontend — `frontend/`
| Technology | Purpose |
|---|---|
| Next.js 14 (App Router) | React framework, server-side routing, optimised builds |
| TypeScript | End-to-end type safety |
| Zustand | Lightweight global state (auth tokens, user object) |
| Recharts | Bar charts, line charts, area charts |
| React Hook Form + Zod | Type-safe form validation |
| Axios | HTTP client with automatic JWT token injection |
| Tailwind CSS | Utility-first styling |

### ML Service — `ml-service/`
| Technology | Purpose |
|---|---|
| FastAPI | High-performance async Python API |
| LangChain + OpenAI | LLM orchestration for the AI career coach |
| ChromaDB | Vector database for RAG (stores job market facts) |
| Sentence Transformers | Semantic text embeddings for resume matching |
| XGBoost / LightGBM | Salary prediction regression models |
| Facebook Prophet | Time-series forecasting for skill demand trends |
| pdfplumber | PDF text extraction from uploaded resumes |
| scikit-learn | Preprocessing, model evaluation utilities |

### Data Pipeline — `data-pipeline/`
| Technology | Purpose |
|---|---|
| Apache Airflow 2.8 | DAG orchestration, scheduling, retry logic |
| PySpark | Heavy NLP transformations (skill extraction, geocoding) |
| DuckDB | In-process analytics database for pre-aggregations |
| Azure Blob Storage | Raw job data archive |

### Infrastructure & DevOps
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Local development stack |
| Kubernetes + Helm | Production container orchestration |
| Terraform | Azure infrastructure as code |
| GitHub Actions | CI/CD: test → build → push → deploy |
| Prometheus + Grafana | Metrics collection and dashboards |
| Azure AKS | Managed Kubernetes cluster |
| Azure Container Registry | Private Docker image registry |
| Azure Key Vault | Encrypted secret management |

---

## 🚀 Quick Start

### Prerequisites

| Tool | Version | Download |
|---|---|---|
| Docker Desktop | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) |
| Java | 21 | [adoptium.net](https://adoptium.net/) |
| Maven | 3.9+ | [maven.apache.org](https://maven.apache.org/) |
| Node.js | 20+ | [nodejs.org](https://nodejs.org/) |
| Python | 3.11+ | [python.org](https://www.python.org/) |

### 1. Clone and configure

```bash
git clone https://github.com/njabulombele/smart-job-market-analytics-platform.git
cd smart-job-market-analytics-platform

# Create your environment file
cp .env.example .env
```

Edit `.env` — the only required value is `JWT_SECRET` (at least 32 characters):

```env
JWT_SECRET=your-minimum-32-character-secret-key-here

# Optional — enables the AI Coach
OPENAI_API_KEY=sk-...

# Optional — enables live job collection
ADZUNA_APP_ID=...
ADZUNA_API_KEY=...
RAPIDAPI_KEY=...
```

### 2. Start infrastructure

```bash
docker compose up -d postgres redis kafka
```

Wait for all three to be healthy (about 15 seconds):

```bash
docker ps   # STATUS should show (healthy)
```

### 3. Start the backend

```bash
cd backend
mvn spring-boot:run
```

Spring Boot will run Flyway migrations automatically on first start.
Ready when you see: `Started JobMarketApplication`

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

### 5. Start the ML service

```bash
cd ml-service
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 6. Open the app

| Service | URL | Credentials |
|---|---|---|
| **App** | http://localhost:3000 | admin@jobmarket.com / Admin1234! |
| **Swagger UI** | http://localhost:8080/swagger-ui.html | — |
| **ML API Docs** | http://localhost:8000/docs | — |
| **Grafana** | http://localhost:3003 | admin / admin |
| **Prometheus** | http://localhost:9090 | — |
| **Airflow** | http://localhost:8888 | admin / admin |

> **Shortcut:** Run `.\start-dev.ps1` (Windows PowerShell) to start infrastructure and print all instructions automatically.

---

## 📁 Project Structure

```
smart-job-market-analytics-platform/
│
├── backend/                    # Spring Boot REST API (Java 21)
│   ├── src/main/java/com/jobmarket/
│   │   ├── config/             # AppConfig, KafkaTopicsConfig
│   │   ├── controller/         # REST endpoints (Auth, Jobs, Analytics, AI, Admin)
│   │   ├── dto/                # Request/Response DTOs
│   │   ├── entity/             # JPA entities (User, Job, Company, Skill, Location)
│   │   ├── kafka/              # JobEventProducer, JobEventConsumer
│   │   ├── repository/         # Spring Data JPA repositories
│   │   ├── security/           # JwtService, JwtAuthFilter, SecurityConfig
│   │   └── service/            # Business logic layer
│   ├── src/main/resources/
│   │   ├── application.yml     # All configuration
│   │   └── db/migration/       # Flyway SQL migrations
│   └── Dockerfile
│
├── frontend/                   # Next.js 14 App (TypeScript)
│   ├── src/app/
│   │   ├── (auth)/             # Login, Register pages
│   │   ├── (dashboard)/        # Dashboard, Jobs, Analytics, Trends, Resume, AI Coach, Admin
│   │   ├── globals.css         # Design system
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   ├── src/lib/                # API client, utilities
│   ├── src/store/              # Zustand auth store
│   └── Dockerfile
│
├── ml-service/                 # FastAPI ML Microservice (Python)
│   ├── main.py                 # FastAPI app entry point
│   ├── core/
│   │   └── model_loader.py     # Pre-loads all ML models on startup
│   ├── routers/
│   │   ├── coach.py            # AI Career Coach (RAG + LLM)
│   │   ├── resume.py           # Resume matching (embeddings + cosine similarity)
│   │   ├── salary.py           # Salary prediction (XGBoost)
│   │   └── demand.py           # Demand forecasting (Prophet)
│   └── Dockerfile
│
├── data-pipeline/              # Apache Airflow Pipeline (Python)
│   ├── dags/
│   │   └── daily_job_collector.py   # Main DAG: collect → clean → store → transform → load
│   ├── collectors/             # Adzuna + JSearch API collectors
│   ├── processors/             # Data cleaning and validation
│   └── warehouse/              # DuckDB loader
│
├── helm/jobmarket/             # Kubernetes Helm chart
│   ├── Chart.yaml
│   ├── values.yaml             # Default configuration
│   └── templates/              # Deployment, Service, Ingress, HPA, Secrets
│
├── terraform/                  # Azure infrastructure as code
│   ├── main.tf                 # AKS, PostgreSQL, Redis, ACR, Key Vault, Blob Storage
│   ├── variables.tf
│   └── outputs.tf
│
├── monitoring/
│   ├── prometheus.yml          # Scrape configuration
│   └── grafana/dashboards/     # Pre-built dashboard JSON files
│
├── .github/workflows/
│   └── ci.yml                  # GitHub Actions: test → build → push → deploy
│
├── docker-compose.yml          # Complete local development stack
├── .env.example                # Environment variable template
└── start-dev.ps1               # Windows dev launcher script
```

---

## 🌐 API Documentation

The backend exposes a full REST API documented with Swagger UI.

**Base URL:** `http://localhost:8080/api/v1`

| Group | Endpoints |
|---|---|
| **Auth** | `POST /auth/register` · `POST /auth/login` · `POST /auth/refresh` |
| **Jobs** | `GET /jobs` · `GET /jobs/{id}` · `GET /jobs/search` |
| **Analytics** | `GET /analytics/skills/top` · `GET /analytics/locations/top` · `GET /analytics/trends` · `GET /analytics/salary` |
| **AI** | `POST /ai/chat` · `POST /ai/resume/match` · `POST /ai/salary/predict` · `GET /ai/demand/forecast` |
| **Applications** | `POST /applications` · `GET /applications/my` |
| **Admin** | `GET /admin/users` · `PUT /admin/users/{id}/role` · `GET /admin/stats` · `POST /admin/pipeline/trigger` |

Full interactive docs: **http://localhost:8080/swagger-ui.html**

---

## ☁️ Production Deployment

### Azure infrastructure with Terraform

```bash
cd terraform

# Initialise (state stored in Azure Blob)
terraform init

# Preview changes
terraform plan \
  -var="postgres_password=YourSecurePassword" \
  -var="jwt_secret=YourMinimum32CharJwtSecret"

# Apply
terraform apply
```

This creates: AKS cluster, PostgreSQL Flexible Server, Redis Cache, Container Registry, Key Vault, Blob Storage.

### Deploy application with Helm

```bash
# Build and push Docker images
docker build -t <acr-login-server>/backend:latest ./backend
docker build -t <acr-login-server>/frontend:latest ./frontend
docker build -t <acr-login-server>/ml-service:latest ./ml-service

docker push <acr-login-server>/backend:latest
docker push <acr-login-server>/frontend:latest
docker push <acr-login-server>/ml-service:latest

# Deploy to AKS
helm upgrade --install jobmarket ./helm/jobmarket \
  --namespace jobmarket --create-namespace \
  --set image.registry=<acr-login-server> \
  --set postgres.password=YourSecurePassword \
  --set jwt.secret=YourMinimum32CharJwtSecret
```

### CI/CD Pipeline (GitHub Actions)

Every push to `main` automatically runs:

```
Code Push
   └─ Run unit tests (Maven + Jest)
   └─ Build Docker images
   └─ Push to Azure Container Registry
   └─ Helm upgrade → AKS
   └─ Smoke test health endpoints
```

---

## 🗄️ Database

PostgreSQL runs on port **5434** locally (5432 inside Docker).

| Setting | Value |
|---|---|
| Host | `localhost:5434` |
| Database | `jobmarket` |
| Username | `postgres` |
| Password | `1234` |

Schema is managed entirely by Flyway migrations in `backend/src/main/resources/db/migration/`. The schema is applied automatically on every backend startup — no manual SQL needed.

---

## 📊 Monitoring

| Dashboard | URL | Login |
|---|---|---|
| Grafana | http://localhost:3003 | admin / admin |
| Prometheus | http://localhost:9090 | — |

Prometheus scrapes metrics every 15 seconds from:
- Spring Boot Actuator (`/actuator/prometheus`)
- FastAPI ML service (`/metrics`)
- PostgreSQL, Redis, and Kafka exporters

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push: `git push origin feature/your-feature-name`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ☕ Java, 🐍 Python, and ⚡ TypeScript

**[Back to top](#smart-job-market-analytics-platform)**

</div>
