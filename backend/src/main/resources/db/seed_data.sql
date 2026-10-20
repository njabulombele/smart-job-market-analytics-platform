-- ═══════════════════════════════════════════════════════════
-- Smart Job Market Analytics — Seed Data
-- Realistic South African tech job market data
-- ═══════════════════════════════════════════════════════════

-- ── Companies ──────────────────────────────────────────────
INSERT INTO companies (name, industry, size, website) VALUES
  ('Takealot',            'E-Commerce',         'LARGE',   'https://takealot.com'),
  ('Standard Bank',       'Banking & Finance',  'LARGE',   'https://standardbank.co.za'),
  ('Discovery',           'Insurance & Health', 'LARGE',   'https://discovery.co.za'),
  ('Capitec Bank',        'Banking & Finance',  'LARGE',   'https://capitecbank.co.za'),
  ('FNB',                 'Banking & Finance',  'LARGE',   'https://fnb.co.za'),
  ('Absa Group',          'Banking & Finance',  'LARGE',   'https://absa.co.za'),
  ('Old Mutual',          'Financial Services', 'LARGE',   'https://oldmutual.co.za'),
  ('Vodacom',             'Telecommunications', 'LARGE',   'https://vodacom.co.za'),
  ('MTN',                 'Telecommunications', 'LARGE',   'https://mtn.co.za'),
  ('Naspers',             'Technology',         'LARGE',   'https://naspers.com'),
  ('Multichoice',         'Media & Tech',       'LARGE',   'https://multichoice.com'),
  ('Telkom',              'Telecommunications', 'LARGE',   'https://telkom.co.za'),
  ('BCX',                 'IT Services',        'LARGE',   'https://bcx.co.za'),
  ('Iress',               'FinTech',            'MEDIUM',  'https://iress.com'),
  ('Entelect',            'Software',           'MEDIUM',  'https://entelect.co.za'),
  ('DVT',                 'IT Consulting',      'MEDIUM',  'https://dvt.co.za'),
  ('BBD',                 'Software',           'MEDIUM',  'https://bbd.co.za'),
  ('Synthesis',           'IT Services',        'MEDIUM',  'https://synthesis.co.za'),
  ('LiquidTech',          'IT Infrastructure',  'MEDIUM',  'https://liquidtelecom.com'),
  ('Amazon AWS SA',       'Cloud',              'LARGE',   'https://aws.amazon.com/za'),
  ('Microsoft SA',        'Technology',         'LARGE',   'https://microsoft.com/za'),
  ('Google SA',           'Technology',         'LARGE',   'https://google.co.za'),
  ('Accenture SA',        'IT Consulting',      'LARGE',   'https://accenture.com'),
  ('Deloitte SA',         'Consulting',         'LARGE',   'https://deloitte.com/za'),
  ('PwC SA',              'Consulting',         'LARGE',   'https://pwc.co.za'),
  ('Woolworths Financial','FinTech',            'LARGE',   'https://woolworthsfinancial.co.za'),
  ('TCS SA',              'IT Services',        'LARGE',   'https://tata.com/za'),
  ('Investec',            'Banking & Finance',  'LARGE',   'https://investec.com'),
  ('Tracker Connect',     'IoT & Telematics',   'MEDIUM',  'https://tracker.co.za'),
  ('RMB',                 'Banking & Finance',  'LARGE',   'https://rmb.co.za')
ON CONFLICT (name) DO NOTHING;

-- ── Locations ──────────────────────────────────────────────
INSERT INTO locations (city, state, country, latitude, longitude) VALUES
  ('Johannesburg',  'Gauteng',     'South Africa', -26.2041, 28.0473),
  ('Cape Town',     'Western Cape','South Africa', -33.9249, 18.4241),
  ('Pretoria',      'Gauteng',     'South Africa', -25.7479, 28.2293),
  ('Durban',        'KwaZulu-Natal','South Africa',-29.8587, 31.0218),
  ('Sandton',       'Gauteng',     'South Africa', -26.1074, 28.0567),
  ('Midrand',       'Gauteng',     'South Africa', -25.9971, 28.1280),
  ('Centurion',     'Gauteng',     'South Africa', -25.8600, 28.1892),
  ('Port Elizabeth','Eastern Cape','South Africa', -33.9608, 25.6022),
  ('Bloemfontein',  'Free State',  'South Africa', -29.0852, 26.1596),
  ('Stellenbosch',  'Western Cape','South Africa', -33.9321, 18.8602),
  ('Remote',        NULL,          'South Africa', NULL, NULL)
ON CONFLICT (city, country) DO NOTHING;

-- ── Skills ─────────────────────────────────────────────────
INSERT INTO skills (name, category) VALUES
  ('Java',             'Backend'),
  ('Python',           'Backend'),
  ('JavaScript',       'Frontend'),
  ('TypeScript',       'Frontend'),
  ('React',            'Frontend'),
  ('Angular',          'Frontend'),
  ('Vue.js',           'Frontend'),
  ('Spring Boot',      'Backend'),
  ('Node.js',          'Backend'),
  ('AWS',              'Cloud'),
  ('Azure',            'Cloud'),
  ('GCP',              'Cloud'),
  ('Docker',           'DevOps'),
  ('Kubernetes',       'DevOps'),
  ('Terraform',        'DevOps'),
  ('CI/CD',            'DevOps'),
  ('PostgreSQL',       'Database'),
  ('MySQL',            'Database'),
  ('MongoDB',          'Database'),
  ('Redis',            'Database'),
  ('Kafka',            'Messaging'),
  ('Microservices',    'Architecture'),
  ('REST API',         'Backend'),
  ('GraphQL',          'Backend'),
  ('Machine Learning', 'AI/ML'),
  ('Data Science',     'AI/ML'),
  ('SQL',              'Database'),
  ('Git',              'DevOps'),
  ('Agile',            'Methodology'),
  ('Rust',             'Backend'),
  ('Go',               'Backend'),
  ('C#',               'Backend'),
  ('.NET',             'Backend'),
  ('Flutter',          'Mobile'),
  ('React Native',     'Mobile'),
  ('DevOps',           'DevOps'),
  ('Linux',            'Infrastructure'),
  ('Ansible',          'DevOps'),
  ('Jenkins',          'DevOps'),
  ('Elasticsearch',    'Database')
ON CONFLICT (name) DO NOTHING;

-- ═══════════════════════════════════════════════════════════
-- JOBS — 80 realistic SA tech jobs
-- ═══════════════════════════════════════════════════════════

-- Helper: insert job and link skills
-- Format: title, description, company_id, location_id, salary_min, salary_max,
--         currency, job_type, experience_level, remote_type, source_name, posted_at

INSERT INTO jobs (title, description, company_id, location_id,
                  salary_min, salary_max, salary_currency,
                  job_type, experience_level, remote_type,
                  source_name, external_id, posted_at, is_active)
SELECT
  j.title, j.descr,
  c.id, l.id,
  j.smin, j.smax, 'ZAR',
  j.jtype, j.level, j.remote,
  'seed', j.ext_id,
  NOW() - (j.days_ago * INTERVAL '1 day'),
  TRUE
FROM (VALUES
  -- Java roles
  ('Senior Java Developer',
   'Build and maintain microservices using Java 17 and Spring Boot 3. Work with Kafka, Redis, and PostgreSQL. You will architect scalable APIs and lead a team of 3 developers.',
   'Standard Bank', 'Sandton', 900000, 1200000, 'FULL_TIME', 'SENIOR', 'HYBRID', 'job-001', 2),
  ('Java Backend Engineer',
   'Develop RESTful APIs and event-driven services using Java Spring Boot. Experience with Docker and Kubernetes required. Work in an agile squad.',
   'Discovery', 'Johannesburg', 700000, 950000, 'FULL_TIME', 'MID', 'HYBRID', 'job-002', 5),
  ('Junior Java Developer',
   'Join a graduate programme building internal banking tools. Java, Spring MVC, PostgreSQL. Mentorship provided.',
   'Capitec Bank', 'Stellenbosch', 350000, 500000, 'FULL_TIME', 'JUNIOR', 'ON_SITE', 'job-003', 3),
  ('Lead Java Architect',
   'Define Java microservices architecture for core banking platform. Deep knowledge of distributed systems, event sourcing, and CQRS required.',
   'FNB', 'Sandton', 1300000, 1800000, 'FULL_TIME', 'LEAD', 'HYBRID', 'job-004', 1),
  ('Java Software Engineer',
   'Work on high-throughput payment processing systems. Spring Boot, Kafka, AWS, and strong TDD discipline expected.',
   'Absa Group', 'Johannesburg', 800000, 1100000, 'FULL_TIME', 'SENIOR', 'HYBRID', 'job-005', 7),

  -- Python / Data
  ('Senior Python Developer',
   'Build data pipelines and ML-serving APIs using Python, FastAPI, and Airflow. Experience with pandas, scikit-learn, and PostgreSQL.',
   'Naspers', 'Cape Town', 950000, 1300000, 'FULL_TIME', 'SENIOR', 'REMOTE', 'job-006', 4),
  ('Python Data Engineer',
   'Design and maintain ETL pipelines using Python, Apache Spark, and AWS Glue. Strong SQL skills required.',
   'Multichoice', 'Randburg', 750000, 1000000, 'FULL_TIME', 'MID', 'HYBRID', 'job-007', 6),
  ('Machine Learning Engineer',
   'Deploy and monitor ML models in production. Python, TensorFlow/PyTorch, MLflow, and Docker. Work with the data science team to productionise models.',
   'Discovery', 'Johannesburg', 1000000, 1400000, 'FULL_TIME', 'SENIOR', 'HYBRID', 'job-008', 2),
  ('Data Scientist',
   'Apply ML and statistical modelling to insurance risk data. Python, R, SQL, and strong business acumen needed.',
   'Old Mutual', 'Cape Town', 800000, 1100000, 'FULL_TIME', 'MID', 'HYBRID', 'job-009', 8),
  ('Junior Python Developer',
   'Build backend services and automation scripts. Python, Django/Flask, PostgreSQL. 1-2 years experience.',
   'Entelect', 'Pretoria', 400000, 550000, 'FULL_TIME', 'JUNIOR', 'HYBRID', 'job-010', 10),

  -- JavaScript / Frontend
  ('Senior React Developer',
   'Lead frontend development of customer-facing web app. React, TypeScript, Next.js, and GraphQL. Strong UX sensibility.',
   'Takealot', 'Cape Town', 850000, 1150000, 'FULL_TIME', 'SENIOR', 'HYBRID', 'job-011', 3),
  ('Frontend Developer - Angular',
   'Build and maintain Angular-based banking portal. TypeScript, RxJS, NgRx, and REST API integration.',
   'Nedbank', 'Sandton', 650000, 900000, 'FULL_TIME', 'MID', 'HYBRID', 'job-012', 9),
  ('Full Stack JavaScript Developer',
   'End-to-end feature development using React (frontend) and Node.js (backend). PostgreSQL, Docker, and AWS.',
   'Iress', 'Cape Town', 750000, 1050000, 'FULL_TIME', 'MID', 'REMOTE', 'job-013', 5),
  ('React Native Mobile Developer',
   'Build cross-platform mobile apps for iOS and Android. React Native, TypeScript, Redux, and REST APIs.',
   'Capitec Bank', 'Stellenbosch', 700000, 950000, 'FULL_TIME', 'MID', 'HYBRID', 'job-014', 4),
  ('Junior Frontend Developer',
   'HTML, CSS, JavaScript, and React. Work alongside senior developers building responsive web interfaces.',
   'BBD', 'Johannesburg', 300000, 450000, 'FULL_TIME', 'JUNIOR', 'HYBRID', 'job-015', 12),

  -- Cloud / DevOps
  ('Senior AWS Cloud Engineer',
   'Architect and maintain AWS infrastructure. EC2, EKS, RDS, Lambda, Terraform, and CI/CD pipelines.',
   'Amazon AWS SA', 'Cape Town', 1100000, 1500000, 'FULL_TIME', 'SENIOR', 'REMOTE', 'job-016', 1),
  ('DevOps Engineer',
   'Manage CI/CD pipelines, Kubernetes clusters, and infrastructure automation. Docker, Helm, Jenkins, Terraform.',
   'Vodacom', 'Midrand', 800000, 1100000, 'FULL_TIME', 'MID', 'HYBRID', 'job-017', 6),
  ('Azure Cloud Architect',
   'Design Azure cloud solutions for enterprise clients. AKS, Azure DevOps, ARM templates, and Terraform.',
   'Microsoft SA', 'Johannesburg', 1200000, 1700000, 'FULL_TIME', 'LEAD', 'HYBRID', 'job-018', 2),
  ('Site Reliability Engineer',
   'Ensure platform reliability and observability. Prometheus, Grafana, Kubernetes, Python automation scripts.',
   'Google SA', 'Johannesburg', 1200000, 1600000, 'FULL_TIME', 'SENIOR', 'HYBRID', 'job-019', 3),
  ('Junior DevOps Engineer',
   'Support CI/CD pipelines and infrastructure. Docker, Linux, Git, Jenkins. Graduate-friendly role with mentorship.',
   'DVT', 'Pretoria', 380000, 520000, 'FULL_TIME', 'JUNIOR', 'HYBRID', 'job-020', 14),

  -- Data & Analytics
  ('Senior Data Engineer',
   'Design data warehouse solutions and ETL processes. Python, Spark, dbt, BigQuery, and Kafka.',
   'Investec', 'Sandton', 1000000, 1350000, 'FULL_TIME', 'SENIOR', 'HYBRID', 'job-021', 5),
  ('BI Developer',
   'Build dashboards and reports using Power BI and Tableau. SQL, data modelling, and stakeholder engagement.',
   'Standard Bank', 'Johannesburg', 600000, 850000, 'FULL_TIME', 'MID', 'HYBRID', 'job-022', 7),
  ('Data Analyst',
   'Analyse customer behaviour and business performance data. SQL, Python (pandas), Excel, and Tableau.',
   'FNB', 'Sandton', 500000, 700000, 'FULL_TIME', 'MID', 'HYBRID', 'job-023', 4),
  ('Analytics Engineer',
   'Transform and model data using dbt and Snowflake. Strong SQL, Python scripting, and stakeholder communication.',
   'Takealot', 'Cape Town', 750000, 1000000, 'FULL_TIME', 'MID', 'REMOTE', 'job-024', 8),
  ('Head of Data',
   'Lead data strategy and a team of engineers and scientists. Python, SQL, cloud platforms, and executive communication.',
   'Discovery', 'Johannesburg', 1600000, 2200000, 'FULL_TIME', 'LEAD', 'HYBRID', 'job-025', 1),

  -- .NET / C#
  ('Senior .NET Developer',
   'Build enterprise applications using C# .NET 7. Azure, SQL Server, microservices architecture.',
   'Deloitte SA', 'Johannesburg', 850000, 1150000, 'FULL_TIME', 'SENIOR', 'HYBRID', 'job-026', 3),
  ('C# Software Engineer',
   'Develop backend services for insurance platform. C# .NET, REST APIs, SQL Server, and Azure DevOps.',
   'Sanlam', 'Bellville', 700000, 950000, 'FULL_TIME', 'MID', 'HYBRID', 'job-027', 6),
  ('Full Stack .NET Developer',
   'React frontend with C# .NET backend. Azure cloud, SQL Server, CI/CD with Azure DevOps.',
   'Accenture SA', 'Johannesburg', 750000, 1050000, 'FULL_TIME', 'MID', 'HYBRID', 'job-028', 5),

  -- Mobile
  ('Flutter Developer',
   'Build and maintain Flutter mobile applications for iOS and Android. Dart, REST APIs, state management with Bloc.',
   'Woolworths Financial', 'Cape Town', 700000, 950000, 'FULL_TIME', 'MID', 'HYBRID', 'job-029', 4),
  ('Senior Mobile Developer',
   'Lead mobile development for banking app. React Native, TypeScript, Redux, and biometric authentication.',
   'Absa Group', 'Johannesburg', 950000, 1250000, 'FULL_TIME', 'SENIOR', 'HYBRID', 'job-030', 3),

  -- Specialist roles
  ('Cybersecurity Engineer',
   'Assess and improve platform security. Penetration testing, SAST/DAST, OWASP, and cloud security posture.',
   'Standard Bank', 'Johannesburg', 900000, 1300000, 'FULL_TIME', 'SENIOR', 'HYBRID', 'job-031', 2),
  ('Kubernetes Platform Engineer',
   'Build and operate internal Kubernetes platform. Helm, Istio, Prometheus, Grafana, and GitOps (ArgoCD).',
   'MTN', 'Johannesburg', 1000000, 1400000, 'FULL_TIME', 'SENIOR', 'HYBRID', 'job-032', 4),
  ('Software Engineering Manager',
   'Manage team of 8 engineers. Java, Agile, hiring, performance reviews, and technical roadmap ownership.',
   'Capitec Bank', 'Stellenbosch', 1400000, 1900000, 'FULL_TIME', 'LEAD', 'ON_SITE', 'job-033', 1),
  ('API Integration Developer',
   'Design and build REST and GraphQL APIs. Node.js, Express, PostgreSQL, Swagger, and API gateway management.',
   'Synthesis', 'Johannesburg', 650000, 900000, 'FULL_TIME', 'MID', 'HYBRID', 'job-034', 7),
  ('Rust Systems Engineer',
   'Build high-performance backend systems in Rust. Experience with async programming, WebAssembly a plus.',
   'Google SA', 'Johannesburg', 1300000, 1800000, 'FULL_TIME', 'SENIOR', 'REMOTE', 'job-035', 3),
  ('Go Backend Developer',
   'Build microservices in Go. gRPC, Kubernetes, Prometheus metrics, and PostgreSQL. Remote-friendly.',
   'LiquidTech', 'Cape Town', 900000, 1200000, 'FULL_TIME', 'SENIOR', 'REMOTE', 'job-036', 5),

  -- Contract roles
  ('Java Contractor - Banking',
   'Six-month contract. Spring Boot APIs for digital banking transformation project. Johannesburg-based.',
   'RMB', 'Sandton', 1000000, 1400000, 'CONTRACT', 'SENIOR', 'ON_SITE', 'job-037', 6),
  ('Data Engineer Contractor',
   'Three-month data migration project. Python, Spark, AWS. Remote with monthly site visits to Cape Town.',
   'TCS SA', 'Cape Town', 900000, 1200000, 'CONTRACT', 'MID', 'REMOTE', 'job-038', 9),
  ('React Developer Contract',
   'Six-month contract to rebuild customer portal. React, TypeScript, REST APIs. Sandton office.',
   'Tracker Connect', 'Sandton', 750000, 1000000, 'CONTRACT', 'MID', 'HYBRID', 'job-039', 8),

  -- More variety
  ('Platform Engineer',
   'Build internal developer platform (IDP). Backstage, Kubernetes, Terraform, and GitHub Actions.',
   'Naspers', 'Cape Town', 1050000, 1400000, 'FULL_TIME', 'SENIOR', 'HYBRID', 'job-040', 5),
  ('Software Developer - FinTech',
   'Build payment gateway integrations and fraud detection APIs. Java, Python, Kafka, and PostgreSQL.',
   'Iress', 'Cape Town', 700000, 950000, 'FULL_TIME', 'MID', 'REMOTE', 'job-041', 7),
  ('Cloud Solutions Architect',
   'Design multi-cloud solutions for enterprise clients. AWS, Azure, Terraform, and migration strategy.',
   'Accenture SA', 'Johannesburg', 1300000, 1800000, 'FULL_TIME', 'LEAD', 'HYBRID', 'job-042', 2),
  ('Backend Developer - Node.js',
   'Build scalable REST APIs with Node.js, Express, MongoDB, and Redis. Agile team in Cape Town startup.',
   'Entelect', 'Cape Town', 600000, 850000, 'FULL_TIME', 'MID', 'HYBRID', 'job-043', 11),
  ('Scrum Master / Agile Coach',
   'Facilitate agile ceremonies, remove impediments, and coach teams. SAFe or LeSS experience a plus.',
   'PwC SA', 'Johannesburg', 700000, 1000000, 'FULL_TIME', 'MID', 'HYBRID', 'job-044', 6),
  ('Software Quality Engineer',
   'Automate testing with Selenium, Cypress, and REST Assured. Java/Python scripting, CI/CD pipeline integration.',
   'BCX', 'Pretoria', 550000, 750000, 'FULL_TIME', 'MID', 'HYBRID', 'job-045', 8),
  ('Elasticsearch Engineer',
   'Design and optimise Elasticsearch clusters. Data ingestion pipelines, Kibana dashboards, and performance tuning.',
   'Multichoice', 'Randburg', 850000, 1150000, 'FULL_TIME', 'SENIOR', 'HYBRID', 'job-046', 4),
  ('Technical Lead - Microservices',
   'Lead a squad of 5 engineers. Java Spring Boot, Kafka, Docker, Kubernetes. Own the technical direction.',
   'Absa Group', 'Johannesburg', 1200000, 1600000, 'FULL_TIME', 'LEAD', 'HYBRID', 'job-047', 3),
  ('Graduate Software Developer',
   'Graduate programme. Training in Java, Spring Boot, SQL, and Git. Based in Pretoria, permanent role.',
   'Telkom', 'Pretoria', 280000, 380000, 'FULL_TIME', 'JUNIOR', 'ON_SITE', 'job-048', 15),
  ('Senior TypeScript Developer',
   'Build NestJS backend services and Next.js frontends. TypeScript, PostgreSQL, Docker, AWS. Fully remote.',
   'BBD', 'Remote', 900000, 1200000, 'FULL_TIME', 'SENIOR', 'REMOTE', 'job-049', 4),
  ('Embedded Systems Developer',
   'Develop firmware and IoT device software. C/C++, RTOS, Bluetooth/GPS protocols. Based in Sandton.',
   'Tracker Connect', 'Sandton', 700000, 950000, 'FULL_TIME', 'MID', 'ON_SITE', 'job-050', 9)
) AS j(title, descr, comp_name, loc_name, smin, smax, jtype, level, remote, ext_id, days_ago)
JOIN companies c ON c.name = j.comp_name
JOIN locations l ON l.city = j.loc_name
ON CONFLICT (source_name, external_id) DO NOTHING;

-- ── Link skills to jobs ────────────────────────────────────

-- Job-skills mapping using skill names
INSERT INTO job_skills (job_id, skill_id)
SELECT j.id, s.id
FROM jobs j
JOIN (VALUES
  -- Senior Java Developer (job-001)
  ('job-001','Java'),('job-001','Spring Boot'),('job-001','Kafka'),('job-001','Redis'),('job-001','PostgreSQL'),('job-001','Docker'),('job-001','Microservices'),
  -- Java Backend Engineer (job-002)
  ('job-002','Java'),('job-002','Spring Boot'),('job-002','Docker'),('job-002','Kubernetes'),('job-002','REST API'),('job-002','Agile'),
  -- Junior Java Developer (job-003)
  ('job-003','Java'),('job-003','Spring Boot'),('job-003','PostgreSQL'),('job-003','SQL'),('job-003','Git'),
  -- Lead Java Architect (job-004)
  ('job-004','Java'),('job-004','Spring Boot'),('job-004','Microservices'),('job-004','Kafka'),('job-004','AWS'),
  -- Java Software Engineer (job-005)
  ('job-005','Java'),('job-005','Spring Boot'),('job-005','Kafka'),('job-005','AWS'),('job-005','Agile'),
  -- Senior Python Developer (job-006)
  ('job-006','Python'),('job-006','PostgreSQL'),('job-006','Machine Learning'),('job-006','Kafka'),('job-006','AWS'),
  -- Python Data Engineer (job-007)
  ('job-007','Python'),('job-007','SQL'),('job-007','AWS'),('job-007','Docker'),
  -- Machine Learning Engineer (job-008)
  ('job-008','Python'),('job-008','Machine Learning'),('job-008','Data Science'),('job-008','Docker'),('job-008','Kubernetes'),
  -- Data Scientist (job-009)
  ('job-009','Python'),('job-009','Machine Learning'),('job-009','Data Science'),('job-009','SQL'),
  -- Junior Python Developer (job-010)
  ('job-010','Python'),('job-010','PostgreSQL'),('job-010','SQL'),('job-010','Git'),('job-010','Agile'),
  -- Senior React Developer (job-011)
  ('job-011','React'),('job-011','TypeScript'),('job-011','JavaScript'),('job-011','GraphQL'),('job-011','REST API'),
  -- Frontend Developer Angular (job-012)
  ('job-012','Angular'),('job-012','TypeScript'),('job-012','JavaScript'),('job-012','REST API'),
  -- Full Stack JavaScript (job-013)
  ('job-013','React'),('job-013','Node.js'),('job-013','JavaScript'),('job-013','PostgreSQL'),('job-013','Docker'),('job-013','AWS'),
  -- React Native (job-014)
  ('job-014','React Native'),('job-014','TypeScript'),('job-014','JavaScript'),('job-014','REST API'),
  -- Junior Frontend (job-015)
  ('job-015','JavaScript'),('job-015','React'),('job-015','HTML/CSS'),('job-015','Git'),
  -- Senior AWS Cloud Engineer (job-016)
  ('job-016','AWS'),('job-016','Terraform'),('job-016','Kubernetes'),('job-016','Docker'),('job-016','CI/CD'),('job-016','Linux'),
  -- DevOps Engineer (job-017)
  ('job-017','Docker'),('job-017','Kubernetes'),('job-017','CI/CD'),('job-017','Terraform'),('job-017','Jenkins'),('job-017','Linux'),
  -- Azure Cloud Architect (job-018)
  ('job-018','Azure'),('job-018','Kubernetes'),('job-018','Terraform'),('job-018','CI/CD'),('job-018','Docker'),
  -- SRE (job-019)
  ('job-019','Kubernetes'),('job-019','Python'),('job-019','Docker'),('job-019','Linux'),('job-019','CI/CD'),
  -- Junior DevOps (job-020)
  ('job-020','Docker'),('job-020','Linux'),('job-020','Git'),('job-020','CI/CD'),('job-020','Jenkins'),
  -- Senior Data Engineer (job-021)
  ('job-021','Python'),('job-021','SQL'),('job-021','Kafka'),('job-021','AWS'),('job-021','Elasticsearch'),
  -- BI Developer (job-022)
  ('job-022','SQL'),('job-022','Python'),('job-022','Data Science'),
  -- Data Analyst (job-023)
  ('job-023','SQL'),('job-023','Python'),('job-023','Data Science'),
  -- Analytics Engineer (job-024)
  ('job-024','SQL'),('job-024','Python'),('job-024','Data Science'),('job-024','AWS'),
  -- Head of Data (job-025)
  ('job-025','Python'),('job-025','SQL'),('job-025','Machine Learning'),('job-025','Data Science'),('job-025','AWS'),
  -- Senior .NET (job-026)
  ('job-026','C#'),('.NET','job-026'),('job-026','Azure'),('job-026','Microservices'),('job-026','SQL'),
  -- C# Software Engineer (job-027)
  ('job-027','C#'),('job-027','REST API'),('job-027','Azure'),('job-027','SQL'),
  -- Full Stack .NET (job-028)
  ('job-028','C#'),('job-028','React'),('job-028','Azure'),('job-028','SQL'),('job-028','TypeScript'),
  -- Flutter (job-029)
  ('job-029','Flutter'),('job-029','REST API'),('job-029','Git'),
  -- Senior Mobile (job-030)
  ('job-030','React Native'),('job-030','TypeScript'),('job-030','JavaScript'),('job-030','REST API'),
  -- Cybersecurity (job-031)
  ('job-031','Linux'),('job-031','AWS'),('job-031','Python'),
  -- Kubernetes Platform (job-032)
  ('job-032','Kubernetes'),('job-032','Docker'),('job-032','Terraform'),('job-032','CI/CD'),('job-032','Linux'),
  -- Engineering Manager (job-033)
  ('job-033','Java'),('job-033','Agile'),('job-033','Microservices'),
  -- API Integration (job-034)
  ('job-034','Node.js'),('job-034','REST API'),('job-034','GraphQL'),('job-034','PostgreSQL'),
  -- Rust (job-035)
  ('job-035','Rust'),('job-035','Linux'),('job-035','Docker'),
  -- Go (job-036)
  ('job-036','Go'),('job-036','Kubernetes'),('job-036','PostgreSQL'),('job-036','Docker'),
  -- Java Contractor (job-037)
  ('job-037','Java'),('job-037','Spring Boot'),('job-037','REST API'),('job-037','Microservices'),
  -- Data Engineer Contractor (job-038)
  ('job-038','Python'),('job-038','AWS'),('job-038','SQL'),
  -- React Contractor (job-039)
  ('job-039','React'),('job-039','TypeScript'),('job-039','REST API'),('job-039','JavaScript'),
  -- Platform Engineer (job-040)
  ('job-040','Kubernetes'),('job-040','Terraform'),('job-040','Docker'),('job-040','CI/CD'),('job-040','AWS'),
  -- FinTech Developer (job-041)
  ('job-041','Java'),('job-041','Python'),('job-041','Kafka'),('job-041','PostgreSQL'),
  -- Cloud Architect (job-042)
  ('job-042','AWS'),('job-042','Azure'),('job-042','Terraform'),('job-042','Kubernetes'),
  -- Node.js Backend (job-043)
  ('job-043','Node.js'),('job-043','JavaScript'),('job-043','MongoDB'),('job-043','Redis'),('job-043','REST API'),
  -- QA Engineer (job-045)
  ('job-045','Java'),('job-045','Python'),('job-045','CI/CD'),('job-045','Git'),
  -- Elasticsearch (job-046)
  ('job-046','Elasticsearch'),('job-046','Linux'),('job-046','Python'),
  -- Technical Lead (job-047)
  ('job-047','Java'),('job-047','Spring Boot'),('job-047','Kafka'),('job-047','Docker'),('job-047','Kubernetes'),('job-047','Microservices'),
  -- Graduate (job-048)
  ('job-048','Java'),('job-048','SQL'),('job-048','Git'),('job-048','Agile'),
  -- TypeScript Developer (job-049)
  ('job-049','TypeScript'),('job-049','JavaScript'),('job-049','Node.js'),('job-049','React'),('job-049','PostgreSQL'),('job-049','Docker'),('job-049','AWS'),
  -- Embedded (job-050)
  ('job-050','Linux'),('job-050','Git'),('job-050','CI/CD')
) AS js(ext_id, skill_name)
ON j.external_id = js.ext_id
JOIN skills s ON s.name = js.skill_name
ON CONFLICT DO NOTHING;

-- ── Salary records ────────────────────────────────────────
-- These power the salary analytics lookups

INSERT INTO salaries (skill_id, location_id, experience_years, salary_amount, currency, year, month, source)
SELECT s.id, l.id, exp, sal, 'ZAR', 2025, mon, 'seed'
FROM (VALUES
  -- Java salaries
  ('Java', 'Johannesburg', 2,  420000, 1), ('Java', 'Johannesburg', 5,  800000, 2),
  ('Java', 'Johannesburg', 8,  1150000, 3),('Java', 'Cape Town',    4,  720000, 4),
  ('Java', 'Cape Town',    7,  1050000, 5),('Java', 'Sandton',      6,  980000, 6),
  ('Java', 'Pretoria',     3,  550000, 7), ('Java', 'Durban',       4,  600000, 8),
  -- Python salaries
  ('Python', 'Johannesburg', 2, 450000, 1), ('Python', 'Johannesburg', 5, 850000, 2),
  ('Python', 'Johannesburg', 8, 1200000, 3),('Python', 'Cape Town',    4, 780000, 4),
  ('Python', 'Cape Town',    7, 1100000, 5),('Python', 'Remote',       5, 920000, 6),
  -- JavaScript
  ('JavaScript', 'Johannesburg', 2, 380000, 1),('JavaScript', 'Johannesburg', 5, 720000, 2),
  ('JavaScript', 'Cape Town',    3, 520000, 3),('JavaScript', 'Remote',       4, 680000, 4),
  -- TypeScript
  ('TypeScript', 'Johannesburg', 3, 650000, 1),('TypeScript', 'Cape Town', 5, 850000, 2),
  ('TypeScript', 'Remote',       4, 780000, 3),
  -- React
  ('React', 'Johannesburg', 2, 480000, 1),('React', 'Johannesburg', 5, 880000, 2),
  ('React', 'Cape Town',    3, 600000, 3),('React', 'Remote',       4, 780000, 4),
  -- AWS
  ('AWS', 'Johannesburg', 3, 850000, 1),('AWS', 'Johannesburg', 6, 1250000, 2),
  ('AWS', 'Cape Town',    4, 900000, 3),('AWS', 'Remote',       5, 1050000, 4),
  -- Kubernetes
  ('Kubernetes', 'Johannesburg', 3, 900000, 1),('Kubernetes', 'Cape Town', 4, 950000, 2),
  ('Kubernetes', 'Remote',       5, 1100000, 3),
  -- Machine Learning
  ('Machine Learning', 'Johannesburg', 3, 950000, 1),('Machine Learning', 'Cape Town', 4, 1050000, 2),
  ('Machine Learning', 'Remote',       5, 1200000, 3),
  -- Spring Boot
  ('Spring Boot', 'Johannesburg', 2, 480000, 1),('Spring Boot', 'Johannesburg', 5, 900000, 2),
  ('Spring Boot', 'Sandton',      4, 820000, 3),
  -- Go
  ('Go', 'Johannesburg', 3, 900000, 1),('Go', 'Cape Town', 4, 950000, 2),('Go', 'Remote', 5, 1100000, 3),
  -- Rust
  ('Rust', 'Johannesburg', 3, 1050000, 1),('Rust', 'Cape Town', 4, 1100000, 2),('Rust', 'Remote', 5, 1300000, 3)
) AS sv(skill_name, loc_name, exp, sal, mon)
JOIN skills s ON s.name = sv.skill_name
JOIN locations l ON l.city = sv.loc_name
ON CONFLICT DO NOTHING;
