# Festivo

Festivo is an online marketplace for booking event services. Clients find and book performers for their events, view portfolios, chat in real time, and leave reviews. Performers showcase their services, manage booking requests, and track their calendar. Administrators oversee users and content on the platform.

**[Figma Design](https://www.figma.com/design/IbYbVTxpIqdVg1XhFbA4k9/Festivo-%E2%80%94-UI-UX-Design?node-id=0-1&t=DahBk1W2SBOIhayQ-1)**  
**[Use Case Diagram](https://www.figma.com/board/hxQA4Lz7TAyyiPPWY4fMas/Festivo-%E2%80%94-Use-Case-Diagram?node-id=0-1&t=mMhAiXsJGyYd5nWb-1)**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, TanStack Query v5, Zustand v5, Socket.io-client |
| Backend | Node.js 18, Express, TypeScript, MongoDB / Mongoose, Socket.io, JWT auth |
| Database | MongoDB 7 (runs in Docker) |
| Email (dev) | Mailpit — local SMTP server that captures all outgoing emails |
| Infrastructure | Docker Compose |

---

## Application Overview

### Pages

| Route | Who can access | Description |
|---|---|---|
| `/` | Everyone | Landing page — hero, categories, how it works |
| `/auth` | Guests | Login and registration (client or performer role) |
| `/browse` | Everyone | Search and filter performers by category, city, price, rating |
| `/performers/:id` | Everyone | Performer profile — about, services, portfolio, reviews |
| `/bookings/:id` | Authenticated | Booking details + real-time chat |
| `/dashboard` | Clients | Bookings, messages, notifications, profile |
| `/performer/dashboard` | Performers | Manage bookings, stats, profile |
| `/admin` | Admin | User management, platform statistics |

### User Roles

- **Client** — searches performers, creates bookings, chats, leaves reviews
- **Performer** — lists services, accepts/rejects bookings, chats with clients
- **Admin** — manages users, views platform statistics

### Booking Flow

1. Client finds a performer on `/browse` and opens their profile
2. Client selects a service → clicks **Request Booking** → fills in event details
3. Booking is created with status `pending`; a chat conversation opens automatically
4. Performer sees the request on their dashboard → clicks **Confirm** or **Reject**
5. On confirmation, the date is blocked in the performer's availability calendar
6. After the event, performer marks it **Completed**
7. Client can leave a **Review** for the performer

### Real-time Features (Socket.io)

- Live chat messages between client and performer per booking
- Instant in-app notifications (booking created, confirmed, cancelled, new message)

---

## About Mailpit

**Mailpit** is a local development mail server. It behaves like a real SMTP server but instead of delivering emails to actual inboxes, it captures them all and displays them in a browser UI.

- **UI:** http://localhost:8025
- **SMTP port:** 1025 (used internally by the backend)

**Why it exists:** lets you test the full email flow (booking confirmations, password reset links, etc.) without needing a real email account or external service. Zero configuration — works out of the box.

**In production:** replace `MAIL_HOST` / `MAIL_PORT` / `MAIL_USER` / `MAIL_PASS` in `.env` with your actual SMTP provider (e.g. SendGrid, Mailgun, or Gmail SMTP).

---

## Prerequisites

Install these before running the project:

- **Node.js v18+** → https://nodejs.org
- **Docker Desktop** → https://www.docker.com/products/docker-desktop

> **macOS without Docker Desktop** — use [Colima](https://github.com/abiosoft/colima):
> ```bash
> brew install colima && colima start
> ```

---

## Quick Start

This single command starts everything: MongoDB, Mailpit, Backend, and Frontend.

```bash
# 1. Clone the repository
git clone <repo-url>
cd OneVision

# 2. Install dependencies
cd BE && npm install && cd ..
cd FE && npm install && cd ..

# 3. Copy environment files
cp BE/.env.example BE/.env
cp FE/.env.example FE/.env

# 4. Run
chmod +x start.sh
./start.sh
```

Open http://localhost:5173 in your browser.  
Press **Ctrl+C** to stop all services.

### Load Demo Data

After the app is running, seed the database with demo accounts:

```bash
cd BE
npm run seed:demo   # demo performers and a client account
npm run seed:admin  # admin account
```

#### Demo Accounts

| Email | Password | Role |
|---|---|---|
| `maria@demo.com` | `demo1234` | Client |
| `anna.kovalenko@demo.com` | `demo1234` | Performer — Photography |
| `dj.maksym@demo.com` | `demo1234` | Performer — Music |
| `deco.olena@demo.com` | `demo1234` | Performer — Decoration |
| `admin@festivo.local` | `admin123` | Admin (after seed:admin) |

> Demo data is stored in MongoDB's Docker volume — it **persists between restarts** on the same machine. On a new machine, run `seed:demo` again after first start.

---

## Manual Setup (Step by Step)

If you prefer to start services individually:

**1. Start MongoDB and Mailpit**
```bash
cd BE
docker compose up -d mongo mailpit
```

**2. Start the Backend**
```bash
cd BE
cp .env.example .env   # adjust if needed
npm install
npm run dev            # http://localhost:4000
```

**3. Start the Frontend**
```bash
cd FE
cp .env.example .env   # VITE_API_URL=http://localhost:4000
npm install
npm run dev            # http://localhost:5173
```

---

## Environment Variables

### Backend (`BE/.env`)

```env
NODE_ENV=development
PORT=4000

# MongoDB
MONGO_URI=mongodb://festivo:festivo@localhost:27017/festivo?authSource=admin

# CORS — must match the frontend URL
CLIENT_ORIGIN=http://localhost:5173

# JWT — change these secrets in production!
JWT_ACCESS_SECRET=change-me-access
JWT_REFRESH_SECRET=change-me-refresh
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=7d

# Mailpit (local dev SMTP — leave as-is)
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM="Festivo <no-reply@festivo.local>"

# File uploads
UPLOAD_DIR=./uploads
UPLOAD_MAX_SIZE_MB=5
PUBLIC_BASE_URL=http://localhost:4000
```

### Frontend (`FE/.env`)

```env
VITE_API_URL=http://localhost:4000
```

---

## Running Tests

```bash
cd BE
npm test
```

Tests use an in-memory MongoDB instance — no running Docker required.

---

## Service URLs (local development)

| Service | URL | Notes |
|---|---|---|
| Frontend | http://localhost:5173 | React app |
| Backend API | http://localhost:4000/api | REST + Socket.io |
| Mailpit | http://localhost:8025 | View captured emails |
| Mongo Express | http://localhost:8081 | Browse database UI (admin / admin) |

---

## Project Structure

```
OneVision/
├── BE/                        # Backend (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── modules/           # Feature modules
│   │   │   ├── auth/          # JWT login, register, refresh, password reset
│   │   │   ├── users/         # User profile management
│   │   │   ├── performers/    # Performer profiles, browse, portfolio
│   │   │   ├── services/      # Performer service listings
│   │   │   ├── bookings/      # Booking lifecycle (create → confirm → complete)
│   │   │   ├── availability/  # Performer calendar blocking
│   │   │   ├── chat/          # Conversations and messages (Socket.io)
│   │   │   ├── notifications/ # In-app notifications
│   │   │   ├── reviews/       # Client reviews for completed bookings
│   │   │   └── admin/         # Admin endpoints
│   │   ├── shared/            # Middleware, errors, event bus, utils
│   │   └── scripts/           # seed:demo, seed:admin
│   ├── tests/                 # Integration tests (Jest + mongodb-memory-server)
│   ├── docker-compose.yml     # MongoDB + Mailpit + API (production)
│   └── .env.example
├── FE/                        # Frontend (React + Vite + TypeScript)
│   ├── src/
│   │   ├── pages/             # Route-level pages
│   │   ├── components/        # Shared UI components
│   │   ├── api/               # Axios API client modules
│   │   ├── store/             # Zustand auth store (persisted)
│   │   ├── hooks/             # useSocket
│   │   ├── utils/             # Booking field helpers
│   │   └── types/             # TypeScript interfaces
│   └── .env.example
├── start.sh                   # One-command startup (Mac/Linux)
└── documents/                 # Project Charter, SRS
```