import express from "express";
import { uploadUserImage, fetchImages, deleteUserImage } from "../controllers/images.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();
router.use(requireAuth);

router.post("/images", upload.single("image"), uploadUserImage);
router.get("/images", fetchImages);
router.delete("/images/:imageId", deleteUserImage);

export default router;