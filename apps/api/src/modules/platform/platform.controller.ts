import type { Request, Response } from "express";
import { sendSuccess } from "../../common/utils/response.js";
import {
  createOrganization,
  getOrganization,
  inviteOrganizationAdmin,
  listOrganizations,
  updateOrganization,
  updateOrganizationStatus,
} from "./platform.service.js";

export const platformController = {
  async list(_request: Request, response: Response) {
    sendSuccess(response, await listOrganizations());
  },

  async get(request: Request, response: Response) {
    sendSuccess(response, await getOrganization(request.params.id as string));
  },

  async create(request: Request, response: Response) {
    const data = await createOrganization(request.body, request);
    sendSuccess(response, data, "Organization created and admin invited.", 201);
  },

  async update(request: Request, response: Response) {
    sendSuccess(
      response,
      await updateOrganization(request.params.id as string, request.body, request),
      "Organization updated.",
    );
  },

  async updateStatus(request: Request, response: Response) {
    sendSuccess(
      response,
      await updateOrganizationStatus(
        request.params.id as string,
        request.body.status,
        request,
      ),
      "Organization status updated.",
    );
  },

  async inviteAdmin(request: Request, response: Response) {
    sendSuccess(
      response,
      await inviteOrganizationAdmin(
        request.params.id as string,
        request.body,
        request,
      ),
      "Organization Admin invitation sent.",
      201,
    );
  },
};
