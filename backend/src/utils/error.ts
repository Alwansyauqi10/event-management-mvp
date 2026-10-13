import type { ErrorRequestHandler, RequestHandler } from "express";
import { ApiError } from "./api-error.js";

export const globalError: ErrorRequestHandler = (
  err: unknown,
  req,
  res,
  next,
) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof ApiError) {
    return res.status(err.status).json({
      message: err.message,
    });
  }

  console.error("Unexpected error:", err);

  return res.status(500).json({
    message: "Internal server error",
  });
};

export const notFoundError: RequestHandler = (_req, res) => {
  return res.status(404).json({
    message: "Route not found",
  });
};
