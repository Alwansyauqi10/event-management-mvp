import { Request, Response } from "express";
import {
  loginService,
  profileService,
  registerService,
} from "../services/auth.service.js";

export const registerController = async (req: Request, res: Response) => {
  const result = await registerService(req.body);
  res.status(201).send(result);
};
export const loginController = async (req: Request, res: Response) => {
  const result = await loginService(req.body);

  res.status(200).send(result);
};

export const profileController = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;

  const user = await profileService(userId);

  res.status(200).json({
    message: "Profile berhasil diakses",
    user: {
      ...user,
      id: user?.id.toString(),
    },
  });
};
