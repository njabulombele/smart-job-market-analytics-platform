# Smart Job Market Analytics Platform — Requirements

## Functional Requirements

### User Management
- FR-001: Users can register with email and password
- FR-002: Users can log in and receive JWT access + refresh tokens
- FR-003: Users have roles: USER, ANALYST, ADMIN
- FR-004: Admins can manage user accounts and roles

### Job Search & Discovery
- FR-010: Users can search jobs by keyword, skill, city, salary range, remote type
- FR-011: Jobs display title, company, location, salary range, skills required
- FR-012: Users can save jobs to their personal list
- FR-013: Users can track application status

### Analytics
- FR-020: Dashboard shows top skills in demand (by job count)
- FR-021: Dashboard shows top hiring cities
- FR-022: Salary statistics by skill, city, experience level
- FR-023: Technology demand trends over time (charts)
- FR-024: Exportable reports (CSV / PDF)

### AI Features
- FR-030: Resume Matcher — upload PDF CV, get match score vs a job posting
- FR-031: Resume Matcher — identifies missing skills with explanations
- FR-032: Salary Predictor — input experience, skills, city → predicted salary range
- FR-033: Demand Forecaster — forecast job demand for a skill over next 6 months
- FR-034: AI Career Coach chatbot — answers career questions using RAG

### Data Pipeline
- FR-040: Daily automated collection of job postings from at least 2 sources
- FR-041: Raw data stored in blob storage before transformation
- FR-042: Cleaned data loaded into data warehouse
- FR-043: Pipeline runs at 6am daily; failures trigger alerts

### Admin Panel
- FR-050: View all users
- FR-051: View pipeline run history and status
- FR-052: Manually trigger pipeline runs
- FR-053: View system audit logs

## Non-Functional Requirements

- NFR-001: API response time < 500ms for search queries (p95)
- NFR-002: System supports 1,000 concurrent users
- NFR-003: 99.9% uptime SLA
- NFR-004: All data encrypted at rest and in transit
- NFR-005: JWT tokens expire per security policy (15min access, 7d refresh)
- NFR-006: OWASP Top 10 mitigations applied
- NFR-007: Full API documentation via Swagger/OpenAPI
- NFR-008: Horizontal scaling via Kubernetes
