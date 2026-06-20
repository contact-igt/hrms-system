# HRMS API

Express and TypeScript backend for the HRMS monorepo.

## Stack

- Express 5
- MySQL 8
- Drizzle ORM and Drizzle Kit migrations
- JWT access and rotating refresh tokens
- bcrypt password hashing
- Zod request validation

## Local Setup

### 1. Start MySQL

The Windows service is named `MySQL80` on this machine and uses the standard
MySQL port `3306`. Start MySQL 8 from Windows Services or an elevated
PowerShell:

```powershell
Start-Service MySQL80
```

### 2. Create the database and user

Run in MySQL Workbench or the MySQL command-line client:

```sql
CREATE DATABASE hrms
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE USER 'hrms_user'@'localhost' IDENTIFIED BY 'replace-with-password';
GRANT ALL PRIVILEGES ON hrms.* TO 'hrms_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Configure environment variables

Copy the API environment example and set real values:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Do not commit `apps/api/.env`.

### 4. Apply the schema

```powershell
npm run db:migrate
```

### 5. Bootstrap the Platform Super Admin

Set these values in `apps/api/.env`:

```env
PLATFORM_ADMIN_EMAIL=admin@example.com
PLATFORM_ADMIN_PASSWORD=use-a-strong-password
PLATFORM_ADMIN_FIRST_NAME=Platform
PLATFORM_ADMIN_LAST_NAME=Admin
```

Then run:

```powershell
npm run bootstrap:platform
```

This command seeds roles and permissions and safely creates or updates the
Platform Super Admin.

### 6. Start frontend and backend

From the repository root:

```powershell
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:5050`
- Health check: `http://localhost:5050/api/v1/health`
- Platform login: `http://localhost:5173/platform/login`
- Organization login: `http://localhost:5173/login`

## Main API Areas

```text
/api/v1/auth
/api/v1/platform
/api/v1/organization
/api/v1/employees
```

Platform and organization routes use separate JWT scopes. Every
organization-owned query derives `organizationId` from the authenticated
membership instead of trusting a client-supplied tenant ID.
