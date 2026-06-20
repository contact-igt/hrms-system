import { z } from "zod";
import { ORGANIZATION_ROLES } from "../../common/constants/roles.js";

export const updateOrganizationSettingsSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(180),
    domain: z.string().trim().min(3).max(180).toLowerCase(),
    timezone: z.string().trim().min(2).max(80),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const inviteEmployeeSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(90),
    lastName: z.string().trim().min(2).max(90),
    email: z.email().transform((value) => value.trim().toLowerCase()),
    employeeCode: z.string().trim().min(1).max(60),
    departmentId: z.string().trim().max(36).optional().or(z.literal("")),
    designationId: z.string().trim().max(36).optional().or(z.literal("")),
    role: z.enum(ORGANIZATION_ROLES),
  }),
  params: z.object({}),
  query: z.object({}),
});

export const memberRoleSchema = z.object({
  body: z.object({ role: z.enum(ORGANIZATION_ROLES) }),
  params: z.object({ id: z.uuid() }),
  query: z.object({}),
});

export const memberStatusSchema = z.object({
  body: z.object({ status: z.enum(["ACTIVE", "SUSPENDED", "DISABLED"]) }),
  params: z.object({ id: z.uuid() }),
  query: z.object({}),
});
