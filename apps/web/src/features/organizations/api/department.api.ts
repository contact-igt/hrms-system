import { apiRequest } from "../../auth/api/auth.api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Department = {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
};

export type Designation = {
  id: string;
  organizationId: string;
  departmentId: string | null;
  departmentName: string | null;
  title: string;
  level: number;
  isActive: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateDepartmentInput = {
  name: string;
  code: string;
  description?: string;
};

export type CreateDesignationInput = {
  title: string;
  level?: number;
  departmentId?: string;
};

// ─── Department API ───────────────────────────────────────────────────────────

export const departmentApi = {
  list(accessToken: string) {
    return apiRequest<Department[]>("/departments", {}, accessToken);
  },

  get(id: string, accessToken: string) {
    return apiRequest<Department>(`/departments/${id}`, {}, accessToken);
  },

  create(input: CreateDepartmentInput, accessToken: string) {
    return apiRequest<{ id: string }>(
      "/departments",
      { method: "POST", body: JSON.stringify(input) },
      accessToken,
    );
  },

  update(id: string, input: Partial<CreateDepartmentInput & { isActive: number }>, accessToken: string) {
    return apiRequest<{ updated: true }>(
      `/departments/${id}`,
      { method: "PATCH", body: JSON.stringify(input) },
      accessToken,
    );
  },

  deactivate(id: string, accessToken: string) {
    return apiRequest<{ deactivated: true }>(
      `/departments/${id}`,
      { method: "DELETE" },
      accessToken,
    );
  },
};

// ─── Designation API ──────────────────────────────────────────────────────────

export const designationApi = {
  list(accessToken: string, departmentId?: string) {
    const qs = departmentId ? `?departmentId=${departmentId}` : "";
    return apiRequest<Designation[]>(`/designations${qs}`, {}, accessToken);
  },

  get(id: string, accessToken: string) {
    return apiRequest<Designation>(`/designations/${id}`, {}, accessToken);
  },

  create(input: CreateDesignationInput, accessToken: string) {
    return apiRequest<{ id: string }>(
      "/designations",
      { method: "POST", body: JSON.stringify(input) },
      accessToken,
    );
  },

  update(id: string, input: Partial<CreateDesignationInput & { isActive: number; departmentId: string | null }>, accessToken: string) {
    return apiRequest<{ updated: true }>(
      `/designations/${id}`,
      { method: "PATCH", body: JSON.stringify(input) },
      accessToken,
    );
  },

  deactivate(id: string, accessToken: string) {
    return apiRequest<{ deactivated: true }>(
      `/designations/${id}`,
      { method: "DELETE" },
      accessToken,
    );
  },
};
