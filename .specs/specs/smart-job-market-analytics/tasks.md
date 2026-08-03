# Smart Job Market Analytics Platform — Implementation Tasks

## Phase 1: Project Scaffold & Infrastructure

- [ ] 1.1 Initialize Spring Boot project (Java 21, Maven)
  - Dependencies: Spring Web, Security, Data JPA, Kafka, Cache, Actuator, SpringDoc
- [ ] 1.2 Initialize Next.js 14 frontend project
  - Dependencies: Tailwind CSS, shadcn/ui, Zustand, Axios, Recharts
- [ ] 1.3 Set up PostgreSQL schema (all tables from design.md)
- [ ] 1.4 Configure Docker Compose for local dev (postgres, redis, kafka, zookeeper)
- [ ] 1.5 Set up Airflow with Docker Compose
- [ ] 1.6 Create base Terraform files for Azure resources

## Phase 2: Backend — Auth & Users

- [ ] 2.1 Implement User entity, repository, service
- [ ] 2.2 Implement JWT generation and validation (JwtService)
- [ ] 2.3 Implement JwtAuthFilter and SecurityConfig
- [ ] 2.4 Implement register / login / refresh / logout endpoints
- [ ] 2.5 Implement RBAC with Spring Security method-level security
- [ ] 2.6 Write unit tests for auth layer

## Phase 3: Backend — Jobs & Companies

- [ ] 3.1 Implement Job, Company, Location, Skill entities and repositories
- [ ] 3.2 Implement JobSpecification for dynamic filtering
- [ ] 3.3 Implement job search endpoint with pagination and caching
- [ ] 3.4 Implement trending jobs endpoint
- [ ] 3.5 Kafka producer: publish job.raw.collected events
- [ ] 3.6 Kafka consumer: consume job.processed, update DB

## Phase 4: Backend — Analytics API

- [ ] 4.1 Implement top skills analytics endpoint
- [ ] 4.2 Implement top locations analytics endpoint
- [ ] 4.3 Implement salary statistics endpoint
- [ ] 4.4 Implement technology demand trend endpoint
- [ ] 4.5 Implement report generation (CSV export)

## Phase 5: Data Pipeline

- [ ] 5.1 Python job collector — Adzuna API integration
- [ ] 5.2 Python job collector — Jsearch/RapidAPI integration
- [ ] 5.3 Data cleaning and validation module
- [ ] 5.4 Azure Blob Storage upload module
- [ ] 5.5 PySpark transformation job
- [ ] 5.6 DuckDB warehouse loader
- [ ] 5.7 Airflow DAG: daily_job_collector
- [ ] 5.8 Airflow DAG: ml_trainer (weekly)

## Phase 6: ML Services

- [ ] 6.1 Salary prediction model (LightGBM) — training pipeline
- [ ] 6.2 Salary prediction FastAPI endpoint
- [ ] 6.3 Demand forecasting model (Prophet) — training pipeline
- [ ] 6.4 Demand forecasting FastAPI endpoint
- [ ] 6.5 Resume matcher — skill extraction + FAISS index
- [ ] 6.6 Resume matcher FastAPI endpoint
- [ ] 6.7 AI Career Coach — RAG pipeline with ChromaDB
- [ ] 6.8 AI Career Coach FastAPI endpoint

## Phase 7: Frontend

- [ ] 7.1 Auth pages: Login, Register
- [ ] 7.2 Dashboard page with skill demand charts
- [ ] 7.3 Jobs search page with filters
- [ ] 7.4 Job detail page
- [ ] 7.5 Analytics page (salary, trends, locations)
- [ ] 7.6 Resume Matcher page (file upload + score display)
- [ ] 7.7 AI Career Coach chat page
- [ ] 7.8 Salary predictor page
- [ ] 7.9 Reports page (download CSV/PDF)
- [ ] 7.10 Admin panel (users, pipeline, logs)

## Phase 8: DevOps & Cloud

- [ ] 8.1 Dockerfiles for Spring Boot, Next.js, Python ML services
- [ ] 8.2 Docker Compose for full local stack
- [ ] 8.3 Helm charts for Kubernetes deployment
- [ ] 8.4 GitHub Actions CI pipeline (test → build → scan → push)
- [ ] 8.5 GitHub Actions CD pipeline (deploy to AKS)
- [ ] 8.6 Terraform: Azure PostgreSQL, Redis, Blob, Key Vault, ACR, AKS
- [ ] 8.7 Prometheus + Grafana setup with dashboards
- [ ] 8.8 Loki log aggregation
- [ ] 8.9 OpenTelemetry instrumentation

## Phase 9: Security & Finalization

- [ ] 9.1 Azure Key Vault integration for secrets
- [ ] 9.2 Rate limiting on API Gateway
- [ ] 9.3 CORS configuration
- [ ] 9.4 Security headers (CSP, HSTS, X-Frame-Options)
- [ ] 9.5 SonarQube code quality gate
- [ ] 9.6 Trivy container vulnerability scanning
- [ ] 9.7 Full Swagger/OpenAPI documentation review
- [ ] 9.8 End-to-end integration tests
