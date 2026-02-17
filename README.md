# Air Quality Monitoring

A microservices-based system that monitors real-time air quality across Middle Eastern cities (Riyadh, Dubai, Doha, Muscat) and triggers alerts when pollution levels exceed safe thresholds.

## Architecture

The system consists of two NestJS services communicating via RabbitMQ, plus a React dashboard:

- **Air Quality Collector** — Polls the [Google Air Quality API](https://developers.google.com/maps/documentation/air-quality) every 10 seconds, evaluates AQI/PM2.5/PM10 thresholds, and publishes critical events to RabbitMQ.
- **Air Quality Alerts** — Consumes alert events from RabbitMQ, persists them to PostgreSQL, and exposes an HTTP API to query stored alerts.
- **Dashboard** — React frontend that displays alerts fetched from the Alerts API.

```
Google Air Quality API
        |
        v
 ┌──────────────┐       RabbitMQ        ┌──────────────┐      PostgreSQL
 │   Collector   │ ──────────────────>  │    Alerts     │ ──────────────>  DB
 │  (Producer)   │                      │  (Consumer)   │
 └──────────────┘                       └──────────────┘
                                              |
                                         GET /alerts
                                              |
                                       ┌──────────────┐
                                       │   Dashboard   │
                                       │   (React)     │
                                       └──────────────┘
```

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- A [Google Air Quality API key](https://developers.google.com/maps/documentation/air-quality/get-api-key)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd air_quality_monitoring
   ```

2. **Create the environment file**

   ```bash
   cp .env.example .env
   ```

3. **Set your Google API key**

   Open `.env` and replace the placeholder with your actual key:

   ```
   GOOGLE_AIR_QUALITY_API_KEY=your_actual_key_here
   ```

4. **Start all services**

   ```bash
   docker-compose up --build
   ```

   This will start five containers:
   - PostgreSQL (with automatic schema migration)
   - RabbitMQ (with management UI)
   - Air Quality Alerts service
   - Air Quality Collector service
   - Dashboard

5. **Verify everything is running**

   | Service                | URL                          | Description                              |
   | ---------------------- | ---------------------------- | ---------------------------------------- |
   | Dashboard              | http://localhost:5173         | React UI to view alerts                  |
   | Alerts API             | http://localhost:3001/alerts  | REST endpoint returning latest alerts    |
   | Alerts Swagger UI      | http://localhost:3001/api     | API documentation for Alerts service     |
   | Collector API          | http://localhost:3002         | Air quality polling service              |
   | Collector Swagger UI   | http://localhost:3002/api     | API documentation for Collector service  |
   | RabbitMQ Management UI | http://localhost:15672        | Message broker dashboard (guest / guest) |

   The collector will begin polling immediately. Once air quality thresholds are exceeded, alerts will appear on the dashboard and at the `/alerts` endpoint.

## Thresholds

Alerts are triggered when any of the following are exceeded:

| Pollutant | Threshold |
| --------- | --------- |
| PM2.5     | 100       |
| PM10      | 150       |
| UAQI      | 100       |

## API Documentation (Swagger)

Both microservices include Swagger UI for interactive API exploration and testing.

| Service | Swagger UI |
|---|---|
| Alerts API | http://localhost:3001/api |
| Collector API | http://localhost:3002/api |

Open the URL in your browser to see all available endpoints, request/response schemas, and try out API calls directly.

## Health Checks

Both microservices expose a `GET /health` endpoint powered by `@nestjs/terminus` to verify readiness and liveness.

| Service | Endpoint | Checks |
|---|---|---|
| Alerts API | http://localhost:3001/health | Database (PostgreSQL), RabbitMQ, Disk, Memory |
| Collector API | http://localhost:3002/health | RabbitMQ, Disk, Memory |

Docker Compose uses these endpoints for container health checks. The dashboard waits for the alerts service to be healthy before starting.

## AWS Infrastructure (CDK)

The `infra/` directory contains an AWS CDK stack that defines the cloud infrastructure for deploying this project to AWS.

| Local (Docker)      | AWS Resource                 |
| ------------------- | ---------------------------- |
| PostgreSQL          | RDS PostgreSQL 17 (t3.micro) |
| RabbitMQ            | Amazon MQ RabbitMQ broker    |
| Collector container | ECS Fargate service          |
| Alerts container    | ECS Fargate service          |
| Dashboard (Vite)    | S3 + CloudFront              |

### Usage

```bash
cd infra
npm install
npx cdk synth     # Generate CloudFormation template
npx cdk deploy    # Deploy to AWS (requires configured AWS credentials)
```

## Stopping the Services

```bash
docker-compose down
```

To also remove the database volume:

```bash
docker-compose down -v
```
