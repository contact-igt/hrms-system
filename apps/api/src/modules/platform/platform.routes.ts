import { Router } from "express";
import {
  authenticate,
  requirePermission,
  requireScope,
} from "../../common/middleware/authenticate.js";
import { validate } from "../../common/middleware/validate.js";
import { platformController } from "./platform.controller.js";
import {
  createOrganizationSchema,
  inviteOrganizationAdminSchema,
  organizationIdSchema,
  updateOrganizationSchema,
  updateOrganizationStatusSchema,
} from "./platform.validation.js";

export const platformRouter = Router();

platformRouter.use(authenticate, requireScope("PLATFORM"));
platformRouter.get(
  "/organizations",
  requirePermission("platform.organization.read"),
  platformController.list,
);
platformRouter.post(
  "/organizations",
  requirePermission("platform.organization.create"),
  validate(createOrganizationSchema),
  platformController.create,
);
platformRouter.get(
  "/organizations/:id",
  requirePermission("platform.organization.read"),
  validate(organizationIdSchema),
  platformController.get,
);
platformRouter.patch(
  "/organizations/:id",
  requirePermission("platform.organization.update"),
  validate(updateOrganizationSchema),
  platformController.update,
);
platformRouter.patch(
  "/organizations/:id/status",
  requirePermission("platform.organization.suspend"),
  validate(updateOrganizationStatusSchema),
  platformController.updateStatus,
);
platformRouter.post(
  "/organizations/:id/admin-invitations",
  requirePermission("platform.organization.create"),
  validate(inviteOrganizationAdminSchema),
  platformController.inviteAdmin,
);
platformRouter.delete(
  "/organizations/:id",
  requirePermission("platform.organization.delete"),
  validate(organizationIdSchema),
  platformController.delete,
);
