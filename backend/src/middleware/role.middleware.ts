import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import { UserRole } from "../generated/prisma/enums.js";

export const checkRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!allowedRoles.includes(user.role)) {
      throw new ApiError("Forbidden", 403);
    }

    next();
  };
};
