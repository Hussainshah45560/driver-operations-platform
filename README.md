# Driver Operations Platform

Full-stack workforce platform for driver onboarding, recruitment, compliance, and day-to-day self-service.

## Overview

This application is built with TypeScript across web and API layers:

- **Frontend:** Angular 18 with Angular Material, Bootstrap, SSR, JWT authentication, and role-based access.
- **Backend:** Node.js, Express, and TypeScript with MongoDB, JWT authentication, file uploads, Swagger, and optional email, SMS, e-sign, and verification integrations.

## Features

- Driver portal for jobs, documents, contracts, payslips, tax forms, banking details, vehicle inspections, incidents, notices, and queries
- Admin recruitment pipeline, applications, candidate matching, and induction workflows
- Customer, checklist, calendar, acknowledgement, disciplinary, and offboarding management
- Role-based permissions, email templates, and configurable master data
- Document upload and static file serving

## Project structure

```text
.
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
