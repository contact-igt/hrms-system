# HRMS Authentication and Management Plan

## 1. User Hierarchy

```text
Platform Super Admin
    -> creates Organization
    -> invites Organization Admin

Organization Admin
    -> configures their Organization
    -> adds HR, managers, payroll users, and employees

Employee
    -> activates account
    -> accesses permitted organization features
```

Rules:

- The Platform Super Admin is created through a secure bootstrap process.
- Public registration cannot create a Platform Super Admin.
- Only a Platform Super Admin can create an organization.
- Every organization must have at least one Organization Admin.
- An Organization Admin can manage users only inside their organization.
- Employees cannot choose their role during registration.
- Users from one organization cannot access another organization's data.
- Members cannot log in to a suspended organization.

---

## 2. Platform Super Admin

Main responsibilities:

- Create and view organizations
- Update or suspend organizations
- Invite the first Organization Admin
- View platform-level usage and audit logs

Endpoints:

```http
POST  /api/v1/auth/platform/login
GET   /api/v1/platform/organizations
POST  /api/v1/platform/organizations
GET   /api/v1/platform/organizations/:id
PATCH /api/v1/platform/organizations/:id
PATCH /api/v1/platform/organizations/:id/status
POST  /api/v1/platform/organizations/:id/admin-invitations
```

The Platform Super Admin must not automatically access employee, attendance,
leave, or payroll records inside organizations.

---

## 3. Organization Creation

```http
POST /api/v1/platform/organizations
```

Example request:

```json
{
  "name": "Acme Private Limited",
  "code": "ACME",
  "domain": "acme.com",
  "admin": {
    "firstName": "Priya",
    "lastName": "Shah",
    "email": "priya@acme.com"
  }
}
```

Workflow:

1. Authenticate the Platform Super Admin.
2. Validate the unique organization name, code, and domain.
3. Create the organization with status `PENDING`.
4. Create an Organization Admin invitation.
5. Send an invitation link and email OTP.
6. The Organization Admin verifies the OTP and creates a password.
7. Create their organization membership with `ORGANIZATION_ADMIN`.
8. Activate the admin and organization.

Organization statuses:

```text
PENDING
ACTIVE
SUSPENDED
ARCHIVED
```

---

## 4. Organization Admin

Main responsibilities:

- Update organization settings
- Create departments and designations
- Invite or add employees
- Import employees using CSV
- Assign organization-level roles
- Disable employee access

Endpoints:

```http
GET   /api/v1/organization
PATCH /api/v1/organization
GET   /api/v1/organization/members
POST  /api/v1/organization/employee-invitations
POST  /api/v1/organization/employees/import
PATCH /api/v1/organization/members/:id/role
PATCH /api/v1/organization/members/:id/status
```

The API obtains `organizationId` from the authenticated admin's membership. It
must not trust an organization ID sent by the frontend.

---

## 5. Employee Onboarding

The Organization Admin can invite an employee or create the employee record
before activation.

```http
POST /api/v1/organization/employee-invitations
POST /api/v1/employees
```

Example request:

```json
{
  "firstName": "Asha",
  "lastName": "Kumar",
  "email": "asha@acme.com",
  "employeeCode": "ACME-001",
  "departmentId": "department-uuid",
  "designationId": "designation-uuid",
  "role": "EMPLOYEE"
}
```

Workflow:

1. Verify that the admin has `organization.employee.invite`.
2. Create the employee in the admin's organization.
3. Create an invitation containing the approved role.
4. Email an activation link or OTP.
5. The employee verifies the OTP and creates a password.
6. Create the user's organization membership.
7. Activate the account and membership.

Only an Organization Admin or an authorized HR user can onboard employees.

---

## 6. Employee Registration

```http
POST /api/v1/auth/register
```

```json
{
  "firstName": "Asha",
  "lastName": "Kumar",
  "email": "asha@acme.com",
  "password": "secure-password",
  "invitationToken": "invitation-token"
}
```

Rules:

- Invitation-based registration is recommended.
- Confirm the invitation and organization are active.
- Use the organization and role stored in the invitation.
- Never accept a role or organization from an untrusted public request.
- Hash passwords with Argon2id or bcrypt.
- Keep the account pending until OTP verification.

---

## 7. OTP Verification

```http
POST /api/v1/auth/otp/verify
POST /api/v1/auth/otp/resend
```

```json
{
  "challengeId": "challenge-uuid",
  "purpose": "EMAIL_VERIFICATION",
  "otp": "123456"
}
```

OTP purposes:

```text
EMAIL_VERIFICATION
LOGIN
PASSWORD_RESET
```

Rules:

- Use a secure six-digit OTP.
- Expire it after 5 minutes.
- Allow a maximum of 5 attempts.
- Allow resend after 60 seconds.
- Store only an OTP digest.
- Invalidate the previous OTP after resend.
- Rate-limit by email, user, and IP address.

---

## 8. Login

### Organization login

```http
POST /api/v1/auth/organization/login
```

```json
{
  "email": "asha@acme.com",
  "password": "secure-password",
  "organizationCode": "ACME"
}
```

Workflow:

1. Validate the credentials.
2. Load the platform account or organization membership.
3. Confirm the user, membership, and organization are active.
4. Verify the password.
5. Load permissions for the active scope.
6. Create a session.
7. Return a JWT access token.
8. Set a rotating JWT refresh token in a secure HTTP-only cookie.

### OTP login

```http
POST /api/v1/auth/login/otp/request
POST /api/v1/auth/login/otp/verify
```

OTP login follows the same organization and account-status checks.

### Platform login

```http
POST /api/v1/auth/platform/login
```

```json
{
  "email": "admin@platform.com",
  "password": "secure-password"
}
```

Platform login rules:

- Use a separate `/platform/login` frontend page.
- Do not request or accept an organization code.
- Allow only securely bootstrapped `PLATFORM_SUPER_ADMIN` accounts.
- Issue a JWT with `scopeType: "PLATFORM"`.
- Redirect successful login to `/platform/organizations`.
- Platform login can create organizations and invite Organization Admins.
- It must not automatically access organization employee or payroll data.

---

## 9. JWT Authentication

Use two signed JSON Web Tokens:

| JWT | Lifetime | Storage | Purpose |
|---|---:|---|---|
| Access JWT | 10–15 minutes | Frontend memory | Authorize API requests |
| Refresh JWT | 7–30 days | Secure HTTP-only cookie | Issue a new token pair |

The frontend sends the access JWT with protected requests:

```http
Authorization: Bearer <access-jwt>
```

Do not store JWTs in `localStorage` or `sessionStorage`.

### Access JWT claims

Organization access JWT:

```json
{
  "sub": "user-uuid",
  "sid": "session-uuid",
  "type": "access",
  "scopeType": "ORGANIZATION",
  "organizationId": "organization-uuid",
  "membershipId": "membership-uuid",
  "iss": "hrms-api",
  "aud": "hrms-web",
  "iat": 1750000000,
  "exp": 1750000900,
  "jti": "jwt-uuid"
}
```

Platform access JWT:

```json
{
  "sub": "user-uuid",
  "sid": "session-uuid",
  "type": "access",
  "scopeType": "PLATFORM",
  "iss": "hrms-api",
  "aud": "hrms-web",
  "iat": 1750000000,
  "exp": 1750000900,
  "jti": "jwt-uuid"
}
```

Platform tokens must use platform routes. Organization tokens must use
organization-scoped routes.

### Refresh JWT workflow

```http
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/logout-all
```

1. Read the refresh JWT from the HTTP-only cookie.
2. Validate its signature, issuer, audience, type, and expiry.
3. Confirm that its `sid` belongs to an active database session.
4. Compare its hash or token identifier with the session record.
5. Recheck the user, membership, and organization status.
6. Revoke the current refresh JWT.
7. Generate a new access JWT and refresh JWT.
8. Store the new refresh-token hash and return the new token pair.

If an old rotated refresh JWT is reused, revoke the session and require login
again.

JWT rules:

- Use different strong secrets for access and refresh JWTs.
- Accept only the configured signing algorithm.
- Never trust claims before verifying the JWT signature.
- Do not include passwords, salary data, or unnecessary personal data.
- Keep roles and permissions out of long-lived tokens; load current access from
  the membership or a short-lived cache.
- Revoke sessions after logout, password reset, account suspension, role
  changes, or organization suspension.
- Access JWTs expire naturally; sensitive APIs should also verify the active
  session.

Configuration:

```env
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=14d
JWT_ISSUER=hrms-api
JWT_AUDIENCE=hrms-web
```

Other temporary credentials:

| Item | Lifetime | Storage |
|---|---:|---|
| OTP | 5 minutes | Digest in database |
| Reset ticket | 10–15 minutes | Hash in database |

---

## 10. Forgot and Reset Password

```http
POST /api/v1/auth/forgot-password
POST /api/v1/auth/forgot-password/verify-otp
POST /api/v1/auth/reset-password
```

```text
Submit email
  -> Send reset OTP
  -> Verify OTP
  -> Issue a one-time reset ticket
  -> Set new password
  -> Revoke all existing sessions
```

Do not reveal whether the submitted email exists.

---

## 11. SSO

Support Microsoft Entra ID and Google Workspace using OpenID Connect with PKCE.

```http
GET /api/v1/auth/sso/providers
GET /api/v1/auth/sso/:provider/start
GET /api/v1/auth/sso/:provider/callback
```

Rules:

- Validate state, nonce, PKCE, issuer, audience, and signature.
- Restrict approved Microsoft tenants or Google domains.
- Link SSO users to a pre-approved invitation or membership.
- Do not automatically create privileged accounts.
- Reject suspended users, memberships, or organizations.

---

## 12. Roles and Permissions

### Platform role

```text
PLATFORM_SUPER_ADMIN
```

### Organization roles

```text
ORGANIZATION_ADMIN
HR_ADMIN
MANAGER
EMPLOYEE
PAYROLL_OFFICER
RECRUITER
```

Example permissions:

```text
platform.organization.create
platform.organization.update
platform.organization.suspend

organization.settings.manage
organization.admin.invite
organization.employee.invite
organization.role.assign

employee.read
employee.create
leave.request
leave.approve
attendance.manage
payroll.read_own
payroll.process
```

The backend must enforce both permission and organization scope.

---

## 13. Database Tables

Database stack:

```text
MySQL 8
Drizzle ORM
mysql2 driver
Drizzle Kit migrations
```

```text
Organization
OrganizationSettings
OrganizationInvitation
OrganizationMembership
User
Session
OtpChallenge
PasswordResetToken
ExternalIdentity
Role
Permission
RolePermission
Employee
```

Important relationships:

```text
User
  -> OrganizationMembership
      -> Organization
      -> Role

Organization
  -> Employees
  -> Departments
  -> Attendance
  -> Leave
  -> Payroll
```

Every organization-owned table must include `organizationId`. Add a unique
constraint to `userId + organizationId` for memberships.

MySQL rules:

- Use InnoDB tables and foreign keys.
- Use `utf8mb4` encoding and collation.
- Store public UUIDs as `CHAR(36)` or optimized `BINARY(16)`.
- Use transactions for organization creation, invitations, memberships, OTP
  verification, and password reset.
- Add indexes for `organizationId`, email, status, token expiry, and foreign
  keys.
- Manage every schema change through Drizzle migrations.

---

## 14. Frontend Pages

```text
/platform/organizations
/platform/organizations/new
/platform/organizations/:id
/platform/login

/organization/setup
/organization/employees
/organization/employees/invite

/register
/verify-otp
/login
/forgot-password
/reset-password
/auth/sso/callback
```

---

## 15. Security Checklist

- [ ] Securely bootstrap the first Platform Super Admin.
- [ ] Separate platform routes from organization routes.
- [ ] Resolve organization scope from authenticated membership.
- [ ] Filter every tenant query by `organizationId`.
- [ ] Reject cross-organization access.
- [ ] Never allow public registration to assign privileged roles.
- [ ] Sign access and refresh JWTs using separate secrets.
- [ ] Hash refresh JWTs before storing them in session records.
- [ ] Validate JWT signature, algorithm, issuer, audience, type, and expiry.
- [ ] Hash passwords, reset tickets, and OTPs.
- [ ] Use secure HTTP-only cookies.
- [ ] Rotate refresh JWTs and detect reuse.
- [ ] Rate-limit all authentication endpoints.
- [ ] Revoke sessions after password changes or account suspension.
- [ ] Audit organization creation, suspension, invitations, and role changes.
- [ ] Test cross-organization isolation.

---

## 16. Implementation Order

1. Configure MySQL 8, Drizzle ORM, `mysql2`, and migrations.
2. Create Organization, Membership, Invitation, User, Role, and Session tables.
3. Securely bootstrap the Platform Super Admin.
4. Implement organization creation and admin invitation.
5. Implement Organization Admin activation and organization setup.
6. Implement employee invitation, registration, and OTP verification.
7. Implement JWT login with platform or active organization scope.
8. Implement JWT refresh rotation, logout, and password recovery.
9. Add separate platform and organization authorization middleware.
10. Enforce `organizationId` in every organization repository.
11. Integrate Microsoft and Google SSO.
12. Add audit logs and cross-organization security tests.
