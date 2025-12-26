import express from "express";
import { uploadImage, getImages, deleteImage } from "../controllers/images.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();
router.use(requireAuth);

router.post("/", upload.single("image"), uploadImage);
router.get("/", getImages);
router.delete("/:imageId", deleteImage);