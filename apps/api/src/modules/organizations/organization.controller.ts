import type { Request, Response } from "express";
import { sendSuccess } from "../../common/utils/response.js";
import {
  getCurrentOrganization,
  inviteEmployee,
  listMembers,
  updateCurrentOrganization,
  updateMemberRole,
  updateMemberStatus,
} from "./organization.service.js";

export const organizationController = {
  async get(request: Request, response: Response) {
    sendSuccess(response, await getCurrentOrganization(request));
  },
  async update(request: Request, response: Response) {
    sendSuccess(
      response,
      await updateCurrentOrganization(request.body, request),
      "Organization settings updated.",
    );
  },
  async members(request: Request, response: Response) {
    sendSuccess(response, await listMembers(request));
  },
  async inviteEmployee(request: Request, response: Response) {
    sendSuccess(
      response,
      await inviteEmployee(request.body, request),
      "Employee invitation sent.",
      201,
    );
  },
  async updateRole(request: Request, response: Response) {
    sendSuccess(
      response,
      await updateMemberRole(
        request.params.id as string,
        request.body.role,
        request,
      ),
      "Member role updated.",
    );
  },
  async updateStatus(request: Request, response: Response) {
    sendSuccess(
      response,
      await updateMemberStatus(
        request.params.id as string,
        request.body.status,
        request,
      ),
      "Member status updated.",
    );
  },
};
