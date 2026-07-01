export type Department = {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  description: string | null;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
};

export type Designation = {
  id: string;
  organizationId: string;
  departmentId: string | null;
  title: string;
  level: number;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateDepartmentInput = {
  name: string;
  code: string;
  description?: string;
};

export type UpdateDepartmentInput = {
  name?: string;
  code?: string;
  description?: string;
  isActive?: number;
};

export type CreateDesignationInput = {
  title: string;
  level?: number;
  departmentId?: string;
};

export type UpdateDesignationInput = {
  title?: string;
  level?: number;
  departmentId?: string | null;
  isActive?: number;
};
