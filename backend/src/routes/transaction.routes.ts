
import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import { createTransactionController, getCustomerTransactionStatusController, getMyTransactionsController } from "../controllers/transaction.controller.js";

const transactionRouter = Router();

transactionRouter.post(
  "/",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("CUSTOMER"),
  createTransactionController,
);

transactionRouter.get(
  "/my-transactions",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("CUSTOMER"),
  getMyTransactionsController,
);

transactionRouter.get(
  "/:transactionId/status",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("CUSTOMER"),
  getCustomerTransactionStatusController,
);

export default transactionRouter;

