# HRMS Authentication Plan

## 1. Features

- Employee registration
- Email OTP verification
- Password and OTP login
- Forgot and reset password
- Microsoft and Google SSO
- Token refresh and logout
- Role-based access control

---

## 2. Registration

```http
POST /api/v1/auth/register
```

```json
{
  "firstName": "Asha",
  "lastName": "Kumar",
  "email": "asha@company.com",
  "password": "secure-password",
  "organizationCode": "COMPANY01"
}
```

Workflow:

1. Validate the registration details.
2. Check the employee invitation, organization code, or company email domain.
3. Hash the password with Argon2id or bcrypt.
4. Create the account as `PENDING_VERIFICATION`.
5. Assign only the `EMPLOYEE` role.
6. Generate and email an OTP.
7. Activate the account after OTP verification and optional HR approval.

Users must never select HR or administrator roles during registration.

---

## 3. OTP Verification

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
- Store only an OTP digest, not the raw code.
- Invalidate the previous OTP after resend.
- Rate-limit requests by email, user, and IP address.

---

## 4. Login

### Password login

```http
POST /api/v1/auth/login
```

```json
{
  "email": "asha@company.com",
  "password": "secure-password"
}
```

Workflow:

1. Validate credentials and account status.
2. Verify the password hash.
3. Load roles and permissions.
4. Create a session.
5. Return a short-lived access token.
6. Set a refresh token in a secure HTTP-only cookie.

### OTP login

```http
POST /api/v1/auth/login/otp/request
POST /api/v1/auth/login/otp/verify
```

After successful OTP verification, create the same tokens and session used by
password login.

---

## 5. Forgot and Reset Password

```http
POST /api/v1/auth/forgot-password
POST /api/v1/auth/forgot-password/verify-otp
POST /api/v1/auth/reset-password
```

```text
Submit email
  -> Send password-reset OTP
  -> Verify OTP
  -> Issue a short-lived reset ticket
  -> Set a new password
  -> Revoke existing sessions
```

Rules:

- Do not reveal whether the submitted email exists.
- Reset OTP expires after 5 minutes.
- Reset ticket expires after 10–15 minutes.
- Reset tickets can be used only once.
- Hash the new password.
- Revoke all sessions after the password is reset.

---

## 6. SSO

Support:

- Microsoft Entra ID
- Google Workspace

Use OpenID Connect Authorization Code Flow with PKCE.

```http
GET /api/v1/auth/sso/providers
GET /api/v1/auth/sso/:provider/start
GET /api/v1/auth/sso/:provider/callback
```

```text
Select SSO provider
  -> Redirect to provider
  -> User authenticates
  -> API validates callback
  -> Find or link HRMS account
  -> Create HRMS session
  -> Open dashboard
```

Rules:

- Validate state, nonce, PKCE, issuer, audience, and signature.
- Restrict approved Microsoft tenants or Google Workspace domains.
- Do not automatically create privileged accounts.
- Deny access if the HRMS account is suspended or disabled.

---

## 7. Tokens and Sessions

| Item | Lifetime | Storage |
|---|---:|---|
| Access token | 10–15 minutes | Frontend memory |
| Refresh token | 7–30 days | Secure HTTP-only cookie |
| OTP | 5 minutes | Digest in database |
| Reset ticket | 10–15 minutes | Hash in database |

```http
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
POST /api/v1/auth/logout-all
GET  /api/v1/auth/me
```

Do not store authentication tokens in browser `localStorage`.

---

## 8. Database Tables

```text
User
Session
OtpChallenge
PasswordResetToken
ExternalIdentity
Role
Permission
UserRole
RolePermission
```

Account statuses:

```text
PENDING_VERIFICATION
PENDING_APPROVAL
ACTIVE
LOCKED
SUSPENDED
DISABLED
```

---

## 9. Roles

```text
SUPER_ADMIN
HR_ADMIN
MANAGER
EMPLOYEE
PAYROLL_OFFICER
RECRUITER
```

Example permissions:

```text
employee.read
employee.create
leave.request
leave.approve
attendance.manage
payroll.read_own
payroll.process
role.manage
```

The backend must enforce all permissions.

---

## 10. Frontend Pages

```text
/register
/verify-otp
/login
/forgot-password
/reset-password
/auth/sso/callback
```

---

## 11. Security Checklist

- [ ] Hash passwords with Argon2id or bcrypt.
- [ ] Store tokens and OTPs only as hashes or digests.
- [ ] Use secure HTTP-only cookies.
- [ ] Rate-limit all authentication endpoints.
- [ ] Lock accounts temporarily after repeated login failures.
- [ ] Never log passwords, OTPs, or tokens.
- [ ] Revoke sessions after password changes or account disablement.
- [ ] Validate roles and permissions in the backend.
- [ ] Record important authentication events in audit logs.

---

## 12. Implementation Order

1. Create authentication database tables.
2. Implement registration and email OTP verification.
3. Implement password and OTP login.
4. Implement access tokens, refresh tokens, and logout.
5. Implement forgot and reset password.
6. Add role and permission middleware.
7. Integrate Microsoft and Google SSO.
8. Add rate limits, audit logs, and tests.

