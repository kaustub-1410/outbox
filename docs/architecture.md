# ReachInbox Email Scheduler - System Architecture Document

## System Overview

ReachInbox Email Scheduler is an enterprise-grade full-stack email automation engine designed to schedule, rate-control, deliver, and search high-volume email campaigns without relying on cron jobs or standard timer loops.

---

## Technical Stack Architecture

```
+-----------------------------------------------------------------------+
|                               FRONTEND                                |
|           Next.js 15 (App Router) + Tailwind CSS + Zustand            |
|       TanStack Query (React Query) + Axios + Zod Validation           |
+-----------------------------------+-----------------------------------+
                                    | HTTP / JSON APIs
                                    v
+-----------------------------------+-----------------------------------+
|                                BACKEND                                |
|            Express.js + TypeScript + Prisma ORM + Passport            |
+-----------+-----------------------+-----------------------+-----------+
            |                       |                       |
            v                       v                       v
  +---------+---------+   +---------+---------+   +---------+---------+
  |    PostgreSQL     |   |   Redis & BullMQ  |   |   Elasticsearch   |
  | (Schema Metadata) |   |  (Delayed Queues) |   |  (Email Index 8)  |
  +-------------------+   +---------+---------+   +-------------------+
                                    |
                                    v
                          +---------+---------+
                          |  BullMQ Workers   |
                          | (Worker Concurrency)
                          +---------+---------+
                                    | (Rate Limit Breach Alert)
                                    v
                          +---------+---------+
                          |  Slack Web API    |
                          +-------------------+
```

---

## Key Core Components

### 1. BullMQ Delayed Queues (Strict No-Cron Policy)
Instead of polling a database or executing a cron job every minute:
- Every lead in a campaign gets an individual delayed job registered in BullMQ Redis queue.
- `delay = scheduledTimeMs - Date.now()`.
- Job options feature exponential backoff retry up to 3 attempts.

### 2. Distributed Rate Limiting & Auto-Rescheduling
- Key format: `rate_limit:<senderId>:<YYYYMMDDHH>`
- Atomic Redis `INCR` operation.
- If quota is exceeded (`currentCount > MAX_EMAILS_PER_HOUR_PER_SENDER`):
  - Job status is set to `RATE_LIMITED` in Postgres.
  - Job is NOT failed; instead, `delayMs` is calculated until the top of the next UTC hour.
  - Job is rescheduled back into BullMQ.
  - Slack alert notification is dispatched once per hourly breach.

### 3. Idempotency & Restart Safety
- State check before delivery: `if (job.status === 'SENT') return;`.
- Redis standard AOF (`appendonly yes`) ensures queue jobs survive container restarts.
- Workers resume processing immediately upon restart without re-sending already delivered emails.

### 4. Elasticsearch Indexing
- Every scheduled or sent email document is indexed into `emails` index.
- Multi-match search supports fuzzy matching on `subject`, `recipient`, `body`, and `sender`.
- Automatic fallback to PostgreSQL `ILIKE` pattern queries if Elasticsearch is unreachable.
