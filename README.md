# CMC Global

Fleet and driver operations platform for CMC Global. The system covers driver onboarding, recruitment, induction, compliance, customer management, and day-to-day driver self-service.

## Overview

CMC Global is a full-stack TypeScript application:

- **Frontend:** Angular 18 with Angular Material, Bootstrap, SSR, JWT auth, and role-based access.
- **Backend:** Node.js, Express, and TypeScript with MongoDB, JWT authentication, file uploads, Swagger, and third-party integrations (email, SMS, e-sign, and verification services).

## Features

- Driver portal for jobs, documents, contracts, payslips, IRP5s, banking details, vehicle inspections, incidents, notices, and queries
- Admin recruitment pipeline, applications, candidate matching, and induction workflows
- Customer, checklist, calendar, AOD, disciplinary, and offboarding management
- Role-based permissions, email templates, and configurable master data (regions, vehicle types, license codes, and more)
- Document upload and static file serving

## Project structure

```text
cmc-global/
├── backend/     # Express API (TypeScript)
└── frontend/    # Angular 18 web app
```

## Prerequisites

- Node.js 18 or later
- npm
- MongoDB 6 or later running locally or remotely

## Getting started

### 1. Backend

```bash
cd backend
cp config/config.example.ts config/config.ts
npm install
npm run dev
```

The API starts on `http://localhost:3000`. Update `backend/config/config.ts` with your MongoDB credentials, JWT secrets, and any optional integration keys. That file is gitignored and must never be committed.

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

The Angular app starts on `http://localhost:4200` and proxies `/api/` and `/files/` to `http://localhost:3000`.

## Configuration

Copy `backend/config/config.example.ts` to `backend/config/config.ts` and fill in:

| Setting | Purpose |
| --- | --- |
| `secret` / `refreshTokenSecret` | JWT signing secrets |
| `db` | MongoDB host, database name, and credentials |
| `SENDGRID_API_KEY` / `MAILGUN_*` / `smtp` | Outbound email |
| `sms`, `signNow`, `selfie`, `licenseDisc`, `dot360` | Optional operational integrations |

Do not place production secrets in the repository. Use local config files or environment-specific deployment secrets.

## Scripts

| Location | Command | Description |
| --- | --- | --- |
| backend | `npm run dev` | Start the API with live reload |
| backend | `npm run build` | Compile TypeScript |
| backend | `npm run lint` | Run ESLint |
| frontend | `npm start` | Serve the Angular app with proxy |
| frontend | `npm run build` | Production build |

## Security notes

- `backend/config/config.ts` is ignored by Git
- Uploaded files under `backend/files/` are ignored
- Environment files (`.env`, `.env.*`) are ignored
- Rotate any keys that were previously stored in local backups before using this codebase in production
