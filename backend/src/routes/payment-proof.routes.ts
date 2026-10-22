
import { Router } from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";
import { uploadPaymentProof } from "../middleware/payment-proof-upload.middleware.js";
import { uploadPaymentProofController } from "../controllers/payment-proof.controller.js";

const paymentProofRouter = Router();

paymentProofRouter.post(
  "/:transactionId/payment-proof",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("CUSTOMER"),
  uploadPaymentProof,
  uploadPaymentProofController,
);

export default paymentProofRouter;
