import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../errors/app-error.js";

type RequestShape = {
  body: any;
  params: any;
  query: any;
};

export function validate(schema: ZodType<RequestShape>) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: request.body,
      params: request.params,
      query: request.query,
    });

    if (!result.success) {
      // Extract field-level errors from Zod issues, stripping the outer "body" path segment.
      const errors: Array<{ field: string; message: string }> = result.error.issues.map(
        (issue) => {
          const path = issue.path.filter((segment) => segment !== "body");
          return {
            field: path.join(".") || "_form",
            message: issue.message,
          };
        },
      );
      next(
        new AppError(
          422,
          "Validation failed.",
          "VALIDATION_ERROR",
          errors,
        ),
      );
      return;
    }

    request.body = result.data.body;
    Object.assign(request.params, result.data.params);
    next();
  };
}
