import type { Request, Response, NextFunction } from "express";
import {
  getOrganizerPublicEventsService,
  getOrganizerPublicProfileService,
} from "../services/organizerProfile.service.js";
import { ApiError } from "../utils/api-error.js";

const parseOrganizerId = (value: unknown): bigint => {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new ApiError("ID organizer tidak valid", 400);
  }

  return BigInt(value);
};

export const getOrganizerPublicProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseOrganizerId(req.params.id);
    const profile = await getOrganizerPublicProfileService(id);

    res.status(200).json({ data: profile });
  } catch (error) {
    next(error);
  }
};

export const getOrganizerPublicEventsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const id = parseOrganizerId(req.params.id);
    const events = await getOrganizerPublicEventsService(id);

    res.status(200).json({ data: events });
  } catch (error) {
    next(error);
  }
};