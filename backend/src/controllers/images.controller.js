import { createImage, getAllImages, getImageById, deleteImage } from "../services/images.store.js";
import { uploadImageService, deleteImageService, getImageUrl } from "../services/images.service.js";
import { randomUUID } from "crypto";

export async function uploadUserImage(req, res) {
    try {
        const userId = req.user.sub;
        const file = req.file;

        if (!file) return res.status(400).json({ error: "No image provided" });

        const imageId = randomUUID();

        const meta = await uploadImageService({ userId, imageId, file });

        const image = await createImage(userId, {
            imageId,
            ...meta,
        });

        res.status(201).json(image);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to upload image" });
    }
}

export async function fetchImages(req, res) {
    try {
        const userId = req.user.sub;
        const images = await getAllImages(userId);

        const withUrls = await Promise.all(
            images.map(async img => ({
                ...img,
                url: await getImageUrl(img.key),
            }))
        );

        res.json(withUrls);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch images" });
    }
}

export async function deleteUserImage(req, res) {
    try {
        const userId = req.user.sub;
        const { imageId } = req.params;

        const image = await getImageById(userId, imageId);
        if (!image) return res.status(404).json({ error: "Not found" });

        await deleteImageService(image.key);
        await deleteImage(userId, imageId);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Delete failed" });
    }
}
