# FIXORA — Smart Local Service & Emergency Assistance Platform

FIXORA is a production-oriented, full-stack platform that connects customers with verified nearby service professionals (mechanics, electricians, plumbers, AC technicians, carpenters, and appliance repair specialists) with live GPS-based mapping, 24/7 emergency dispatch, and direct booking checkout.

---

## Tech Stack Overview

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Leaflet Maps, Lucide Icons, Socket.IO Client.
- **Backend**: Node.js, Express, TypeScript, Prisma ORM, Socket.IO, JWT, bcryptjs.
- **Database**: PostgreSQL (Neon Cloud PostgreSQL or Local Windows PostgreSQL).
- **Deployment Targets**: Vercel (Frontend), Render (Backend), Neon (Database).

---

## Directory Architecture

```
fixora-platform/
├── client/                   # Vite React TypeScript Frontend
│   ├── src/
│   │   ├── components/       # Layouts, Navigation, Leaflet Map, Booking Modal
│   │   ├── context/          # Auth & Socket state management
│   │   ├── pages/            # LandingPage, ServicesPage, Dashboards, Auth
│   │   ├── types/            # Shared TypeScript data types
│   │   ├── App.tsx
│   │   └── index.css         # Tailwind CSS, keyframes & glassmorphism theme
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
├── server/                   # Express TypeScript Backend
│   ├── prisma/               # Prisma Schema & Seed script
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/           # Prisma client instance
│   │   ├── middleware/       # JWT auth, RBAC guards & database error handler
│   │   ├── routes/           # Auth, Categories, Services, Professionals, Bookings, Admin
│   │   ├── services/         # Socket.IO real-time event engine
│   │   └── index.ts          # Server entry point & health check endpoints
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── vercel.json               # Vercel deployment configuration
├── render.yaml               # Render web service configuration
├── .gitignore
└── README.md
```

---

## PostgreSQL Database Setup on Windows

FIXORA uses PostgreSQL through Prisma via the `DATABASE_URL` environment variable.

### Option A: Local Windows PostgreSQL Installation

1. **Download & Install PostgreSQL**:
   - Download the Windows installer from [EnterpriseDB PostgreSQL](https://www.postgresql.org/download/windows/) (version 15 or 16).
   - During installation, set your superuser password (e.g. `postgres`) and default port `5432`.
2. **Verify PostgreSQL Windows Service**:
   Open Windows PowerShell as Administrator and ensure the PostgreSQL service is running:
   ```powershell
   Get-Service -Name *postgres*
   # If stopped, start it:
   Start-Service postgresql-x64-16
   ```
3. **Create the Database `fixoradb`**:
   Using `psql` command line or pgAdmin:
   ```sql
   CREATE DATABASE fixoradb;
   ```
4. **Configure `server/.env`**:
   Ensure `server/.env` contains your connection credentials:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fixoradb?schema=public"
   ```

### Option B: Cloud PostgreSQL (Recommended for Instant Setup)

If you prefer not to install PostgreSQL locally on Windows:
1. Create a free PostgreSQL database on [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy your connection string into `server/.env`:
   ```env
   DATABASE_URL="postgresql://username:password@ep-sample-pool.us-east-2.aws.neon.tech/fixoradb?sslmode=require"
   ```

---

## Database Migration & Seeding

Once PostgreSQL is accessible, apply schema migrations and populate demo accounts:

```powershell
# From the project root:
cd "server"

# 1. Generate Prisma Client
npm run prisma:generate

# 2. Push schema to PostgreSQL
npx prisma db push

# 3. Seed demo categories, services, and accounts
npm run prisma:seed
```

### Seed Accounts Created:

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@fixora.com` | `AdminPass123!` | Full admin dashboard & oversight |
| **Customer** | `customer@fixora.com` | `Password123!` | Verified homeowner (Sarah Jenkins) |
| **Professional** | `pro@fixora.com` | `Password123!` | Marcus Sterling (Electrician & Mechanic) |
| **Professional** | `david.plumber@fixora.com` | `Password123!` | David Miller (Emergency Plumber) |

---

## Running FIXORA in Development

### Run Both Services via Root Workspace

From the root project directory `fixora-platform`:

```powershell
# Start Client Dev Server (Vite)
npm run dev

# Start Backend Server (in a separate terminal)
npm run dev:server
```

Or run directly in each respective directory:

```powershell
# Terminal 1 - Backend API Server (Port 5000)
cd "server"
npm run dev

# Terminal 2 - Frontend Client (Port 5173)
cd "client"
npm run dev
```

---

## Production Build Verification

Both frontend and backend can be compiled with TypeScript:

```powershell
# From workspace root:
npm run build
```
This executes:
1. `npm --prefix server run build` (`tsc`)
2. `npm --prefix client run build` (`tsc && vite build`)

---

## API Health Check Endpoints

- **Server Health**: `GET http://localhost:5000/health`
  Returns server uptime and PostgreSQL database connection probe.
- **Database Status**: `GET http://localhost:5000/api/health/db`
  Directly validates PostgreSQL query execution (`SELECT 1`).
