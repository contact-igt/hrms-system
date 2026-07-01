import type { Request, Response } from "express";
import { sendSuccess } from "../../common/utils/response.js";
import {
  createDepartment,
  createDesignation,
  deactivateDepartment,
  deactivateDesignation,
  getDepartment,
  getDesignation,
  listDepartments,
  listDesignations,
  updateDepartment,
  updateDesignation,
} from "./department.service.js";

export const departmentController = {
  // ─── Departments ──────────────────────────────────────────────────────────

  async list(request: Request, response: Response) {
    sendSuccess(response, await listDepartments(request));
  },

  async get(request: Request, response: Response) {
    sendSuccess(response, await getDepartment(request.params.id as string, request));
  },

  async create(request: Request, response: Response) {
    sendSuccess(
      response,
      await createDepartment(request.body, request),
      "Department created successfully.",
      201,
    );
  },

  async update(request: Request, response: Response) {
    sendSuccess(
      response,
      await updateDepartment(request.params.id as string, request.body, request),
      "Department updated successfully.",
    );
  },

  async remove(request: Request, response: Response) {
    sendSuccess(
      response,
      await deactivateDepartment(request.params.id as string, request),
      "Department deactivated successfully.",
    );
  },

  // ─── Designations ─────────────────────────────────────────────────────────

  async listDesignations(request: Request, response: Response) {
    const departmentId = request.query.departmentId as string | undefined;
    sendSuccess(response, await listDesignations(request, departmentId));
  },

  async getDesignation(request: Request, response: Response) {
    sendSuccess(response, await getDesignation(request.params.id as string, request));
  },

  async createDesignation(request: Request, response: Response) {
    sendSuccess(
      response,
      await createDesignation(request.body, request),
      "Designation created successfully.",
      201,
    );
  },

  async updateDesignation(request: Request, response: Response) {
    sendSuccess(
      response,
      await updateDesignation(request.params.id as string, request.body, request),
      "Designation updated successfully.",
    );
  },

  async removeDesignation(request: Request, response: Response) {
    sendSuccess(
      response,
      await deactivateDesignation(request.params.id as string, request),
      "Designation deactivated successfully.",
    );
  },
};

