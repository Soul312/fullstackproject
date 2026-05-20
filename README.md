# FullStackTp — Docker Startup Guide

Full-stack demo app: Spring Boot API + React frontend + MySQL. This README focuses on getting a fresh environment running with Docker.

---

## What you need

- **Docker Desktop** (includes Docker Compose v2)
- **JDK 17+** (needed once to build the backend JAR used by the Docker image)

---

## Quick start (Docker)

### 1) Build the backend JAR

The backend Docker image expects a prebuilt JAR at `build/libs/*.jar`.

```bat
REM From the repo root
set JAVA_HOME=C:\Program Files\Java\jdk-17
.\gradlew.bat clean build -x test
```

### 2) Start the full stack with Docker Compose

There are two compose files in this repo. Use one explicitly:

- `docker-compose.yml` (React `Dockerfile`)
- `compose.yaml` (React `Dockerfile-react`)

```bat
REM Option A: docker-compose.yml
docker compose -f docker-compose.yml up -d --build

REM Option B: compose.yaml
docker compose -f compose.yaml up -d --build
```

### 3) Open the app

- **React UI:** `http://localhost:3000`
- **Spring API (base):** `http://localhost:9090`
- **Spring Data REST:** `http://localhost:9090/api`
- **MySQL (host port):** `localhost:3307`

---

## Default credentials

All API endpoints use HTTP Basic Auth by default.

| Field    | Value    |
|----------|----------|
| Username | `admin`  |
| Password | `secret` |

Credentials are configured in `src/main/resources/application.properties`.

---

## Stop and clean up

```bat
REM Stop containers
docker compose -f docker-compose.yml down

REM Remove containers + DB volume
docker compose -f docker-compose.yml down -v
```

---

## Configuration notes

- Docker profile settings live in `src/main/resources/application-docker.properties`.
- The backend container listens on **8082** internally and is mapped to **9090** on your host.
- MySQL data persists in a named volume (`db-data`).

---

## Troubleshooting

- **Ports already in use:** stop the existing service or change the port mappings in `docker-compose.yml`.
- **Backend not ready when React starts:** wait 10-20 seconds, then refresh; use `docker compose logs -f springboot-app` for details.
- **Database connection issues:** check MySQL logs with `docker compose logs -f mysqldb`.
