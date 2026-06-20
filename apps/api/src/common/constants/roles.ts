export const PLATFORM_ROLES = ["PLATFORM_SUPER_ADMIN"] as const;

export const ORGANIZATION_ROLES = [
  "ORGANIZATION_ADMIN",
  "HR_ADMIN",
  "MANAGER",
  "EMPLOYEE",
  "PAYROLL_OFFICER",
  "RECRUITER",
] as const;

export const PERMISSIONS = [
  "platform.organization.create",
  "platform.organization.read",
  "platform.organization.update",
  "platform.organization.suspend",
  "organization.settings.manage",
  "organization.admin.invite",
  "organization.employee.invite",
  "organization.role.assign",
  "employee.read",
  "employee.create",
  "employee.update",
  "leave.request",
  "leave.approve",
  "attendance.manage",
  "payroll.read_own",
  "payroll.process",
] as const;

export const ROLE_PERMISSIONS: Record<string, readonly string[]> = {
  PLATFORM_SUPER_ADMIN: [
    "platform.organization.create",
    "platform.organization.read",
    "platform.organization.update",
    "platform.organization.suspend",
  ],
  ORGANIZATION_ADMIN: [
    "organization.settings.manage",
    "organization.admin.invite",
    "organization.employee.invite",
    "organization.role.assign",
    "employee.read",
    "employee.create",
    "employee.update",
    "leave.request",
    "leave.approve",
    "attendance.manage",
    "payroll.read_own",
    "payroll.process",
  ],
  HR_ADMIN: [
    "organization.employee.invite",
    "employee.read",
    "employee.create",
    "employee.update",
    "leave.approve",
    "attendance.manage",
  ],
  MANAGER: ["employee.read", "leave.request", "leave.approve"],
  EMPLOYEE: ["leave.request", "payroll.read_own"],
  PAYROLL_OFFICER: ["employee.read", "payroll.read_own", "payroll.process"],
  RECRUITER: ["employee.read"],
};
