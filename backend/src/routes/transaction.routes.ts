
import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import { createTransactionController } from "../controllers/transaction.controller.js";

const transactionRouter = Router();

transactionRouter.post(
  "/",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("CUSTOMER"),
  createTransactionController,
);

export default transactionRouter;
