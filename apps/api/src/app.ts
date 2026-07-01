import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { errorHandler, notFound } from "./common/middleware/error-handler.js";
import { requestId } from "./common/middleware/request-id.js";
import { sendSuccess } from "./common/utils/response.js";
import { env } from "./config/env.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { departmentRouter, designationRouter } from "./modules/departments/department.routes.js";
import { employeeRouter } from "./modules/employees/employee.routes.js";
import { organizationRouter } from "./modules/organizations/organization.routes.js";
import { platformRouter } from "./modules/platform/platform.routes.js";

export const app = express();

app.set("trust proxy", 1);
app.use(requestId);
app.use(helmet());
app.use(
  cors({
    origin: env.WEB_URL,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "1mb" }));
app.use(cookieParser());
app.use(
  rateLimit({
    windowMs: 15 * 60_000,
    limit: 500,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  }),
);

app.get("/api/v1/health", (_request, response) => {
  sendSuccess(response, {
    status: "healthy",
    service: "hrms-api",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/platform", platformRouter);
app.use("/api/v1/organization", organizationRouter);
app.use("/api/v1/employees", employeeRouter);
app.use("/api/v1/departments", departmentRouter);
app.use("/api/v1/designations", designationRouter);

app.get("/api/v1/auth/sso/:provider/start", (request, response) => {
  response.status(501).json({
    success: false,
    message: `${request.params.provider} SSO is not configured yet.`,
    code: "SSO_NOT_CONFIGURED",
    requestId: request.requestId,
  });
});
app.get("/api/v1/auth/sso/:provider/callback", (request, response) => {
  response.status(501).json({
    success: false,
    message: `${request.params.provider} SSO callback is not configured yet.`,
    code: "SSO_NOT_CONFIGURED",
    requestId: request.requestId,
  });
});

app.use(notFound);
app.use(errorHandler);
