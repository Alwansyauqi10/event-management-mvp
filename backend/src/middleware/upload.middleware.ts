import multer from "multer";
import { ApiError } from "../utils/api-error.js";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

export const uploadProfilePicture = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // Maksimal 2 MB
    files: 1,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return callback(
        new ApiError("Format foto harus JPG, PNG, atau WEBP", 400),
      );
    }

    callback(null, true);
  },
}).single("profilePicture");
