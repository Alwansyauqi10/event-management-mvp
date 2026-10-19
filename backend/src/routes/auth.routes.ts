import express from "express";
import {
  changePasswordController,
  forgotPasswordController,
  loginController,
  profileController,
  registerController,
  resetPasswordController,
  updateProfileController,
  updateProfilePictureController,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validator.middleware.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from "../validator/auth.validator.js";
import { uploadProfilePicture } from "../middleware/upload.middleware.js";
const authRoutes = express.Router();

authRoutes.post("/register", validate(registerSchema), registerController);
authRoutes.post("/login", validate(loginSchema), loginController);
authRoutes.get(
  "/profile",
  verifyToken(process.env.JWT_SECRET!),
  profileController,
);
authRoutes.put(
  "/edit-profile",
  verifyToken(process.env.JWT_SECRET!),
  validate(updateProfileSchema),
  updateProfileController,
);
authRoutes.put(
  "/change-password",
  verifyToken(process.env.JWT_SECRET!),
  validate(changePasswordSchema),
  changePasswordController,
);

authRoutes.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  forgotPasswordController,
);
authRoutes.post(
  "/reset-password",
  validate(resetPasswordSchema),
  resetPasswordController,
);
authRoutes.put(
  "/profile-picture",
  verifyToken(process.env.JWT_SECRET!),
  uploadProfilePicture,
  updateProfilePictureController,
);
export { authRoutes };
