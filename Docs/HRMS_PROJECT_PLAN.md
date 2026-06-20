# HRMS Monorepo Project Plan

> Detailed authentication specification:
> [AUTHENTICATION.md](./AUTHENTICATION.md)

## 1. Project Goal

Build a secure, maintainable Human Resource Management System (HRMS) with the frontend, backend, shared code, and project documentation in one repository.

The system should support:

- Multiple organizations with isolated data
- Platform-level organization management
- Organization administrator onboarding
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
| Database | MySQL 8 |
| Database toolkit | Drizzle ORM with `mysql2` |
| File and image storage | Cloudflare R2 |
| R2 client | AWS SDK for JavaScript v3 |
| Authentication | JWT access token and rotating JWT refresh token |
| API documentation | Swagger / OpenAPI |
| Testing | Vitest, React Testing Library, Supertest, Playwright |
| Monorepo | pnpm workspaces and Turborepo |
| Code quality | ESLint, Prettier, Husky, lint-staged |
| Deployment | GitHub Actions, Node.js process manager, Nginx |

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
│   │       │   ├── organizations/
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
│       ├── database/
│       │   ├── migrations/
│       │   ├── schema/
│       │   ├── connection.ts
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
│       │   │   ├── organizations/
│       │   │   ├── users/
│       │   │   ├── employees/
│       │   │   ├── departments/
│       │   │   ├── attendance/
│       │   │   ├── leave/
│       │   │   ├── payroll/
│       │   │   ├── recruitment/
│       │   │   ├── performance/
│       │   │   ├── storage/
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
│   └── nginx/
│
├── .github/
│   └── workflows/
│
├── apps/
│   ├── api/
│   │   └── .env.example
│   └── web/
│       └── .env.example
├── .gitignore
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

Controllers must not contain business logic or direct Drizzle/MySQL queries.

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

### Management hierarchy

```text
Platform Super Admin
    -> creates and manages organizations
    -> invites the first Organization Admin

Organization Admin
    -> configures their organization
    -> creates departments and designations
    -> invites or adds employees
    -> assigns organization-level roles

Manager / HR / Payroll / Recruiter
    -> performs assigned organization work

Employee
    -> accesses only personal and permitted organization data
```

The Platform Super Admin is not an employee of each organization. Platform
access and organization access are separate authorization scopes.

### Initial roles

| Role | Main Access |
|---|---|
| Platform Super Admin | Create, activate, suspend, and view organizations |
| Organization Admin | Full administration inside one organization |
| HR Admin | Employees, leave, attendance, and recruitment in one organization |
| Manager | Team records, approvals, reviews |
| Employee | Own profile, attendance, leave, payslips |
| Payroll Officer | Payroll data and payroll processing |
| Recruiter | Jobs, candidates, interviews |

Use permission codes instead of hard-coding only role names:

```text
platform.organization.create
platform.organization.read
platform.organization.update
platform.organization.suspend

organization.settings.manage
organization.admin.invite
organization.user.manage

employee.read
employee.create
employee.update
leave.request
leave.approve
payroll.process
payroll.read_own
```

Platform permissions are valid only on platform routes. Organization permissions
are valid only for the user's active organization. The backend must enforce
every permission and organization scope. Frontend checks are only for user
experience.

---

## 7. Organization Creation and Onboarding Workflow

```text
Platform Super Admin logs in
  -> Creates an organization
  -> Enters organization name, code, domain, and admin email
  -> System creates the organization as PENDING
  -> System invites the Organization Admin
  -> Organization Admin verifies OTP and sets a password
  -> Organization becomes ACTIVE
  -> Organization Admin configures departments and designations
  -> Organization Admin invites or adds employees
  -> Employees activate their accounts and log in
```

Organization statuses:

```text
PENDING
ACTIVE
SUSPENDED
ARCHIVED
```

Employee onboarding methods:

- Email invitation
- Manual employee creation followed by activation
- CSV import followed by invitations
- Approved company-domain registration, if enabled

Only the Platform Super Admin may create an organization. Only an Organization
Admin or authorized HR user may add employees inside that organization.

---

## 8. Important Database Entities

```text
Organization
OrganizationSettings
OrganizationMembership
OrganizationInvitation
User
Role
Permission
RolePermission
Employee
EmployeeDocument
FileAsset
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

- Add `organizationId` to every organization-owned record, including employees,
  departments, attendance, leave, payroll, recruitment, and notifications.
- Filter every organization query by the authenticated `organizationId`.
- Use a separate platform authorization guard for Platform Super Admin routes.
- Make employee codes unique per organization.
- Allow only one membership for each `userId + organizationId`.
- Use UUIDs for public entity identifiers.
- Include `createdAt` and `updatedAt`.
- Use soft deletion only where records must be recoverable.
- Store timestamps in UTC.
- Keep salary and sensitive personal data protected.
- Add indexes for employee code, email, dates, status, and foreign keys.
- Use database transactions for approvals, payroll, and balance updates.
- Store only file metadata and the R2 object key in MySQL. Do not store image
  or document binary data in the database.

---

## 9. Image and File Storage

Use Cloudflare R2 for:

- Organization logos
- Employee profile photos
- Candidate profile photos and resumes
- Employee documents
- Generated payslips and reports
- Announcement attachments

Keep the R2 bucket private. Sensitive HR files must be accessed only through
short-lived presigned URLs generated by the backend after permission checks.

Recommended object-key structure:

```text
organizations/{organizationId}/logos/{fileId}.{extension}
organizations/{organizationId}/employees/{employeeId}/profile/{fileId}.{extension}
organizations/{organizationId}/employees/{employeeId}/documents/{fileId}.{extension}
organizations/{organizationId}/candidates/{candidateId}/{fileId}.{extension}
organizations/{organizationId}/payslips/{year}/{month}/{fileId}.pdf
```

Upload workflow:

```text
Frontend requests upload permission
  -> API validates user, organization, file type, and size
  -> API creates FileAsset record with PENDING status
  -> API returns a short-lived presigned PUT URL
  -> Frontend uploads directly to Cloudflare R2
  -> Frontend confirms completion
  -> API verifies metadata and marks FileAsset ACTIVE
```

Download workflow:

```text
User requests a file
  -> API checks role, ownership, and organizationId
  -> API creates a short-lived presigned GET URL
  -> User downloads directly from Cloudflare R2
```

Suggested `FileAsset` fields:

```text
id
organizationId
ownerType
ownerId
category
originalName
objectKey
contentType
sizeBytes
status
uploadedBy
createdAt
deletedAt
```

Storage rules:

- Never store R2 credentials in the frontend.
- Generate object keys on the backend.
- Include `organizationId` in every object key and metadata record.
- Allow only approved MIME types and file extensions.
- Set separate size limits for images, documents, resumes, and payslips.
- Configure R2 CORS for the trusted frontend origins.
- Use short expiration times for upload and download URLs.
- Treat presigned URLs like temporary bearer credentials.
- Remove or quarantine invalid uploads.
- Use lifecycle policies for abandoned `PENDING` uploads where appropriate.
- Keep organization logos private by default; expose them publicly only when
  there is a clear product requirement.

Storage endpoints:

```http
POST   /api/v1/files/upload-url
POST   /api/v1/files/:id/complete
GET    /api/v1/files/:id/download-url
DELETE /api/v1/files/:id
```

---

## 10. API Design

Base path:

```text
/api/v1
```

Example endpoints:

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout

GET    /api/v1/platform/organizations
POST   /api/v1/platform/organizations
GET    /api/v1/platform/organizations/:id
PATCH  /api/v1/platform/organizations/:id
PATCH  /api/v1/platform/organizations/:id/status
POST   /api/v1/platform/organizations/:id/admin-invitations

GET    /api/v1/organization
PATCH  /api/v1/organization
GET    /api/v1/organization/members
POST   /api/v1/organization/employee-invitations
POST   /api/v1/organization/employees/import

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

## 11. Security Checklist

- Hash passwords with Argon2 or bcrypt.
- Keep JWT access tokens short-lived and in frontend memory.
- Keep JWT refresh tokens in secure, HTTP-only, same-site cookies.
- Use separate signing secrets for access and refresh JWTs.
- Rotate refresh JWTs and revoke the related session after token reuse.
- Validate JWT signature, issuer, audience, expiry, type, and session.
- Apply role and permission middleware.
- Enforce `organizationId` isolation in services and repositories.
- Keep platform routes separate from organization routes.
- Never trust an `organizationId` supplied by the browser without verifying the
  authenticated membership.
- Audit organization creation, suspension, admin invitations, and role changes.
- Configure CORS for known frontend origins.
- Add Helmet and rate limiting.
- Protect authentication endpoints from brute-force attempts.
- Validate file type, size, and extension for uploads.
- Keep Cloudflare R2 buckets private.
- Generate short-lived presigned URLs only after permission and tenant checks.
- Never expose R2 access keys or secret keys to the frontend.
- Prevent users from choosing arbitrary R2 object keys.
- Store secrets only in environment variables.
- Redact passwords, tokens, salary data, and personal data from logs.
- Record important actions in immutable audit logs.
- Back up the MySQL database regularly.
- Add multi-factor authentication later for privileged roles.

---

## 12. Development Environments

Maintain separate environments:

```text
development
test
staging
production
```

Keep backend secrets in `apps/api/.env` and browser-visible settings in
`apps/web/.env`. Each application should provide its own `.env.example`
without real secrets.

```env
# apps/api/.env
NODE_ENV=development
API_PORT=5050
DATABASE_URL=mysql://hrms_user:password@localhost:3306/hrms
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
R2_UPLOAD_URL_EXPIRES_IN_SECONDS=300
R2_DOWNLOAD_URL_EXPIRES_IN_SECONDS=300
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=14d
JWT_ISSUER=hrms-api
JWT_AUDIENCE=hrms-web
WEB_URL=http://localhost:5173

# apps/web/.env
VITE_API_URL=/api/v1
```

---

## 13. Testing Strategy

| Test | Purpose |
|---|---|
| Unit tests | Services, utilities, validation, calculations |
| Integration tests | API endpoints and database behavior |
| Component tests | Forms, tables, permissions, UI states |
| End-to-end tests | Login, employee creation, leave approval, payroll |

High-priority test cases:

- Platform Super Admin organization creation
- Organization Admin invitation and activation
- Employee invitation and onboarding
- Cross-organization access rejection
- Suspended organization login rejection
- Cross-organization file access rejection
- Invalid file type and oversized upload rejection
- Expired upload/download URL handling
- Authentication and token renewal
- Permission rejection
- Leave balance calculation
- Attendance calculation
- Payroll calculation and rounding
- Duplicate employee/email prevention
- Approval workflows
- Audit-log creation

---

## 14. CI/CD Pipeline

Every pull request should run:

1. Install dependencies using the lockfile.
2. Check formatting.
3. Run ESLint.
4. Run TypeScript type checking.
5. Run unit and integration tests.
6. Build frontend and backend.
7. Check Drizzle migrations.
8. Run end-to-end smoke tests when appropriate.

Deploy only after all required checks pass. Run database migrations as a controlled deployment step.

---

## 15. Implementation Roadmap

### Phase 0 — Foundation

- Initialize pnpm workspace and Turborepo.
- Create `web`, `api`, and shared packages.
- Configure TypeScript, ESLint, Prettier, and Husky.
- Configure MySQL, Drizzle ORM, and the `mysql2` driver.
- Configure private Cloudflare R2 storage and its CORS policy.
- Add logging, error handling, health check, and Swagger.

### Phase 1 — Authentication and Organization

- Platform Super Admin bootstrap and login
- Organization creation and status management
- Organization Admin invitation and activation
- Login, logout, JWT refresh rotation, OTP, and forgot/reset password
- Platform and organization roles and permissions
- Organization settings and tenant isolation
- Audit logs

### Phase 2 — Employee Management

- Organization Admin and HR employee onboarding
- Employee invitations and optional CSV import
- Employee profiles
- Departments and designations
- Employment history
- Emergency contacts
- Document uploads
- Employee photos and documents stored in Cloudflare R2
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

## 16. MVP Scope

Build this first:

1. Platform Super Admin and organization management
2. Organization Admin invitation and organization setup
3. Employee onboarding and role-based access
4. Employee, department, and designation management
5. Leave request and approval workflow
6. Attendance records
7. Basic payroll and payslips
8. Audit logs and role-specific dashboards

Keep recruitment, advanced performance management, mobile apps, biometrics, and complex analytics outside the first MVP.

---

## 17. Team Workflow

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

## 18. First Development Tasks

- [ ] Initialize Git and add the root README.
- [ ] Configure pnpm workspaces and Turborepo.
- [ ] Create React TypeScript frontend.
- [ ] Create Express TypeScript backend.
- [ ] Add shared TypeScript and Zod package.
- [ ] Install MySQL 8 locally and create the HRMS database and user.
- [ ] Configure Drizzle ORM, `mysql2`, and the initial schema.
- [ ] Create a private Cloudflare R2 bucket and restricted API credentials.
- [ ] Add the FileAsset model and storage module.
- [ ] Implement presigned upload, download, and delete workflows.
- [ ] Add Organization, Membership, Invitation, Role, and Permission models.
- [ ] Add health-check endpoint.
- [ ] Add centralized error handling and logging.
- [ ] Bootstrap the first Platform Super Admin securely.
- [ ] Implement organization creation and Organization Admin invitation.
- [ ] Implement platform and organization authorization guards.
- [ ] Add organization filtering to all tenant repositories.
- [ ] Build the employee module end to end.
- [ ] Add CI checks.
- [ ] Create staging deployment.

---

## 19. Architecture Principles

1. Start as a modular monolith.
2. Keep business logic out of controllers and UI components.
3. Share schemas and types only when they represent the same contract.
4. Treat security and auditability as core HRMS features.
5. Use migrations for every database change.
6. Keep payroll calculations deterministic and well tested.
7. Add complexity only after a real requirement appears.
8. Deliver one complete feature vertically—from database to UI—before opening too many parallel modules.
9. Treat the platform and each organization as separate authorization scopes.
10. Never access organization-owned data without an authenticated membership
    and `organizationId` filter.
11. Store file metadata in MySQL and file content in private Cloudflare R2.
