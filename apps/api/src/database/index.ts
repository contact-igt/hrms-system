import {
  index,
  int,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  text,
  timestamp,
  datetime,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

const id = (name = "id") => varchar(name, { length: 36 });

export const organizations = mysqlTable(
  "organizations",
  {
    id: id().primaryKey(),
    name: varchar("name", { length: 180 }).notNull(),
    code: varchar("code", { length: 30 }).notNull(),
    domain: varchar("domain", { length: 180 }),
    timezone: varchar("timezone", { length: 80 }).notNull().default("Asia/Kolkata"),
    status: mysqlEnum("status", [
      "NOT_INVITED",
      "PENDING",
      "ACTIVE",
      "SUSPENDED",
      "ARCHIVED",
    ])
      .notNull()
      .default("NOT_INVITED"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("organizations_code_unique").on(table.code),
    uniqueIndex("organizations_domain_unique").on(table.domain),
    index("organizations_status_idx").on(table.status),
  ],
);

export const users = mysqlTable(
  "users",
  {
    id: id().primaryKey(),
    firstName: varchar("first_name", { length: 90 }).notNull(),
    lastName: varchar("last_name", { length: 90 }).notNull(),
    email: varchar("email", { length: 190 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }),
    status: mysqlEnum("status", [
      "INVITED",
      "PENDING_VERIFICATION",
      "PENDING_APPROVAL",
      "ACTIVE",
      "LOCKED",
      "SUSPENDED",
      "DISABLED",
    ])
      .notNull()
      .default("INVITED"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
    emailVerifiedAt: datetime("email_verified_at"),
    passwordChangedAt: datetime("password_changed_at"),
    failedLoginAttempts: int("failed_login_attempts").notNull().default(0),
    lockedUntil: datetime("locked_until"),
    lastLoginAt: datetime("last_login_at"),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    index("users_status_idx").on(table.status),
  ],
);

export const roles = mysqlTable(
  "roles",
  {
    id: id().primaryKey(),
    name: varchar("name", { length: 80 }).notNull(),
    scope: mysqlEnum("scope", ["PLATFORM", "ORGANIZATION"]).notNull(),
    description: varchar("description", { length: 255 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [uniqueIndex("roles_name_scope_unique").on(table.name, table.scope)],
);

export const permissions = mysqlTable(
  "permissions",
  {
    id: id().primaryKey(),
    code: varchar("code", { length: 120 }).notNull(),
    description: varchar("description", { length: 255 }),
  },
  (table) => [uniqueIndex("permissions_code_unique").on(table.code)],
);

export const rolePermissions = mysqlTable(
  "role_permissions",
  {
    roleId: id("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
    permissionId: id("permission_id")
      .notNull()
      .references(() => permissions.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.roleId, table.permissionId] })],
);

export const platformUserRoles = mysqlTable(
  "platform_user_roles",
  {
    userId: id("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    roleId: id("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

export const organizationMemberships = mysqlTable(
  "organization_memberships",
  {
    id: id().primaryKey(),
    organizationId: id("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: id("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: mysqlEnum("status", ["INVITED", "ACTIVE", "SUSPENDED", "DISABLED"])
      .notNull()
      .default("INVITED"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("memberships_user_org_unique").on(
      table.userId,
      table.organizationId,
    ),
    index("memberships_org_status_idx").on(table.organizationId, table.status),
  ],
);

export const membershipRoles = mysqlTable(
  "membership_roles",
  {
    membershipId: id("membership_id")
      .notNull()
      .references(() => organizationMemberships.id, { onDelete: "cascade" }),
    roleId: id("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.membershipId, table.roleId] })],
);

export const departments = mysqlTable(
  "departments",
  {
    id: id().primaryKey(),
    organizationId: id("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    code: varchar("code", { length: 30 }).notNull(),
    description: varchar("description", { length: 255 }),
    isActive: int("is_active").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("departments_org_code_unique").on(table.organizationId, table.code),
    index("departments_org_active_idx").on(table.organizationId, table.isActive),
  ],
);

export const designations = mysqlTable(
  "designations",
  {
    id: id().primaryKey(),
    organizationId: id("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    departmentId: id("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    title: varchar("title", { length: 120 }).notNull(),
    level: int("level").notNull().default(1),
    isActive: int("is_active").notNull().default(1),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("designations_org_title_unique").on(table.organizationId, table.title),
    index("designations_org_dept_idx").on(table.organizationId, table.departmentId),
    index("designations_org_active_idx").on(table.organizationId, table.isActive),
  ],
);

export const employees = mysqlTable(
  "employees",
  {
    id: id().primaryKey(),
    organizationId: id("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: id("user_id").references(() => users.id, { onDelete: "set null" }),
    employeeCode: varchar("employee_code", { length: 60 }).notNull(),
    departmentId: id("department_id").references(() => departments.id, {
      onDelete: "set null",
    }),
    designationId: id("designation_id").references(() => designations.id, {
      onDelete: "set null",
    }),
    status: mysqlEnum("status", [
      "DRAFT",
      "INVITED",
      "ACTIVE",
      "INACTIVE",
      "EXITED",
    ])
      .notNull()
      .default("INVITED"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  },
  (table) => [
    uniqueIndex("employees_org_code_unique").on(
      table.organizationId,
      table.employeeCode,
    ),
    index("employees_org_status_idx").on(table.organizationId, table.status),
  ],
);

export const organizationInvitations = mysqlTable(
  "organization_invitations",
  {
    id: id().primaryKey(),
    organizationId: id("organization_id")
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 190 }).notNull(),
    firstName: varchar("first_name", { length: 90 }).notNull(),
    lastName: varchar("last_name", { length: 90 }).notNull(),
    roleName: varchar("role_name", { length: 80 }).notNull(),
    employeeCode: varchar("employee_code", { length: 60 }),
    departmentId: varchar("department_id", { length: 36 }),
    designationId: varchar("designation_id", { length: 36 }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: datetime("expires_at").notNull(),
    acceptedAt: datetime("accepted_at"),
    invitedBy: id("invited_by").references(() => users.id, { onDelete: "set null" }),
  },
  (table) => [
    uniqueIndex("invitations_token_hash_unique").on(table.tokenHash),
    index("invitations_org_email_idx").on(table.organizationId, table.email),
    index("invitations_expires_idx").on(table.expiresAt),
  ],
);

export const sessions = mysqlTable(
  "sessions",
  {
    id: id().primaryKey(),
    userId: id("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    scopeType: mysqlEnum("scope_type", ["PLATFORM", "ORGANIZATION"]).notNull(),
    organizationId: id("organization_id").references(() => organizations.id, {
      onDelete: "cascade",
    }),
    membershipId: id("membership_id").references(() => organizationMemberships.id, {
      onDelete: "cascade",
    }),
    refreshTokenHash: varchar("refresh_token_hash", { length: 64 }).notNull(),
    refreshJti: varchar("refresh_jti", { length: 36 }).notNull(),
    userAgent: varchar("user_agent", { length: 500 }),
    ipAddress: varchar("ip_address", { length: 64 }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: datetime("expires_at").notNull(),
    lastUsedAt: datetime("last_used_at"),
    revokedAt: datetime("revoked_at"),
  },
  (table) => [
    index("sessions_user_idx").on(table.userId),
    index("sessions_expires_idx").on(table.expiresAt),
  ],
);

export const otpChallenges = mysqlTable(
  "otp_challenges",
  {
    id: id().primaryKey(),
    userId: id("user_id").references(() => users.id, { onDelete: "cascade" }),
    destination: varchar("destination", { length: 190 }).notNull(),
    codeDigest: varchar("code_digest", { length: 64 }).notNull(),
    purpose: mysqlEnum("purpose", [
      "EMAIL_VERIFICATION",
      "LOGIN",
      "PASSWORD_RESET",
    ]).notNull(),
    attempts: int("attempts").notNull().default(0),
    maxAttempts: int("max_attempts").notNull().default(5),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: datetime("expires_at").notNull(),
    consumedAt: datetime("consumed_at"),
  },
  (table) => [
    index("otp_destination_purpose_idx").on(table.destination, table.purpose),
    index("otp_expires_idx").on(table.expiresAt),
  ],
);

export const passwordResetTokens = mysqlTable(
  "password_reset_tokens",
  {
    id: id().primaryKey(),
    userId: id("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: varchar("token_hash", { length: 64 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    expiresAt: datetime("expires_at").notNull(),
    usedAt: datetime("used_at"),
  },
  (table) => [
    uniqueIndex("reset_token_hash_unique").on(table.tokenHash),
    index("reset_user_idx").on(table.userId),
  ],
);

export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: id().primaryKey(),
    organizationId: id("organization_id").references(() => organizations.id, {
      onDelete: "set null",
    }),
    actorUserId: id("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 80 }),
    entityId: varchar("entity_id", { length: 36 }),
    requestId: varchar("request_id", { length: 36 }),
    ipAddress: varchar("ip_address", { length: 64 }),
    metadata: text("metadata"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("audit_org_created_idx").on(table.organizationId, table.createdAt),
    index("audit_actor_idx").on(table.actorUserId),
  ],
);
