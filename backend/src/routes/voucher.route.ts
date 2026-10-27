
import { Router } from "express";
import {
  createVoucherController,
  getEventVouchersController,
  updateVoucherController,
  deactivateVoucherController,
} from "../controllers/voucher.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { checkRole } from "../middleware/role.middleware.js";

const router = Router();

router.post(
  "/",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  createVoucherController,
);

router.get(
  "/events/:eventId",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  getEventVouchersController,
);

// Update voucher
router.patch(
  "/:voucherId",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  updateVoucherController,
);

router.delete(
  "/:voucherId",
  verifyToken(process.env.JWT_SECRET!),
  checkRole("ORGANIZER"),
  deactivateVoucherController,
);

export default router;
