import type { Request, Response } from "express";
import { organizerDashboardService } from "../services/organizerDashboard.service.js";

export const organizerDashboardController = async (
  _req: Request,
  res: Response,
) => {
  const userId = res.locals.user.id as string;

  const result = await organizerDashboardService(userId);

  res.status(200).json({
    message: "Organizer dashboard berhasil diakses",
    data: result,
  });
};
