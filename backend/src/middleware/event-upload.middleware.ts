
import multer from "multer";

const eventImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      callback(
        new Error("Poster harus berformat JPG, PNG, atau WEBP"),
      );
      return;
    }

    callback(null, true);
  },
});

export const uploadEventImage = eventImageUpload.single("image");
