# ReachInbox Email Scheduler (Production Grade)

ReachInbox Email Scheduler is a full-stack, distributed email scheduling platform built with **Next.js 15**, **Express.js**, **Prisma ORM**, **PostgreSQL**, **Redis**, **BullMQ**, **Elasticsearch 8**, **Google OAuth**, and **Slack OAuth**.

---

## 🏛️ System Architecture Diagram

```
                               +-----------------------------+
                               |     Next.js 15 Frontend     |
                               |  (App Router SaaS Dashboard)|
                               +--------------+--------------+
                                              | HTTP API / Auth
                                              v
                               +--------------+--------------+
                               |      Express.js Backend     |
                               |    (Controllers/Services)   |
                               +-------+------+-------+------+
                                       |      |       |
                 +---------------------+      |       +---------------------+
                 |                            |                             |
                 v                            v                             v
       +---------+--------+         +---------+--------+          +---------+--------+
       |   PostgreSQL     |         |   Redis & BullMQ |          |  Elasticsearch  |
       |  (Prisma ORM)    |         | (Delayed Queues) |          | (Email Search)  |
       +------------------+         +---------+--------+          +------------------+
                                              |
                                              v
                                    +---------+--------+
                                    |  BullMQ Workers  |
                                    | (Ethereal Email) |
                                    +---------+--------+
                                              | (Rate Limit Breach)
                                              v
                                    +---------+--------+
                                    |  Slack Web API   |
                                    +------------------+
```

---

## 🚀 Quick Start & Docker Deployment

### 1. Run Everything via Docker Compose (Recommended)

```bash
# Clone the workspace and start containers
git clone <repo-url>
cd reachinbox-email-scheduler

# Build and start all 5 services (Postgres, Redis, Elasticsearch, Backend, Frontend)
docker-compose up -d --build
```

### Access Services:
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API**: `http://localhost:5000/api`
- **Bull Board Queue Dashboard**: `http://localhost:5000/admin/queues`
- **Health Check**: `http://localhost:5000/health`
- **Elasticsearch**: `http://localhost:9200`

---

## 💻 Local Development Setup (Manual)

### Prerequisites
- Node.js >= 20.x
- Docker / Docker Desktop (for Postgres, Redis, Elasticsearch)

### Step 1: Install Dependencies
```bash
npm install
npm run build:shared
```

### Step 2: Start Infrastructure Services
```bash
docker-compose up postgres redis elasticsearch -d
```

### Step 3: Run Database Migrations
```bash
npm run prisma:generate
npm run prisma:migrate
```

### Step 4: Start Backend & Frontend
```bash
# Terminal 1: Backend
npm run dev:backend

# Terminal 2: Frontend
npm run dev:frontend
```

---

## ⚙️ Environment Variables

### Backend Environment Variables (`apps/backend/.env`)

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Runtime environment |
| `PORT` | `5000` | Backend API port |
| `DATABASE_URL` | `postgresql://postgres:postgrespassword@localhost:5432/reachinbox` | PostgreSQL connection string |
| `REDIS_HOST` | `localhost` | Redis server host |
| `REDIS_PORT` | `6379` | Redis server port |
| `ELASTICSEARCH_URL` | `http://localhost:9200` | Elasticsearch node URL |
| `JWT_SECRET` | `reachinbox_super_secret_jwt_key_2026` | Secret key for JWT session tokens |
| `GOOGLE_CLIENT_ID` | `mock-google-client-id` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | `mock-google-client-secret` | Google OAuth Client Secret |
| `SLACK_CLIENT_ID` | `mock-slack-client-id` | Slack OAuth Client ID |
| `SLACK_CLIENT_SECRET` | `mock-slack-client-secret` | Slack OAuth Client Secret |
| `WORKER_CONCURRENCY` | `10` | BullMQ concurrent worker threads |
| `MAX_EMAILS_PER_HOUR_PER_SENDER` | `200` | Global hourly sender rate limit cap |

---

## 🎯 Core Technical Implementations

### 1. BullMQ Delayed Scheduling (No Cron Guarantee)
Unlike inefficient cron jobs that poll database tables every minute, ReachInbox uses **BullMQ delayed jobs**:
- When a campaign is submitted, each lead receives a computed execution timestamp:
  $$\text{scheduledTimeMs} = \text{startTime} + (i \times \text{delayBetweenEmailsInMs})$$
- BullMQ stores jobs in Redis sorted sets indexed by execution timestamp.
- Job IDs are stored back in PostgreSQL database (`EmailJob.bullJobId`).

### 2. Redis Persistence & Restart Recovery
- **Redis AOF Persistence**: Configured with `redis-server --appendonly yes` so delayed queues persist to disk.
- **Worker Recovery**: If a worker or backend container crashes or restarts, BullMQ reads delayed jobs directly from Redis without dropping or duplicating tasks.
- **Idempotency Guard**: Before sending any email, the worker verifies `EmailJob.status` in Postgres. If the status is already `SENT`, delivery is safely skipped.

### 3. Distributed Rate Limiting & Auto Rescheduling
- **Redis Key Structure**: `rate_limit:<senderId>:<YYYYMMDDHH>`
- **Atomic Counter**: `redisClient.incr(key)` enforces distributed rate limits safely across horizontal worker nodes.
- **Over-Limit Handling**:
  1. Job is **NOT failed**.
  2. Remaining window delay `resetInMs` is calculated until the next UTC hour.
  3. Job status updates to `RATE_LIMITED` in PostgreSQL.
  4. Job is rescheduled in BullMQ with `delay: resetInMs`.
  5. A Slack alert is dispatched to the user's workspace notifying them of the rate-limited sender.

### 4. Slack OAuth & Notification Integration
- **OAuth Authorization**: `GET /api/slack/connect` redirects user to Slack OAuth dialog.
- **Callback Storage**: Tokens are securely stored in the `SlackConnection` table.
- **Fault-Tolerant Alerts**: If Slack OAuth tokens expire or disconnect, notification failures are logged gracefully without interrupting email worker execution.

### 5. Google OAuth Authentication
- Users log in via Google OAuth (`POST /api/auth/google`).
- User profile (`id`, `name`, `email`, `avatar`, `googleId`) is synchronized with PostgreSQL.
- Sessions are managed using HTTP-Only / Bearer JWT tokens.

### 6. Elasticsearch 8 Search Engine
- Every scheduled or sent email is indexed into Elasticsearch (`emails` index).
- Full-text search endpoint `GET /api/search?q=keyword` queries `subject`, `recipient`, `body`, and `sender`.
- If Elasticsearch becomes unreachable, the service gracefully falls back to PostgreSQL pattern queries (`ILIKE`).

---

## 📡 API Documentation Summary

### Auth Routes
- `POST /api/auth/google`: Authenticate user via Google OAuth profile.
- `GET /api/auth/me`: Retrieve current logged-in user details.
- `POST /api/auth/logout`: Invalidate session and logout.

### Campaign Routes
- `POST /api/campaigns`: Create campaign & schedule delayed email jobs.
- `GET /api/campaigns`: List user campaigns with lead counts.
- `GET /api/campaigns/:id`: Get campaign details & email job timeline.
- `POST /api/campaigns/upload`: Parse and deduplicate CSV/TXT email lead files.

### Email Routes
- `GET /api/emails/scheduled`: Paginated list of scheduled/rate-limited email jobs.
- `GET /api/emails/sent`: Paginated list of delivered emails with Ethereal preview links.
- `GET /api/emails/metrics`: Dashboard KPI card totals.

### Slack Routes
- `GET /api/slack/connect`: Initiate Slack OAuth handshake.
- `GET /api/slack/callback`: Slack OAuth callback code handler.
- `GET /api/slack/status`: Check current Slack connection state.

### Search & System Routes
- `GET /api/search?q=`: Query emails in Elasticsearch with optional status filter.
- `GET /health`: Cluster health check (PostgreSQL, Redis, Elasticsearch).
- `GET /admin/queues`: Protected Bull Board UI queue dashboard.

---

## 🧪 Restart Recovery & Idempotency Demonstration

To verify that ReachInbox survives container restarts without double-sending emails:

1. Create a campaign scheduled 2 minutes in the future with 10 leads.
2. Stop the backend server mid-wait:
   ```bash
   docker-compose stop backend
   ```
3. Restart the backend container:
   ```bash
   docker-compose start backend
   ```
4. Check Bull Board (`http://localhost:5000/admin/queues`) or application logs. The BullMQ worker resumes processing exactly where it left off, and the idempotency check guarantees no lead receives duplicate emails.

---

## 📈 Scalability Strategy & Architectural Trade-offs

### Scalability Strategy
1. **Horizontal Worker Scaling**: Worker processes can be scaled independently (`docker-compose scale backend=3`) since Redis rate limits and job locks are distributed and atomic.
2. **Elasticsearch Decoupling**: Indexing happens asynchronously outside the critical email delivery path.

### Architectural Trade-offs
- **BullMQ Delayed Queues vs Database Polling**: Requires Redis memory for queue state, but eliminates constant DB polling overhead and provides millisecond-level delay accuracy.
- **Elasticsearch Fallback**: Falls back to PostgreSQL search if Elasticsearch is down, sacrificing fuzzy search accuracy in exchange for high availability.
