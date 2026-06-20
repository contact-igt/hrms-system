import { Router } from "express";
import {
  authenticate,
  requirePermission,
  requireScope,
} from "../../common/middleware/authenticate.js";
import { validate } from "../../common/middleware/validate.js";
import { organizationController } from "../organizations/organization.controller.js";
import { inviteEmployeeSchema } from "../organizations/organization.validation.js";

export const employeeRouter = Router();

employeeRouter.use(authenticate, requireScope("ORGANIZATION"));
employeeRouter.get(
  "/",
  requirePermission("employee.read"),
  organizationController.members,
);
employeeRouter.post(
  "/",
  requirePermission("employee.create"),
  validate(inviteEmployeeSchema),
  organizationController.inviteEmployee,
);
