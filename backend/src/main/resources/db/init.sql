-- Database initialization script
-- Flyway handles schema migrations from db/migration/
-- This file ensures the database is ready for Flyway

\connect jobmarket

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS btree_gin;
