# IBC Data Visualization Platform

A full-stack analytics dashboard for **Illinois Business Consulting (IBC)** that visualizes consultant demographics, project staffing, semester trends, and staff transitions. Built with React, Express, PostgreSQL, and Microsoft Azure SSO.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [How Authentication Works](#how-authentication-works)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Frontend Pages & Components](#frontend-pages--components)
- [Data Flow](#data-flow)
- [NPM Scripts](#npm-scripts)

---

## Overview

The platform has two distinct parts:

| Part | Description | Location |
|------|-------------|----------|
| **Portal** | Login screen + app launcher (SSO-gated) | `platform/` |
| **Data Dashboard** | Full React SPA with charts and filters | `src/` |

Users log in via the portal with their **UIUC Microsoft account**, get redirected to the portal home (`platform/index.html`) which links out to the Data Visualization dashboard, the Paul Dashboard, and the Staffing Tool (SD/SM roles only).

---

## Tech Stack

### Frontend
| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| Vite | 7.3 | Build tool & dev server |
| TypeScript | 5.9 | Type safety |
| Tailwind CSS | 4.1 | Utility styling |
| Ant Design | 6.3 | UI component library |
| Recharts | 3.7 | Charts & visualizations |
| React Router | 7.13 | Client-side routing |
| TanStack Query | 5.90 | Data fetching & caching |
| Axios | 1.13 | HTTP client |
| Lucide React | 0.564 | Icons |

### Backend
| Tool | Version | Purpose |
|------|---------|---------|
| Node.js + Express | 5.2 | HTTP server |
| TypeScript | 5.9 | Type safety |
| PostgreSQL (pg) | 8 | Database client |
| Azure MSAL Node | 5.1 | Microsoft SSO |
| JSON Web Tokens | 9.0 | Session tokens |
| nodemon | 3.1 | Dev auto-restart |

### Infrastructure
- **Database**: PostgreSQL on GCP Cloud SQL (`34.60.188.54`)
- **Auth Provider**: Microsoft Azure AD (UIUC tenant)

---

## Project Structure

```
ibc-data-visualization/
│
├── platform/                    # Static portal (login + app launcher)
│   ├── login.html               # Microsoft SSO login page
│   └── index.html               # Post-login portal with app links
│
├── src/                         # React frontend (data dashboard)
│   ├── main.tsx                 # App entry point
│   ├── App.tsx                  # Router + providers setup
│   ├── index.css                # Global styles
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx        # Main charts & KPI dashboard
│   │   ├── Trends.tsx           # Semester-over-semester trends
│   │   ├── Consultants.tsx      # Consultant directory (card/table)
│   │   └── Settings.tsx         # Theme settings
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   └── Charts.tsx       # All chart components
│   │   ├── trends/
│   │   │   ├── TrendCards.tsx           # KPI change cards
│   │   │   ├── TrendCharts.tsx          # Trend line/area charts
│   │   │   └── PromotionsDropsCards.tsx # Promotions, drops, deferrals
│   │   ├── filters/
│   │   │   └── FilterBar.tsx    # Semester & project filter dropdowns
│   │   └── layout/
│   │       ├── MainLayout.tsx   # Sidebar + main content wrapper
│   │       └── Sidebar.tsx      # Navigation sidebar
│   │
│   ├── hooks/
│   │   └── useDashboardData.ts  # React Query hooks for all API calls
│   │
│   ├── services/
│   │   ├── api.ts               # Real API client (axios)
│   │   └── mockApi.ts           # Mock data for development/testing
│   │
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces & types
│   │
│   └── context/
│       └── ThemeContext.tsx      # Dark/light mode provider
│
├── server/                      # Express backend
│   ├── src/
│   │   ├── index.ts             # Server entry, route mounting, static serving
│   │   ├── routes/
│   │   │   ├── api.ts           # All data API endpoints (~900 lines of SQL)
│   │   │   └── auth.ts          # Azure SSO + JWT auth endpoints
│   │   └── config/
│   │       └── db.ts            # PostgreSQL connection pool
│   ├── .env                     # Server environment variables (do not commit)
│   ├── package.json
│   └── tsconfig.json
│
├── index.html                   # React app HTML entry
├── vite.config.ts               # Vite build configuration
├── package.json                 # Frontend dependencies & scripts
├── tsconfig.json
└── .env                         # Frontend environment variables
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm
- Access to the GCP Cloud SQL database (VPN or allowlisted IP may be required)

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd server && npm install
```

### 2. Configure Environment Variables

Fill in the env files — see [Environment Variables](#environment-variables) below for what each value does.

### 3. Run the Development Servers

Open two terminals:

```bash
# Terminal 1: Backend (http://localhost:3000)
cd server
npm run dev

# Terminal 2: Frontend (http://localhost:5173)
npm run dev
```

### 4. Open the App

- **Portal (login)**: `http://localhost:3000/login.html` — served by the Express server
- **Data Dashboard**: `http://localhost:5173` — served by Vite dev server

> The portal **must** be opened through the Express server (`localhost:3000`) so that the `/auth/login` and `/auth/redirect` SSO routes work correctly. Opening `login.html` directly as a local file will break all API calls.

---

## Environment Variables

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3000/api
```

### Backend (`server/.env`)

```env
# PostgreSQL (GCP Cloud SQL)
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=34.60.188.54
DB_NAME=ibc
DB_PORT=5432
DB_SSL=true

# Microsoft Azure SSO
AZURE_CLIENT_ID=your_azure_client_id
AZURE_TENANT_ID=your_azure_tenant_id          # UIUC tenant
AZURE_CLIENT_SECRET=your_azure_client_secret
REDIRECT_URI=http://localhost:3000/auth/redirect

# JWT
JWT_SECRET=your_256bit_hex_secret

# Optional
PORT=3000
```

---

## How Authentication Works

The platform uses **Microsoft Azure SSO** (UIUC tenant) with JWT session tokens.

### Full Login Flow

```
1. User visits http://localhost:3000/login.html
2. Clicks "Continue with UIUC Microsoft"
3. GET /auth/login  →  server generates Azure auth URL via MSAL
4. Browser redirected to Microsoft login (UIUC account)
5. Microsoft redirects back to GET /auth/redirect?code=...
6. Server exchanges auth code for access token
7. Extracts email from token
8. Queries: SELECT * FROM users WHERE email = ?
   - Not found → redirect to login.html?error=unauthorized
   - Found     → sign JWT (8hr expiry) with { email, name, role }
9. Redirect to platform/index.html?token=...
10. index.html stores JWT in localStorage, parses role
11. Role-based UI: SD/SM roles see the Staffing Tool link
```

### JWT Payload

```json
{
  "email": "user@illinois.edu",
  "name": "First Last",
  "role": "SC",
  "exp": 1234567890
}
```

### Role-Based Access

| Role | Description | Staffing Tool Access |
|------|-------------|---------------------|
| NC | New Consultant | No |
| EC | Experienced Consultant | No |
| SC | Senior Consultant | No |
| PM | Project Manager | No |
| SM | Senior Manager | Yes |
| SD | Senior Director | Yes |

---

## API Reference

**Base URL**: `http://localhost:3000/api`

### Data Endpoints

#### `GET /semesters`
Returns all available semesters.

**Response**:
```json
[{ "semester_id": "S25", "display_name": "Spring 2025" }]
```

---

#### `GET /projects`
Returns all projects, optionally filtered by semester.

**Query Params**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `semesterId` | string | No | Filter by semester (e.g. `S25`) |

---

#### `GET /consultants`
Returns all consultants with demographics.

**Response fields**: `user_id`, `email`, `name`, `gender`, `curr_role`, `year`, `major`, `college`

---

#### `GET /stats`
Returns aggregated dashboard statistics for a given semester and optional project filter.

**Query Params**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `semesterId` | string | Yes | Semester to aggregate (e.g. `S25`) |
| `projects` | string | No | Comma-separated project IDs (e.g. `1,3,7`) |

**Response** (`DashboardStats`):
```json
{
  "totalConsultants": 85,
  "activeConsultants": 72,
  "totalProjects": 12,
  "roleDistribution": [{ "role": "SC", "count": 30 }],
  "genderDistribution": [{ "gender": "Male", "count": 45 }],
  "demographicDistribution": [{ "year": "Junior", "count": 25 }],
  "majorDistribution": [{ "major": "Computer Science", "count": 20 }],
  "collegeDistribution": [{ "college": "Grainger", "count": 35 }],
  "projectStaffing": [{ "project_name": "Project A", "count": 8 }]
}
```

---

#### `GET /stats/compare`
Returns semester-over-semester comparison with deltas.

**Query Params**:
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `semesters` | string | Yes | Comma-separated semester IDs, min 2 (e.g. `F24,S25`) |

---

### Mock Data Endpoints (Development/Testing)

| Route | Description |
|-------|-------------|
| `GET /mock/stats/compare` | Mock semester comparison (S24, F24, S25) |
| `GET /mock/promotions` | Mock role transitions between semesters |
| `GET /mock/drops` | Mock consultants who resigned or were let go |
| `GET /mock/deferrals` | Mock consultants who took time off |

---

### Auth Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/auth/login` | Initiates Azure SSO redirect |
| `GET` | `/auth/redirect` | SSO callback — exchanges code for JWT |
| `POST` | `/api/auth/login` | Email-based login check (fallback) |

---

### Health Check

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/health` | Checks DB connectivity |

---

## Database Schema

**Host**: GCP Cloud SQL at `34.60.188.54`  
**Database**: `ibc`  
**SSL**: Required

### Tables

#### `users`
| Column | Type | Description |
|--------|------|-------------|
| `user_id` | PK | Unique user identifier |
| `email` | string | UIUC email (used for SSO match) |
| `name` | string | Full name |
| `gender` | string | Gender |
| `curr_role` | string | Current role (NC, EC, SC, PM, SM, SD) |

#### `consultants`
| Column | Type | Description |
|--------|------|-------------|
| `user_id` | FK → users | Links to user record |
| `year` | string | Academic year (Freshman, Sophomore, Junior, Senior, Master's) |
| `major` | string | Major name |
| `college` | string | College (Grainger, Gies, LAS, etc.) |

#### `projects`
| Column | Type | Description |
|--------|------|-------------|
| `project_id` | PK | Unique project identifier |
| `project_name` | string | Project display name |
| `project_semester` | string | Semester the project ran (e.g. `S25`) |
| `client_name` | string | Client name |

#### `consultant_projects`
| Column | Type | Description |
|--------|------|-------------|
| `user_id` | FK → users | Consultant assigned |
| `project_id` | FK → projects | Project assigned to |
| `role` | string | Role on this specific project |

### Key Relationships
- A user can be assigned to multiple projects (many-to-many via `consultant_projects`)
- A consultant without a project assignment is still included in stats via `curr_role`
- Semester filtering is done through `projects.project_semester`

---

## Frontend Pages & Components

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/` | KPI cards + charts filtered by semester & project |
| Trends | `/trends` | Semester-over-semester comparison & trend lines |
| Consultants | `/consultants` | Searchable/filterable consultant directory |
| Settings | `/settings` | Theme toggle |

### Chart Components (`src/components/dashboard/Charts.tsx`)

| Component | Type | Shows |
|-----------|------|-------|
| `RoleDistributionChart` | Bar chart | NC, EC, SC, PM, SM, SD counts |
| `GenderChart` | Donut chart | Male, Female, Other, Unknown |
| `DemographicChart` | Bar chart | Freshman → Master's distribution |
| `MajorDistributionChart` | Horizontal bar | Major categories (expandable to modal) |
| `CollegeDistributionChart` | Donut chart | College distribution |
| `ProjectStaffingChart` | Horizontal bar | Per-project headcount (click to filter) |

### Trend Components (`src/components/trends/`)

| Component | Description |
|-----------|-------------|
| `TrendCard` | KPI with % change vs previous semester |
| `ConsultantsTrendChart` | Area chart of consultant count over time |
| `ProjectsTrendChart` | Area chart of project count over time |
| `GenderTrendChart` | Grouped bar chart of gender over time |
| `RoleTrendChart` | Grouped bar chart of roles over time |
| `GradeTrendChart` | Multi-line chart for year levels over time |
| `PromotionsChart` | Stacked bar of role transitions |
| `DropsChart` | Donut chart of departures by reason |
| `DeferralsChart` | Bar chart of deferrals by role |

---

## Data Flow

```
User selects semester in FilterBar
        ↓
URL params updated: ?semester=S25
        ↓
useDashboardStats('S25') hook triggered (React Query)
        ↓
GET /api/stats?semesterId=S25
        ↓
Express → PostgreSQL aggregation queries
        ↓
JSON response: DashboardStats
        ↓
Charts render with data
        ↓
User clicks a bar in ProjectStaffingChart
        ↓
URL updated: ?semester=S25&projects=1,3
        ↓
Stats refetched with project filter applied
        ↓
All charts update to show scoped data
```

React Query caches responses by `[queryKey, semesterId, projectIds]`. Default stale time: 5 minutes.

---

## NPM Scripts

### Frontend (root)

```bash
npm run dev       # Start Vite dev server at http://localhost:5173
npm run build     # TypeScript compile + Vite production build → dist/
npm run preview   # Preview production build locally
npm run lint      # Run ESLint
```

### Backend (`server/`)

```bash
npm run dev       # nodemon watch mode — auto-restarts on file changes
npm run build     # Compile TypeScript → dist/
npm start         # Run compiled production server (node dist/index.js)
```
