import { Router } from "express";
import {
  authenticate,
  requirePermission,
  requireScope,
} from "../../common/middleware/authenticate.js";
import { validate } from "../../common/middleware/validate.js";
import { departmentController } from "./department.controller.js";
import {
  createDepartmentSchema,
  createDesignationSchema,
  departmentIdSchema,
  designationIdSchema,
  updateDepartmentSchema,
  updateDesignationSchema,
} from "./department.validation.js";

// ─── Departments ─────────────────────────────────────────────────────────────

export const departmentRouter = Router();

departmentRouter.use(authenticate, requireScope("ORGANIZATION"));

departmentRouter.get(
  "/",
  requirePermission("department.read"),
  departmentController.list,
);

departmentRouter.post(
  "/",
  requirePermission("department.create"),
  validate(createDepartmentSchema),
  departmentController.create,
);

departmentRouter.get(
  "/:id",
  requirePermission("department.read"),
  validate(departmentIdSchema),
  departmentController.get,
);

departmentRouter.patch(
  "/:id",
  requirePermission("department.update"),
  validate(updateDepartmentSchema),
  departmentController.update,
);

departmentRouter.delete(
  "/:id",
  requirePermission("department.delete"),
  validate(departmentIdSchema),
  departmentController.remove,
);

// ─── Designations ────────────────────────────────────────────────────────────

export const designationRouter = Router();

designationRouter.use(authenticate, requireScope("ORGANIZATION"));

designationRouter.get(
  "/",
  requirePermission("designation.read"),
  departmentController.listDesignations,
);

designationRouter.post(
  "/",
  requirePermission("designation.create"),
  validate(createDesignationSchema),
  departmentController.createDesignation,
);

designationRouter.get(
  "/:id",
  requirePermission("designation.read"),
  validate(designationIdSchema),
  departmentController.getDesignation,
);

designationRouter.patch(
  "/:id",
  requirePermission("designation.update"),
  validate(updateDesignationSchema),
  departmentController.updateDesignation,
);

designationRouter.delete(
  "/:id",
  requirePermission("designation.delete"),
  validate(designationIdSchema),
  departmentController.removeDesignation,
);
