import { NextFunction, Request, Response } from "express";
import { ApiError } from "./api-error.js";
export const globalError = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log("ERROR MESSAGE:", err.message);
  console.log("ERROR STATUS:", err.status);
  const message = err.message || "something went wrong";
  const status = err.status || 500;

  return res.status(status).send({ message: message });
};

export const notFoundError = (req: Request, res: Response) => {
  res.status(404).send({ message: "Route not found" });
};
