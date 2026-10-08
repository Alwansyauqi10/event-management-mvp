import { NextFunction, Request, Response } from "express";
import { ApiError } from "../utils/api-error.js";
import jwt from "jsonwebtoken";

export const verifyToken = (secretKey: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //ambil authorization bagian setelah bearernya
    const token = req.headers.authorization?.split(" ")[1];

    //cek kalau tokennya gak ada maka throw error
    if (!token) {
      throw new ApiError("No token provided", 401);
    }

    try {
      //kalau token valid maka berisi data yang dimasukkan saat login
      const payload = jwt.verify(token, secretKey);
      res.locals.user = payload;
      next();
    } catch (error) {
      //kalau token expired maka return token expired
      if (error instanceof jwt.TokenExpiredError) {
        return next(new ApiError("Token expired", 401));
      }
      //kalau token invalid maka return token invalid
      return next(new ApiError("Token invalid", 401));
    }
  };
};
