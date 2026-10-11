import { Request, Response } from "express";
import {
  changePasswordService,
  forgotPasswordService,
  loginService,
  profileService,
  registerService,
  resetPasswordService,
  updateProfileService,
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

export const updateProfileController = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;

  const user = await updateProfileService(userId, req.body);

  res.status(200).json({
    message: "Profile berhasil diperbarui",
    user: {
      ...user,
      id: user.id.toString(),
    },
  });
};
export const changePasswordController = async (req: Request, res: Response) => {
  const userId = res.locals.user.id;

  const result = await changePasswordService(userId, req.body);

  res.status(200).json(result);
};

export const forgotPasswordController = async (req: Request, res: Response) => {
  const result = await forgotPasswordService(req.body);

  res.status(200).json(result);
};
export const resetPasswordController = async (req: Request, res: Response) => {
  const result = await resetPasswordService({
    token: req.body.token,
    newPassword: req.body.newPassword,
  });
  res.status(200).send(result);
};
