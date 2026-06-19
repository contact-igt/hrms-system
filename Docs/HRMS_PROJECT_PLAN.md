# HRMS Monorepo Project Plan

> Detailed authentication specification:
> [AUTHENTICATION.md](./AUTHENTICATION.md)

## 1. Project Goal

Build a secure, maintainable Human Resource Management System (HRMS) with the frontend, backend, shared code, and project documentation in one repository.

The system should support:

- Employee management
- Departments and designations
- Attendance and shifts
- Leave management and approvals
- Payroll
- Recruitment
- Performance reviews
- Documents and announcements
- Role-based access control
- Reports, audit logs, and notifications

---

## 2. Recommended Technology Stack

| Area | Technology |
|---|---|
| Frontend | React, Vite, TypeScript |
| UI | CSS and a reusable component library |
| State | TanStack Query for server state, Zustand for small client state |
| Forms | React Hook Form and Zod |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Access token and refresh token using secure HTTP-only cookies |
| API documentation | Swagger / OpenAPI |
| Testing | Vitest, React Testing Library, Supertest, Playwright |
| Monorepo | pnpm workspaces and Turborepo |
| Code quality | ESLint, Prettier, Husky, lint-staged |
| Deployment | Docker, GitHub Actions, Nginx |

> Start with a modular monolith. Do not split the backend into microservices until the application has a proven scaling requirement.

---

## 3. Repository Structure

```text
hrms-project/
├── apps/
│   ├── web/                        # React frontend
│   │   ├── public/
│   │   └── src/
│   │       ├── app/               # Router, providers, app configuration
│   │       ├── assets/
│   │       ├── components/        # Application-wide components
│   │       ├── features/          # Business features
│   │       │   ├── auth/
│   │       │   ├── employees/
│   │       │   ├── attendance/
│   │       │   ├── leave/
│   │       │   ├── payroll/
│   │       │   └── recruitment/
│   │       ├── hooks/
│   │       ├── layouts/
│   │       ├── lib/               # API client and utility configuration
│   │       ├── pages/
│   │       ├── routes/
│   │       ├── stores/
│   │       ├── styles/
│   │       ├── types/
│   │       └── main.tsx
│   │
│   └── api/                        # Node.js backend
│       ├── prisma/
│       │   ├── migrations/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       ├── src/
│       │   ├── config/
│       │   ├── common/
│       │   │   ├── constants/
│       │   │   ├── errors/
│       │   │   ├── middleware/
│       │   │   ├── types/
│       │   │   └── utils/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── employees/
│       │   │   ├── departments/
│       │   │   ├── attendance/
│       │   │   ├── leave/
│       │   │   ├── payroll/
│       │   │   ├── recruitment/
│       │   │   ├── performance/
│       │   │   ├── notifications/
│       │   │   └── audit/
│       │   ├── jobs/               # Scheduled/background jobs
│       │   ├── app.ts
│       │   └── server.ts
│       └── tests/
│
├── packages/
│   ├── shared/                     # Shared types, schemas, and constants
│   ├── ui/                         # Reusable UI components
│   ├── eslint-config/
│   └── tsconfig/
│
├── docs/
│   ├── architecture.md
│   ├── database.md
│   ├── api.md
│   └── decisions/                  # Architecture decision records
│
├── infrastructure/
│   ├── docker/
│   └── nginx/
│
├── .github/
│   └── workflows/
│
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

---

## 4. Backend Module Pattern

Keep every business module independent:

```text
modules/employees/
├── employee.routes.ts
├── employee.controller.ts
├── employee.service.ts
├── employee.repository.ts
├── employee.validation.ts
├── employee.types.ts
└── employee.test.ts
```

Responsibilities:

- **Routes:** URL and middleware configuration
- **Controller:** HTTP request and response handling
- **Service:** Business rules and transactions
- **Repository:** Database access
- **Validation:** Request validation using Zod
- **Types:** Module-specific TypeScript types
- **Tests:** Module unit and integration tests

Controllers must not contain business logic or direct Prisma queries.

---

## 5. Frontend Feature Pattern

```text
features/employees/
├── api/
│   ├── employee.api.ts
│   └── employee.queries.ts
├── components/
├── hooks/
├── pages/
├── schemas/
├── types/
└── index.ts
```

Guidelines:

- Organize code by business feature, not only by file type.
- Use TanStack Query for API data and caching.
- Keep global state small.
- Validate forms with the same shared Zod rules when practical.
- Lazy-load major routes.
- Place generic components in `packages/ui`.

---

## 6. Core Roles and Permissions

Initial roles:

| Role | Main Access |
|---|---|
| Super Admin | Full system and organization settings |
| HR Admin | Employees, leave, attendance, payroll, recruitment |
| Manager | Team records, approvals, reviews |
| Employee | Own profile, attendance, leave, payslips |
| Payroll Officer | Payroll data and payroll processing |
| Recruiter | Jobs, candidates, interviews |

Use permission codes instead of hard-coding only role names:

```text
employee.read
employee.create
employee.update
leave.request
leave.approve
payroll.process
payroll.read_own
```

The backend must enforce every permission. Frontend permission checks are only for user experience.

---

## 7. Important Database Entities

```text
Organization
User
Role
Permission
RolePermission
Employee
EmployeeDocument
Department
Designation
EmploymentHistory
Shift
Attendance
LeaveType
LeaveBalance
LeaveRequest
Holiday
PayrollCycle
SalaryStructure
PayrollRecord
Payslip
JobOpening
Candidate
Interview
PerformanceReview
Notification
AuditLog
```

Important database rules:

- Use UUIDs for public entity identifiers.
- Include `createdAt` and `updatedAt`.
- Use soft deletion only where records must be recoverable.
- Store timestamps in UTC.
- Keep salary and sensitive personal data protected.
- Add indexes for employee code, email, dates, status, and foreign keys.
- Use database transactions for approvals, payroll, and balance updates.

---

## 8. API Design

Base path:

```text
/api/v1
```

Example endpoints:

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

GET    /api/v1/employees
POST   /api/v1/employees
GET    /api/v1/employees/:id
PATCH  /api/v1/employees/:id

GET    /api/v1/leave-requests
POST   /api/v1/leave-requests
PATCH  /api/v1/leave-requests/:id/approve
PATCH  /api/v1/leave-requests/:id/reject
```

Use one consistent response format:

```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {},
  "meta": {}
}
```

API standards:

- Validate every input.
- Support pagination, filtering, and sorting.
- Use correct HTTP status codes.
- Generate Swagger documentation.
- Add request IDs for tracing.
- Never expose stack traces or sensitive fields.

---

## 9. Security Checklist

- Hash passwords with Argon2 or bcrypt.
- Keep refresh tokens in secure, HTTP-only, same-site cookies.
- Apply role and permission middleware.
- Configure CORS for known frontend origins.
- Add Helmet and rate limiting.
- Protect authentication endpoints from brute-force attempts.
- Validate file type, size, and extension for uploads.
- Store secrets only in environment variables.
- Redact passwords, tokens, salary data, and personal data from logs.
- Record important actions in immutable audit logs.
- Back up the PostgreSQL database regularly.
- Add multi-factor authentication later for privileged roles.

---

## 10. Development Environments

Maintain separate environments:

```text
development
test
staging
production
```

The root `.env.example` should document variables without real secrets:

```env
NODE_ENV=development
WEB_PORT=5173
API_PORT=5000
DATABASE_URL=
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
WEB_URL=http://localhost:5173
API_URL=http://localhost:5000
```

---

## 11. Testing Strategy

| Test | Purpose |
|---|---|
| Unit tests | Services, utilities, validation, calculations |
| Integration tests | API endpoints and database behavior |
| Component tests | Forms, tables, permissions, UI states |
| End-to-end tests | Login, employee creation, leave approval, payroll |

High-priority test cases:

- Authentication and token renewal
- Permission rejection
- Leave balance calculation
- Attendance calculation
- Payroll calculation and rounding
- Duplicate employee/email prevention
- Approval workflows
- Audit-log creation

---

## 12. CI/CD Pipeline

Every pull request should run:

1. Install dependencies using the lockfile.
2. Check formatting.
3. Run ESLint.
4. Run TypeScript type checking.
5. Run unit and integration tests.
6. Build frontend and backend.
7. Check Prisma migrations.
8. Run end-to-end smoke tests when appropriate.

Deploy only after all required checks pass. Run database migrations as a controlled deployment step.

---

## 13. Implementation Roadmap

### Phase 0 — Foundation

- Initialize pnpm workspace and Turborepo.
- Create `web`, `api`, and shared packages.
- Configure TypeScript, ESLint, Prettier, Husky, and Docker.
- Configure PostgreSQL and Prisma.
- Add logging, error handling, health check, and Swagger.

### Phase 1 — Authentication and Organization

- Login, logout, refresh token, forgot/reset password
- User, role, and permission management
- Organization settings
- Audit logs

### Phase 2 — Employee Management

- Employee profiles
- Departments and designations
- Employment history
- Emergency contacts
- Document uploads
- Employee search, filters, and import/export

### Phase 3 — Leave and Attendance

- Shifts and holidays
- Clock-in and clock-out
- Attendance correction requests
- Leave types and balances
- Manager approval workflow

### Phase 4 — Payroll

- Salary structures and allowances
- Deductions and tax configuration
- Payroll cycles
- Payroll calculation and approval
- Payslip generation

### Phase 5 — Recruitment and Performance

- Job openings and candidates
- Interview scheduling
- Employee onboarding
- Goals and performance reviews

### Phase 6 — Reports and Production Readiness

- Dashboards and reports
- Email/in-app notifications
- Security review
- Performance testing
- Backups, monitoring, deployment, and recovery testing

---

## 14. MVP Scope

Build this first:

1. Authentication and role-based access
2. Employee, department, and designation management
3. Leave request and approval workflow
4. Attendance records
5. Basic payroll and payslips
6. Audit logs
7. Admin and employee dashboards

Keep recruitment, advanced performance management, mobile apps, biometrics, and complex analytics outside the first MVP.

---

## 15. Team Workflow

Suggested branches:

```text
main
develop
feature/employee-profile
fix/leave-balance
```

Commit examples:

```text
feat(employee): add employee creation endpoint
fix(leave): prevent negative leave balance
test(payroll): add salary calculation tests
docs(api): document authentication endpoints
```

Definition of done:

- Acceptance requirements are met.
- Input and permission checks are implemented.
- Tests cover important behavior.
- Lint, type checks, tests, and builds pass.
- API documentation is updated.
- Database migrations are reviewed.
- No secrets or sensitive data appear in code or logs.

---

## 16. First Development Tasks

- [ ] Initialize Git and add the root README.
- [ ] Configure pnpm workspaces and Turborepo.
- [ ] Create React TypeScript frontend.
- [ ] Create Express TypeScript backend.
- [ ] Add shared TypeScript and Zod package.
- [ ] Run PostgreSQL through Docker Compose.
- [ ] Configure Prisma and the initial schema.
- [ ] Add health-check endpoint.
- [ ] Add centralized error handling and logging.
- [ ] Implement authentication and authorization.
- [ ] Build the employee module end to end.
- [ ] Add CI checks.
- [ ] Create staging deployment.

---

## 17. Architecture Principles

1. Start as a modular monolith.
2. Keep business logic out of controllers and UI components.
3. Share schemas and types only when they represent the same contract.
4. Treat security and auditability as core HRMS features.
5. Use migrations for every database change.
6. Keep payroll calculations deterministic and well tested.
7. Add complexity only after a real requirement appears.
8. Deliver one complete feature vertically—from database to UI—before opening too many parallel modules.
