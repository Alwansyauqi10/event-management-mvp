import express from "express";
import {
  loginController,
  profileController,
  registerController,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
const authRoutes = express.Router();

authRoutes.post("/register", registerController);
authRoutes.post("/login", loginController);
authRoutes.get(
  "/profile",
  verifyToken(process.env.JWT_SECRET!),
  profileController,
);

authRoutes.get(
  "/organizer-test",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  (req, res) => {
    res.json({
      message: "Kamu adalah organizer!",
      user: res.locals.user,
    });
  },
);

export { authRoutes };
