CREATE TABLE IF NOT EXISTS users (
    id          BIGSERIAL PRIMARY KEY,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255),
    role        VARCHAR(50) NOT NULL DEFAULT 'USER',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS companies (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(255) UNIQUE NOT NULL,
    industry    VARCHAR(100),
    size        VARCHAR(50),
    website     VARCHAR(255),
    logo_url    VARCHAR(500),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
    id          BIGSERIAL PRIMARY KEY,
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(100),
    country     VARCHAR(100) NOT NULL DEFAULT 'US',
    latitude    DECIMAL(9,6),
    longitude   DECIMAL(9,6),
    UNIQUE (city, country)
);

CREATE TABLE IF NOT EXISTS skills (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) UNIQUE NOT NULL,
    category    VARCHAR(100),
    aliases     TEXT[],
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
    id               BIGSERIAL PRIMARY KEY,
    title            VARCHAR(255) NOT NULL,
    description      TEXT,
    company_id       BIGINT REFERENCES companies(id) ON DELETE SET NULL,
    location_id      BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    salary_min       DECIMAL(12,2),
    salary_max       DECIMAL(12,2),
    salary_currency  VARCHAR(10) DEFAULT 'USD',
    job_type         VARCHAR(50),
    experience_level VARCHAR(50),
    remote_type      VARCHAR(50),
    source_url       VARCHAR(500),
    source_name      VARCHAR(100),
    external_id      VARCHAR(255),
    posted_at        TIMESTAMPTZ,
    collected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    view_count       INT NOT NULL DEFAULT 0,
    UNIQUE (source_name, external_id)
);

CREATE TABLE IF NOT EXISTS job_skills (
    job_id   BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    PRIMARY KEY (job_id, skill_id)
);

CREATE TABLE IF NOT EXISTS salaries (
    id              BIGSERIAL PRIMARY KEY,
    job_id          BIGINT REFERENCES jobs(id) ON DELETE SET NULL,
    skill_id        BIGINT REFERENCES skills(id) ON DELETE SET NULL,
    location_id     BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    experience_years INT,
    salary_amount   DECIMAL(12,2) NOT NULL,
    currency        VARCHAR(10) NOT NULL DEFAULT 'USD',
    year            INT NOT NULL,
    month           INT,
    source          VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS applications (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id      BIGINT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    status      VARCHAR(50) NOT NULL DEFAULT 'SAVED',
    applied_at  TIMESTAMPTZ,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, job_id)
);

CREATE TABLE IF NOT EXISTS predictions (
    id               BIGSERIAL PRIMARY KEY,
    skill_id         BIGINT REFERENCES skills(id) ON DELETE SET NULL,
    location_id      BIGINT REFERENCES locations(id) ON DELETE SET NULL,
    prediction_type  VARCHAR(100) NOT NULL,
    predicted_value  DECIMAL(15,4),
    confidence       DECIMAL(5,4),
    period_start     DATE,
    period_end       DATE,
    model_version    VARCHAR(50),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS embeddings (
    id           BIGSERIAL PRIMARY KEY,
    entity_type  VARCHAR(100) NOT NULL,
    entity_id    BIGINT NOT NULL,
    model_name   VARCHAR(100),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS logs (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action       VARCHAR(255) NOT NULL,
    entity_type  VARCHAR(100),
    entity_id    BIGINT,
    details      JSONB,
    ip_address   VARCHAR(45),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_jobs_company     ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_location    ON jobs(location_id);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at   ON jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_active      ON jobs(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_job_skills_skill ON job_skills(skill_id);
CREATE INDEX IF NOT EXISTS idx_salaries_skill   ON salaries(skill_id);
CREATE INDEX IF NOT EXISTS idx_salaries_loc     ON salaries(location_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user        ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created     ON logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_fts         ON jobs USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));
