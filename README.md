# Air Quality Monitoring

A microservices-based system that monitors real-time air quality across Middle Eastern cities (Riyadh, Dubai, Doha, Muscat) and triggers alerts when pollution levels exceed safe thresholds.

## Architecture

The system consists of two NestJS services communicating via RabbitMQ:

- **Air Quality Collector** — Polls the [Google Air Quality API](https://developers.google.com/maps/documentation/air-quality) every 10 seconds, evaluates AQI/PM2.5/PM10 thresholds, and publishes critical events to RabbitMQ.
- **Air Quality Alerts** — Consumes alert events from RabbitMQ, persists them to PostgreSQL, and exposes an HTTP API to query stored alerts.

```
Google Air Quality API
        |
        v
 ┌──────────────┐       RabbitMQ       ┌──────────────┐      PostgreSQL
 │   Collector   │ ──────────────────>  │    Alerts     │ ──────────────>  DB
 │  (Producer)   │                      │  (Consumer)   │
 └──────────────┘                       └──────────────┘
                                              |
                                         GET /alerts
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

   This will start four containers:
   - PostgreSQL (with automatic schema migration)
   - RabbitMQ (with management UI)
   - Air Quality Alerts service
   - Air Quality Collector service

5. **Verify everything is running**

   | Service | URL |
   |---|---|
   | Alerts API | http://localhost:3001/alerts |
   | RabbitMQ Management UI | http://localhost:15672 (guest / guest) |

   The collector will begin polling immediately. Once air quality thresholds are exceeded, alerts will appear at the `/alerts` endpoint.

## Thresholds

Alerts are triggered when any of the following are exceeded:

| Pollutant | Threshold |
|---|---|
| PM2.5 | 100 |
| PM10 | 150 |
| UAQI | 100 |

## Stopping the Services

```bash
docker-compose down
```

To also remove the database volume:

```bash
docker-compose down -v
```
