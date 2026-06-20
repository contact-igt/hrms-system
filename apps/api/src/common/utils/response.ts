import type { Response } from "express";

export function sendSuccess<T>(
  response: Response,
  data: T,
  message = "Request completed successfully.",
  statusCode = 200,
) {
  response.status(statusCode).json({
    success: true,
    message,
    data,
  });
}
