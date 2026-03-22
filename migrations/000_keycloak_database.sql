-- Keycloak database on the same Postgres instance as app data (single-DB cost layout).
-- Runs only on first volume init (docker-entrypoint-initdb.d).
CREATE USER keycloak WITH PASSWORD 'keycloak_password';
CREATE DATABASE keycloak OWNER keycloak;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO keycloak;
