import { Router } from "express";
import {
  authenticate,
  requirePermission,
  requireScope,
} from "../../common/middleware/authenticate.js";
import { validate } from "../../common/middleware/validate.js";
import { organizationController } from "./organization.controller.js";
import {
  inviteEmployeeSchema,
  memberRoleSchema,
  memberStatusSchema,
  updateOrganizationSettingsSchema,
} from "./organization.validation.js";

export const organizationRouter = Router();

organizationRouter.use(authenticate, requireScope("ORGANIZATION"));
organizationRouter.get("/", organizationController.get);
organizationRouter.patch(
  "/",
  requirePermission("organization.settings.manage"),
  validate(updateOrganizationSettingsSchema),
  organizationController.update,
);
organizationRouter.get(
  "/members",
  requirePermission("employee.read"),
  organizationController.members,
);
organizationRouter.post(
  "/employee-invitations",
  requirePermission("organization.employee.invite"),
  validate(inviteEmployeeSchema),
  organizationController.inviteEmployee,
);
organizationRouter.post(
  "/employees/import",
  requirePermission("organization.employee.invite"),
  (_request, response) => {
    response.status(501).json({
      success: false,
      message: "CSV import will be implemented after the onboarding MVP.",
      code: "NOT_IMPLEMENTED",
    });
  },
);
organizationRouter.patch(
  "/members/:id/role",
  requirePermission("organization.role.assign"),
  validate(memberRoleSchema),
  organizationController.updateRole,
);
organizationRouter.patch(
  "/members/:id/status",
  requirePermission("organization.role.assign"),
  validate(memberStatusSchema),
  organizationController.updateStatus,
);
