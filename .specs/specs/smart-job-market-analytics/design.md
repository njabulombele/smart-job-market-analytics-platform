# Smart Job Market Analytics Platform — Technical Design

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────┐
│              Frontend (Next.js / React)                     │
│   Dashboard | Search | AI Chat | Reports | Admin Panel      │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST / WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│           API Gateway (Spring Boot — port 8080)             │
│              JWT Auth | Rate Limiting | Routing             │
└────────┬────────────┬────────────────┬───────────────────────┘
         │            │                │
┌────────▼──┐  ┌──────▼─────┐  ┌──────▼──────┐
│  User API │  │  Job API   │  │   AI API    │
│  /api/v1/ │  │  /api/v1/  │  │  /api/v1/   │
│  users    │  │  jobs      │  │  ai         │
└────────┬──┘  └──────┬─────┘  └──────┬──────┘
         └────────────┴────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              PostgreSQL (port 5432)                         │
│   Users | Jobs | Companies | Skills | Salaries | etc.       │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                   Redis Cache                               │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Kafka Event Stream                             │
│          job.collected | job.processed | alerts             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│           Data Pipeline (Python / Airflow)                  │
│   Collect → Clean → Blob Storage → Spark → Warehouse        │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│         Data Warehouse (DuckDB / Azure Synapse)             │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│           Machine Learning Services (Python)                │
│   Salary Predictor | Demand Forecaster | Resume Matcher     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Power BI / Grafana Dashboards                  │
└─────────────────────────────────────────────────────────────┘
```

## 2. Component Breakdown

### 2.1 Frontend (Next.js 14 + React 18)
- **Pages:** `/login`, `/register`, `/dashboard`, `/jobs`, `/analytics`, `/ai-coach`, `/resume-match`, `/reports`, `/admin`
- **State management:** Zustand
- **HTTP client:** Axios with JWT interceptors
- **Charts:** Recharts / Chart.js
- **UI:** Tailwind CSS + shadcn/ui

### 2.2 Backend (Spring Boot 3, Java 21)
- **Modules:** `user-service`, `job-service`, `ai-service`, `analytics-service`
- **Security:** Spring Security + JWT (access token 15min, refresh token 7d)
- **Caching:** Spring Cache + Redis
- **Docs:** SpringDoc OpenAPI 3 (Swagger UI at `/swagger-ui.html`)
- **Messaging:** Spring Kafka

### 2.3 Data Pipeline (Python / Airflow)
- **DAGs:** `daily_job_collector`, `data_transformer`, `ml_trainer`
- **Sources:** LinkedIn (via Jsearch RapidAPI), Indeed, Adzuna APIs
- **Storage:** Azure Blob Storage (raw JSON) → DuckDB (warehouse)

### 2.4 ML Services (Python)
- **salary_predictor:** XGBoost / LightGBM
- **demand_forecaster:** Prophet + ARIMA
- **resume_matcher:** FAISS + Sentence Transformers
- **career_coach:** RAG pipeline with ChromaDB + OpenAI

## 3. Database Schema

```sql
-- Users
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255),
    role        VARCHAR(50) DEFAULT 'USER',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) UNIQUE NOT NULL,
    industry    VARCHAR(100),
    size        VARCHAR(50),
    website     VARCHAR(255),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Locations
CREATE TABLE locations (
    id          BIGSERIAL PRIMARY KEY,
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(100),
    country     VARCHAR(100) NOT NULL,
    latitude    DECIMAL(9,6),
    longitude   DECIMAL(9,6)
);

-- Skills
CREATE TABLE skills (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    category    VARCHAR(100),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE jobs (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    company_id      BIGINT REFERENCES companies(id),
    location_id     BIGINT REFERENCES locations(id),
    salary_min      DECIMAL(12,2),
    salary_max      DECIMAL(12,2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    job_type        VARCHAR(50),
    experience_level VARCHAR(50),
    remote_type     VARCHAR(50),
    source_url      VARCHAR(500),
    source_name     VARCHAR(100),
    posted_at       TIMESTAMPTZ,
    collected_at    TIMESTAMPTZ DEFAULT NOW(),
    is_active       BOOLEAN DEFAULT TRUE
);

-- Job Skills (many-to-many)
CREATE TABLE job_skills (
    job_id      BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id    BIGINT REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

-- Salaries
CREATE TABLE salaries (
    id              BIGSERIAL PRIMARY KEY,
    job_id          BIGINT REFERENCES jobs(id),
    skill_id        BIGINT REFERENCES skills(id),
    location_id     BIGINT REFERENCES locations(id),
    experience_years INT,
    salary_amount   DECIMAL(12,2),
    currency        VARCHAR(10) DEFAULT 'USD',
    year            INT,
    month           INT,
    source          VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE applications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id),
    job_id      BIGINT REFERENCES jobs(id),
    status      VARCHAR(50) DEFAULT 'SAVED',
    applied_at  TIMESTAMPTZ,
    notes       TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Predictions
CREATE TABLE predictions (
    id              BIGSERIAL PRIMARY KEY,
    skill_id        BIGINT REFERENCES skills(id),
    location_id     BIGINT REFERENCES locations(id),
    prediction_type VARCHAR(100),
    predicted_value DECIMAL(15,4),
    confidence      DECIMAL(5,4),
    period_start    DATE,
    period_end      DATE,
    model_version   VARCHAR(50),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Embeddings
CREATE TABLE embeddings (
    id              BIGSERIAL PRIMARY KEY,
    entity_type     VARCHAR(100) NOT NULL,
    entity_id       BIGINT NOT NULL,
    vector          BYTEA,
    model_name      VARCHAR(100),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Logs
CREATE TABLE logs (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT REFERENCES users(id),
    action      VARCHAR(255),
    entity_type VARCHAR(100),
    entity_id   BIGINT,
    details     JSONB,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

## 4. API Contracts

### 4.1 Authentication
```
POST /api/v1/auth/register
POST /api/v1/auth/login       → { accessToken, refreshToken }
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### 4.2 Jobs
```
GET  /api/v1/jobs             → paginated list (filter: skill, city, company, salary, remote)
GET  /api/v1/jobs/{id}
GET  /api/v1/jobs/search?q=   → full-text search
GET  /api/v1/jobs/trending    → top jobs by views/applications
```

### 4.3 Analytics
```
GET  /api/v1/analytics/skills/top        → top N skills with job count
GET  /api/v1/analytics/locations/top     → cities with most jobs
GET  /api/v1/analytics/salary?skill=&city= → salary stats
GET  /api/v1/analytics/trends?skill=     → historical demand over time
```

### 4.4 AI
```
POST /api/v1/ai/resume/match             → { resumeFile, jobId } → score + gaps
POST /api/v1/ai/salary/predict           → { skills[], city, experience } → salary range
POST /api/v1/ai/demand/forecast          → { skill, months } → forecast data
POST /api/v1/ai/coach/chat               → { message, sessionId } → reply
```

### 4.5 Admin
```
GET  /api/v1/admin/users
PUT  /api/v1/admin/users/{id}/role
GET  /api/v1/admin/pipeline/status
POST /api/v1/admin/pipeline/trigger
GET  /api/v1/admin/logs
```

## 5. Low-Level Design

### 5.1 JWT Authentication Flow
```java
// JwtService.java
public class JwtService {
    String generateAccessToken(UserDetails user);   // 15 min expiry
    String generateRefreshToken(UserDetails user);  // 7 day expiry
    String extractUsername(String token);
    boolean isTokenValid(String token, UserDetails user);
    Claims extractAllClaims(String token);
}

// JwtAuthFilter extends OncePerRequestFilter
protected void doFilterInternal(request, response, chain) {
    1. Extract Authorization header
    2. Parse "Bearer <token>"
    3. extractUsername(token)
    4. Load UserDetails from DB
    5. Validate token
    6. Set SecurityContextHolder authentication
    7. chain.doFilter()
}
```

### 5.2 Job Search with Caching
```java
// JobService.java
@Cacheable(value = "jobs", key = "#filter.hashCode()")
public Page<JobDto> searchJobs(JobFilter filter, Pageable pageable) {
    Specification<Job> spec = JobSpecification.build(filter);
    return jobRepository.findAll(spec, pageable)
                        .map(jobMapper::toDto);
}

// JobSpecification.java
public static Specification<Job> build(JobFilter f) {
    return Specification
        .where(hasSkill(f.getSkill()))
        .and(hasCity(f.getCity()))
        .and(hasSalaryBetween(f.getMinSalary(), f.getMaxSalary()))
        .and(isRemote(f.getRemote()))
        .and(isActive());
}
```

### 5.3 Salary Prediction (Python ML)
```python
class SalaryPredictor:
    def __init__(self):
        self.model = None          # LightGBM model
        self.encoder = None        # LabelEncoder for categoricals
        self.scaler = None         # StandardScaler

    def preprocess(self, features: dict) -> np.ndarray:
        # encode city, company; scale experience
        ...

    def predict(self, experience: int, skills: list[str],
                city: str, company: str) -> dict:
        X = self.preprocess({...})
        pred = self.model.predict(X)
        return {
            "predicted_salary": float(pred[0]),
            "range_low": float(pred[0] * 0.85),
            "range_high": float(pred[0] * 1.15),
            "confidence": 0.87
        }
```

### 5.4 Resume Matcher
```python
class ResumeMatcher:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.index = faiss.IndexFlatL2(384)   # 384-dim embeddings

    def extract_skills(self, resume_text: str) -> list[str]:
        # NLP entity extraction (spaCy or regex against skill list)
        ...

    def match(self, resume_text: str, job_description: str) -> dict:
        resume_skills = self.extract_skills(resume_text)
        job_skills    = self.extract_skills(job_description)
        
        resume_emb = self.model.encode(resume_skills)
        job_emb    = self.model.encode(job_skills)
        
        score = cosine_similarity(resume_emb.mean(0), job_emb.mean(0))
        missing = [s for s in job_skills if s not in resume_skills]
        
        return {"score": float(score), "missing_skills": missing}
```

### 5.5 Airflow DAG — Daily Job Collection
```python
with DAG('daily_job_collector',
         schedule_interval='0 6 * * *',   # 6am daily
         start_date=datetime(2024, 1, 1),
         catchup=False) as dag:

    collect = PythonOperator(task_id='collect_jobs',
                              python_callable=collect_from_apis)
    clean   = PythonOperator(task_id='clean_data',
                              python_callable=clean_and_validate)
    store   = PythonOperator(task_id='store_raw',
                              python_callable=upload_to_blob)
    transform = SparkSubmitOperator(task_id='spark_transform',
                                     application='jobs/transform.py')
    load    = PythonOperator(task_id='load_warehouse',
                              python_callable=load_to_duckdb)
    report  = PythonOperator(task_id='generate_reports',
                              python_callable=generate_daily_reports)

    collect >> clean >> store >> transform >> load >> report
```

### 5.6 Kafka Topics
```
job.raw.collected       - raw job JSON from scrapers
job.processed           - cleaned, enriched job records
skill.demand.updated    - skill frequency updates
salary.updated          - new salary data points
pipeline.alerts         - pipeline failures / SLA breaches
```

## 6. Infrastructure (Azure)

| Component | Azure Service |
|-----------|--------------|
| Frontend | Azure Static Web Apps / App Service |
| Backend API | Azure App Service (AKS) |
| Database | Azure Database for PostgreSQL Flexible Server |
| Cache | Azure Cache for Redis |
| Blob Storage | Azure Blob Storage |
| Secrets | Azure Key Vault |
| Monitoring | Azure Monitor + Application Insights |
| Container Registry | Azure Container Registry (ACR) |
| Kafka | Azure Event Hubs (Kafka-compatible) |
| ML | Azure ML / self-hosted Python services |

## 7. CI/CD Pipeline (GitHub Actions)

```yaml
# Triggered on PR merge to main
jobs:
  test     → mvn test (Java) + pytest (Python)
  build    → docker build + tag with SHA
  scan     → SonarQube + Trivy (container scan)
  push     → ACR push
  deploy   → helm upgrade --install on AKS
  smoke    → curl health endpoints
```

## 8. Security Design

- All secrets stored in Azure Key Vault, injected as env vars via AKS secrets
- JWT access tokens: HS256, 15-minute TTL
- Refresh tokens: stored in Redis with 7-day TTL
- RBAC roles: `ROLE_USER`, `ROLE_ANALYST`, `ROLE_ADMIN`
- HTTPS enforced via ingress TLS (cert-manager + Let's Encrypt)
- OWASP Top 10 mitigations: input validation, parameterized queries, CSP headers
- Rate limiting: 100 req/min per IP on public endpoints

## 9. Monitoring Stack

- **Prometheus** scrapes Spring Boot Actuator `/actuator/prometheus`
- **Grafana** dashboards: API latency, error rate, job pipeline throughput
- **Loki** aggregates logs from all pods
- **OpenTelemetry** traces distributed requests across services
- **Alerts:** PagerDuty integration for P1 incidents
