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
      next(
        new AppError(
          422,
          "Validation failed.",
          "VALIDATION_ERROR",
          result.error.flatten(),
        ),
      );
      return;
    }

    request.body = result.data.body;
    Object.assign(request.params, result.data.params);
    next();
  };
}
