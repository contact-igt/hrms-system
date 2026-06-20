import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";

export function notFound(request: Request, _response: Response, next: NextFunction) {
  next(
    new AppError(
      404,
      `Route ${request.method} ${request.originalUrl} was not found.`,
      "ROUTE_NOT_FOUND",
    ),
  );
}

export function errorHandler(
  error: unknown,
  request: Request,
  response: Response,
  next: NextFunction,
) {
  void next;
  const appError =
    error instanceof AppError
      ? error
      : new AppError(500, "An unexpected error occurred.");

  if (appError.statusCode >= 500) {
    console.error(`[${request.requestId}]`, error);
  }

  response.status(appError.statusCode).json({
    success: false,
    message: appError.message,
    code: appError.code,
    errors: appError.details,
    requestId: request.requestId,
  });
}
