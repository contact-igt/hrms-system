import { z } from "zod";

const organizationBody = z.object({
  name: z.string().trim().min(2).max(180),
  code: z.string().trim().min(2).max(30).transform((value) => value.toUpperCase()),
  domain: z.string().trim().min(3).max(180).transform((value) => value.toLowerCase()),
  admin: z.object({
    firstName: z.string().trim().min(2).max(90),
    lastName: z.string().trim().min(2).max(90),
    email: z.email().transform((value) => value.trim().toLowerCase()),
  }),
});

export const createOrganizationSchema = z.object({
  body: organizationBody,
  params: z.any().optional(),
  query: z.any().optional(),
});

export const organizationIdSchema = z.object({
  body: z.any().optional(),
  params: z.object({ id: z.string().min(1) }),
  query: z.any().optional(),
});

export const updateOrganizationSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(180).optional(),
    domain: z.string().trim().min(3).max(180).transform((value) => value.toLowerCase()).optional(),
    timezone: z.string().trim().min(2).max(80).optional(),
  }),
  params: z.object({ id: z.uuid() }),
  query: z.any().optional(),
});

export const updateOrganizationStatusSchema = z.object({
  body: z.object({
    status: z.enum(["PENDING", "ACTIVE", "SUSPENDED", "ARCHIVED"]),
  }),
  params: z.object({ id: z.uuid() }),
  query: z.any().optional(),
});

export const inviteOrganizationAdminSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2).max(90).optional(),
    lastName: z.string().trim().min(2).max(90).optional(),
    email: z.string().email().transform((value) => value.trim().toLowerCase()).optional(),
  }),
  params: z.object({ id: z.uuid() }),
  query: z.any().optional(),
});
