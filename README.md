# FullStackTp

Full-stack car management app built with **Spring Boot**, **React**, and **MySQL**, fully containerised with Docker.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Quick Start — One Command](#quick-start--one-command)
- [Step-by-Step Guide](#step-by-step-guide)
- [Accessing the App](#accessing-the-app)
- [Default Credentials](#default-credentials)
- [Useful Docker Commands](#useful-docker-commands)
- [Architecture Overview](#architecture-overview)
- [Configuration Reference](#configuration-reference)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

You only need **one tool** installed:

| Tool              | Version  | Download                                      |
|-------------------|----------|-----------------------------------------------|
| **Docker Desktop**| ≥ 4.x    | [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) |

Docker Desktop ships with Docker Compose v2. No local JDK or Node.js installation is needed — everything builds inside Docker.

> **Windows users:** Make sure Docker Desktop is running (check the whale icon in the system tray) before proceeding.

---

## Project Structure

```
FullStackTp/
├── Dockerfile                  # Multi-stage: builds + runs the Spring Boot backend
├── .dockerignore               # Keeps Docker context small
├── docker-compose.yml          # Orchestrates all 3 services
├── build.gradle                # Gradle build config (Java 17)
├── settings.gradle
├── gradlew / gradlew.bat       # Gradle wrapper (no local Gradle needed)
├── .env                        # MySQL connection env vars
├── .mysqlenv                   # MySQL root credentials
├── src/
│   ├── main/
│   │   ├── java/...            # Spring Boot backend (REST API + Security)
│   │   ├── resources/
│   │   │   ├── application.properties          # Default profile (H2)
│   │   │   └── application-docker.properties   # Docker profile (MySQL)
│   │   └── webapp/reactjs/     # React frontend
│   │       ├── Dockerfile      # Node Alpine image for React dev server
│   │       ├── .dockerignore   # Excludes node_modules from Docker
│   │       └── src/...         # React components
│   └── test/...
└── README.md                   # ← You are here
```

---

## Quick Start — One Command

```bash
git clone <repo-url> FullStackTp
cd FullStackTp
docker compose -f docker-compose.yml up --build
```

That's it. Wait ~2 minutes for the first build, then open **http://localhost:3000**.

---

## Step-by-Step Guide

### 1. Clone the repository

```bash
git clone <repo-url> FullStackTp
cd FullStackTp
```

### 2. Verify Docker is running

```bash
docker --version
# Expected: Docker version 2x.x.x or higher

docker compose version
# Expected: Docker Compose version v2.x.x
```

### 3. Build and start all services

```bash
docker compose -f docker-compose.yml up --build
```

This single command:
1. **Starts MySQL 9.0** and waits for it to be healthy (accepts connections)
2. **Builds the Spring Boot backend** inside Docker (multi-stage: compiles Java → creates minimal runtime image)
3. **Builds the React frontend** (installs npm dependencies → starts dev server)
4. **Connects everything** on an internal Docker network

> **First run takes ~2-3 minutes** (downloading base images + compiling). Subsequent runs use cached layers and start in seconds.

### 4. Watch the logs

You'll see output from all three services. Look for these success indicators:

```
mysqldb              | ... ready for connections. Version: '9.0.1' ...
                       Container mysqldb Healthy
springboot-app-1     | Started FullStackTpApplication in XX seconds
react-app-1          | webpack compiled with 1 warning
```

### 5. Open the app

Once you see all three success messages, open your browser:

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- Login with the default credentials (see below)

---

## Accessing the App

| Service             | URL                                                  | Description                     |
|---------------------|------------------------------------------------------|---------------------------------|
| React Frontend      | [http://localhost:3000](http://localhost:3000)        | Main UI — login, manage cars    |
| Spring Boot API     | [http://localhost:9090](http://localhost:9090)        | Backend REST API                |
| Spring Data REST    | [http://localhost:9090/api](http://localhost:9090/api)| Auto-generated HATEOAS endpoints|
| Swagger UI          | [http://localhost:9090/swagger-ui.html](http://localhost:9090/swagger-ui.html) | API documentation |
| MySQL (direct)      | `localhost:3307`                                     | Connect with any MySQL client   |

---

## Default Credentials

Two accounts are pre-configured in `SecurityConfig.java`:

| Username | Password   | Role    | Use for                          |
|----------|------------|---------|----------------------------------|
| `user`   | `password` | USER    | Frontend login at localhost:3000 |
| `admin`  | `secret`   | ADMIN   | Direct API access / Swagger      |

All API endpoints use **HTTP Basic Auth**.

---

## Useful Docker Commands

### Start in the background (detached mode)

```bash
docker compose -f docker-compose.yml up --build -d
```

### View logs for a specific service

```bash
# All services
docker compose -f docker-compose.yml logs -f

# Just the backend
docker compose -f docker-compose.yml logs -f springboot-app

# Just MySQL
docker compose -f docker-compose.yml logs -f mysqldb
```

### Stop all services

```bash
docker compose -f docker-compose.yml down
```

### Stop and remove all data (reset database)

```bash
docker compose -f docker-compose.yml down -v
```

> The `-v` flag removes the `db-data` volume, wiping the MySQL database. Next startup will recreate the database and seed sample data.

### Rebuild a single service (e.g., after code changes)

```bash
# Rebuild only the backend
docker compose -f docker-compose.yml up --build springboot-app

# Rebuild only the frontend
docker compose -f docker-compose.yml up --build react-app
```

### Open a shell inside a running container

```bash
# Backend container
docker compose -f docker-compose.yml exec springboot-app sh

# MySQL container
docker compose -f docker-compose.yml exec mysqldb mysql -uroot -proot miola
```

---

## Architecture Overview

```
┌─────────────┐     HTTP :3000     ┌──────────────────┐
│   Browser   │ ◄────────────────► │   React (Node)   │
└─────────────┘                    │   react-app      │
                                   └────────┬─────────┘
                                            │ API calls to
                                            │ localhost:9090
                                            ▼
                                   ┌──────────────────┐
                                   │  Spring Boot API  │
                                   │  springboot-app   │
                                   │  (port 8082→9090) │
                                   └────────┬─────────┘
                                            │ JDBC
                                            │ mysqldb:3306
                                            ▼
                                   ┌──────────────────┐
                                   │   MySQL 9.0      │
                                   │   mysqldb         │
                                   │  (port 3306→3307) │
                                   └──────────────────┘
                                         │
                                    db-data volume
                                   (persistent storage)
```

**Startup order** is enforced by Docker Compose healthchecks:
1. MySQL starts → healthcheck (`mysqladmin ping`) passes → marked as **healthy**
2. Spring Boot starts only **after** MySQL is healthy → connects and creates tables
3. React starts only **after** Spring Boot has started

---

## Configuration Reference

### Port Mappings

| Service        | Container Port | Host Port | Change in                |
|----------------|---------------|-----------|--------------------------|
| Spring Boot    | 8082          | 9090      | `docker-compose.yml`     |
| React          | 3000          | 3000      | `docker-compose.yml`     |
| MySQL          | 3306          | 3307      | `docker-compose.yml`     |

### Environment Variables (docker-compose.yml)

| Variable                   | Default         | Used by         |
|----------------------------|-----------------|-----------------|
| `SPRING_PROFILES_ACTIVE`   | `docker`        | Spring Boot     |
| `MYSQL_HOST`               | `mysqldb`       | Spring Boot     |
| `MYSQL_USER`               | `root`          | Spring Boot     |
| `MYSQL_PASSWORD`           | `root`          | Spring Boot     |
| `MYSQL_PORT`               | `3306`          | Spring Boot     |
| `MYSQL_DATABASE`           | `miola`         | MySQL           |
| `MYSQL_ROOT_PASSWORD`      | `root`          | MySQL           |
| `REACT_APP_API_BASE_URL`   | `http://localhost:9090` | React   |

### Key Config Files

| File                                | Purpose                                          |
|-------------------------------------|--------------------------------------------------|
| `application.properties`            | Default profile — H2 in-memory DB (local dev)    |
| `application-docker.properties`     | Docker profile — MySQL connection + HikariCP     |
| `SecurityConfig.java`               | Users, passwords, CORS, endpoint security        |

---

## Troubleshooting

### "API indisponible" error on the frontend

The backend hasn't finished starting yet. Check the Spring Boot logs:

```bash
docker compose -f docker-compose.yml logs -f springboot-app
```

Wait for `Started FullStackTpApplication` in the logs, then refresh the page.

### Port already in use

Another process is using port 3000, 9090, or 3307. Either stop it or change the port in `docker-compose.yml`:

```yaml
ports:
  - "9091:8082"   # Change 9090 to 9091
```

### MySQL won't start — "Cannot downgrade" error

The `db-data` volume has data from a different MySQL version. Reset it:

```bash
docker compose -f docker-compose.yml down -v
docker compose -f docker-compose.yml up --build
```

### Build fails — out of disk space

Docker images can accumulate. Free up space:

```bash
docker system prune -a
```

### React changes not hot-reloading

The `CHOKIDAR_USEPOLLING` env var is set to `true` for file watching inside Docker on Windows. If it still doesn't work, restart the React container:

```bash
docker compose -f docker-compose.yml restart react-app
```
