import { z } from "zod";

// ─── Departments ─────────────────────────────────────────────────────────────

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120),
    code: z
      .string()
      .trim()
      .min(1)
      .max(30)
      .toUpperCase()
      .regex(/^[A-Z0-9_-]+$/, "Code may only contain letters, digits, hyphens and underscores."),
    description: z.string().trim().max(255).optional(),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(120).optional(),
    code: z
      .string()
      .trim()
      .min(1)
      .max(30)
      .toUpperCase()
      .regex(/^[A-Z0-9_-]+$/, "Code may only contain letters, digits, hyphens and underscores.")
      .optional(),
    description: z.string().trim().max(255).optional(),
    isActive: z.number().int().min(0).max(1).optional(),
  }),
  params: z.object({ id: z.uuid() }),
  query: z.any().optional(),
});

export const departmentIdSchema = z.object({
  body: z.any().optional(),
  params: z.object({ id: z.uuid() }),
  query: z.any().optional(),
});

// ─── Designations ────────────────────────────────────────────────────────────

export const createDesignationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(120),
    level: z.number().int().min(1).max(20).optional().default(1),
    departmentId: z.uuid().optional().or(z.literal("")).transform((v) => v || undefined),
  }),
  params: z.any().optional(),
  query: z.any().optional(),
});

export const updateDesignationSchema = z.object({
  body: z.object({
    title: z.string().trim().min(2).max(120).optional(),
    level: z.number().int().min(1).max(20).optional(),
    departmentId: z.uuid().nullable().optional(),
    isActive: z.number().int().min(0).max(1).optional(),
  }),
  params: z.object({ id: z.uuid() }),
  query: z.any().optional(),
});

export const designationIdSchema = z.object({
  body: z.any().optional(),
  params: z.object({ id: z.uuid() }),
  query: z.any().optional(),
});
