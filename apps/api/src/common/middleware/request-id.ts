import type { NextFunction, Request, Response } from "express";
import { createId } from "../utils/crypto.js";

export function requestId(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  request.requestId = request.header("x-request-id") ?? createId();
  response.setHeader("x-request-id", request.requestId);
  next();
}
