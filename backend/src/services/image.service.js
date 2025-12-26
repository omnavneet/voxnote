import { supabase } from "../config/supabase.js";

export async function uploadImage({ userId, file }) {
    const ext = file.originalname.split(".").pop().toLowerCase();
    if (!["jpg", "jpeg", "png", "webp"].includes(ext)) {
        throw new Error("Only images allowed");
    }

    const path = `images/${userId}/${Date.now()}-${file.originalname}`;

    const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_2)
        .upload(path, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });

    if (error) throw error;

    return {
        key: path,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
    };
}

export async function deleteImage(key) {
    if (!key) return;
    await supabase.storage.from(process.env.SUPABASE_BUCKET_2).remove([key]);
}

export async function getImageUrl(key) {
    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET_2)
        .createSignedUrl(key, 60 * 60);

    if (error) throw error;
    return data.signedUrl;
}
