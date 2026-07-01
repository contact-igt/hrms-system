import type { Request } from "express";
import { AppError } from "../../common/errors/app-error.js";
import { writeAudit } from "../audit/audit.service.js";
import {
  dbCreateDepartment,
  dbCreateDesignation,
  dbDeleteDepartment,
  dbDeleteDesignation,
  dbFindDepartmentByCode,
  dbFindDepartmentById,
  dbFindDesignationByTitle,
  dbFindDesignationById,
  dbListDepartments,
  dbListDesignations,
  dbUpdateDepartment,
  dbUpdateDesignation,
} from "./department.repository.js";
import type {
  CreateDepartmentInput,
  CreateDesignationInput,
  UpdateDepartmentInput,
  UpdateDesignationInput,
} from "./department.types.js";

function orgIdFrom(request: Request) {
  if (!request.auth?.organizationId) {
    throw new AppError(403, "Organization scope is required.", "AUTH_SCOPE_DENIED");
  }
  return request.auth.organizationId;
}

// ─── Departments ─────────────────────────────────────────────────────────────

export async function listDepartments(request: Request) {
  const organizationId = orgIdFrom(request);
  return dbListDepartments(organizationId);
}

export async function getDepartment(id: string, request: Request) {
  const organizationId = orgIdFrom(request);
  const department = await dbFindDepartmentById(id, organizationId);
  if (!department) {
    throw new AppError(404, "Department was not found.", "DEPARTMENT_NOT_FOUND");
  }
  return department;
}

export async function createDepartment(body: CreateDepartmentInput, request: Request) {
  const organizationId = orgIdFrom(request);

  const existing = await dbFindDepartmentByCode(body.code, organizationId);
  if (existing) {
    throw new AppError(409, "A department with this code already exists.", "DEPARTMENT_CODE_CONFLICT");
  }

  const id = await dbCreateDepartment(organizationId, body);
  await writeAudit({
    action: "DEPARTMENT_CREATED",
    organizationId,
    entityType: "Department",
    entityId: id,
    actorUserId: request.auth!.userId,
    request,
    metadata: { name: body.name, code: body.code },
  });
  return { id };
}

export async function updateDepartment(id: string, body: UpdateDepartmentInput, request: Request) {
  const organizationId = orgIdFrom(request);

  // If code is changing, check for uniqueness
  if (body.code) {
    const existing = await dbFindDepartmentByCode(body.code, organizationId);
    if (existing && existing.id !== id) {
      throw new AppError(409, "A department with this code already exists.", "DEPARTMENT_CODE_CONFLICT");
    }
  }

  const affected = await dbUpdateDepartment(id, organizationId, body);
  if (affected === 0) {
    throw new AppError(404, "Department was not found.", "DEPARTMENT_NOT_FOUND");
  }

  await writeAudit({
    action: "DEPARTMENT_UPDATED",
    organizationId,
    entityType: "Department",
    entityId: id,
    actorUserId: request.auth!.userId,
    request,
    metadata: body as Record<string, unknown>,
  });
  return { updated: true as const };
}

export async function deactivateDepartment(id: string, request: Request) {
  const organizationId = orgIdFrom(request);
  const affected = await dbDeleteDepartment(id, organizationId);
  if (affected === 0) {
    throw new AppError(404, "Department was not found.", "DEPARTMENT_NOT_FOUND");
  }
  await writeAudit({
    action: "DEPARTMENT_DEACTIVATED",
    organizationId,
    entityType: "Department",
    entityId: id,
    actorUserId: request.auth!.userId,
    request,
  });
  return { deactivated: true as const };
}

// ─── Designations ────────────────────────────────────────────────────────────

export async function listDesignations(request: Request, departmentId?: string) {
  const organizationId = orgIdFrom(request);
  return dbListDesignations(organizationId, departmentId);
}

export async function getDesignation(id: string, request: Request) {
  const organizationId = orgIdFrom(request);
  const designation = await dbFindDesignationById(id, organizationId);
  if (!designation) {
    throw new AppError(404, "Designation was not found.", "DESIGNATION_NOT_FOUND");
  }
  return designation;
}

export async function createDesignation(body: CreateDesignationInput, request: Request) {
  const organizationId = orgIdFrom(request);

  const existing = await dbFindDesignationByTitle(body.title, organizationId);
  if (existing) {
    throw new AppError(409, "A designation with this title already exists.", "DESIGNATION_TITLE_CONFLICT");
  }

  const id = await dbCreateDesignation(organizationId, body);
  await writeAudit({
    action: "DESIGNATION_CREATED",
    organizationId,
    entityType: "Designation",
    entityId: id,
    actorUserId: request.auth!.userId,
    request,
    metadata: { title: body.title, level: body.level },
  });
  return { id };
}

export async function updateDesignation(id: string, body: UpdateDesignationInput, request: Request) {
  const organizationId = orgIdFrom(request);

  if (body.title) {
    const existing = await dbFindDesignationByTitle(body.title, organizationId);
    if (existing && existing.id !== id) {
      throw new AppError(409, "A designation with this title already exists.", "DESIGNATION_TITLE_CONFLICT");
    }
  }

  const affected = await dbUpdateDesignation(id, organizationId, body);
  if (affected === 0) {
    throw new AppError(404, "Designation was not found.", "DESIGNATION_NOT_FOUND");
  }

  await writeAudit({
    action: "DESIGNATION_UPDATED",
    organizationId,
    entityType: "Designation",
    entityId: id,
    actorUserId: request.auth!.userId,
    request,
    metadata: body as Record<string, unknown>,
  });
  return { updated: true as const };
}

export async function deactivateDesignation(id: string, request: Request) {
  const organizationId = orgIdFrom(request);
  const affected = await dbDeleteDesignation(id, organizationId);
  if (affected === 0) {
    throw new AppError(404, "Designation was not found.", "DESIGNATION_NOT_FOUND");
  }
  await writeAudit({
    action: "DESIGNATION_DEACTIVATED",
    organizationId,
    entityType: "Designation",
    entityId: id,
    actorUserId: request.auth!.userId,
    request,
  });
  return { deactivated: true as const };
}
