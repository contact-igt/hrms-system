import { and, eq } from "drizzle-orm";
import { db } from "../../database/client.js";
import { departments, designations } from "../../database/index.js";
import { createId } from "../../common/utils/crypto.js";
import type { CreateDepartmentInput, UpdateDepartmentInput, CreateDesignationInput, UpdateDesignationInput } from "./department.types.js";

// ─── Departments ─────────────────────────────────────────────────────────────

export async function dbListDepartments(organizationId: string) {
  return db
    .select()
    .from(departments)
    .where(eq(departments.organizationId, organizationId))
    .orderBy(departments.name);
}

export async function dbFindDepartmentById(id: string, organizationId: string) {
  const [row] = await db
    .select()
    .from(departments)
    .where(and(eq(departments.id, id), eq(departments.organizationId, organizationId)))
    .limit(1);
  return row ?? null;
}

export async function dbFindDepartmentByCode(code: string, organizationId: string) {
  const [row] = await db
    .select({ id: departments.id })
    .from(departments)
    .where(and(eq(departments.code, code), eq(departments.organizationId, organizationId)))
    .limit(1);
  return row ?? null;
}

export async function dbCreateDepartment(organizationId: string, input: CreateDepartmentInput) {
  const newId = createId();
  await db.insert(departments).values({
    id: newId,
    organizationId,
    name: input.name,
    code: input.code,
    description: input.description ?? null,
  });
  return newId;
}

export async function dbUpdateDepartment(id: string, organizationId: string, input: UpdateDepartmentInput) {
  const result = await db
    .update(departments)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(departments.id, id), eq(departments.organizationId, organizationId)));
  return result[0].affectedRows;
}

export async function dbDeleteDepartment(id: string, organizationId: string) {
  const result = await db
    .update(departments)
    .set({ isActive: 0, updatedAt: new Date() })
    .where(and(eq(departments.id, id), eq(departments.organizationId, organizationId)));
  return result[0].affectedRows;
}

// ─── Designations ────────────────────────────────────────────────────────────

export async function dbListDesignations(organizationId: string, departmentId?: string) {
  const conditions = departmentId
    ? and(eq(designations.organizationId, organizationId), eq(designations.departmentId, departmentId))
    : eq(designations.organizationId, organizationId);
  return db
    .select({
      id: designations.id,
      organizationId: designations.organizationId,
      departmentId: designations.departmentId,
      title: designations.title,
      level: designations.level,
      isActive: designations.isActive,
      createdAt: designations.createdAt,
      updatedAt: designations.updatedAt,
      departmentName: departments.name,
    })
    .from(designations)
    .leftJoin(departments, eq(designations.departmentId, departments.id))
    .where(conditions)
    .orderBy(designations.level, designations.title);
}

export async function dbFindDesignationById(id: string, organizationId: string) {
  const [row] = await db
    .select()
    .from(designations)
    .where(and(eq(designations.id, id), eq(designations.organizationId, organizationId)))
    .limit(1);
  return row ?? null;
}

export async function dbFindDesignationByTitle(title: string, organizationId: string) {
  const [row] = await db
    .select({ id: designations.id })
    .from(designations)
    .where(and(eq(designations.title, title), eq(designations.organizationId, organizationId)))
    .limit(1);
  return row ?? null;
}

export async function dbCreateDesignation(organizationId: string, input: CreateDesignationInput) {
  const newId = createId();
  await db.insert(designations).values({
    id: newId,
    organizationId,
    departmentId: input.departmentId ?? null,
    title: input.title,
    level: input.level ?? 1,
  });
  return newId;
}

export async function dbUpdateDesignation(id: string, organizationId: string, input: UpdateDesignationInput) {
  const result = await db
    .update(designations)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(designations.id, id), eq(designations.organizationId, organizationId)));
  return result[0].affectedRows;
}

export async function dbDeleteDesignation(id: string, organizationId: string) {
  const result = await db
    .update(designations)
    .set({ isActive: 0, updatedAt: new Date() })
    .where(and(eq(designations.id, id), eq(designations.organizationId, organizationId)));
  return result[0].affectedRows;
}
