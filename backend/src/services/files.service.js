import { supabase } from "../config/supabase.js";

export async function uploadFile({ userId, noteId, file }) {
    const path = `notes/${userId}/${noteId}/${file.originalname}`;

    const { error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
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

export async function deleteFile(key) {
    if (!key) return;

    await supabase.storage.from(process.env.SUPABASE_BUCKET).remove([key]);
}

export async function getSignedUrl(key) {
    if (!key) return null;

    const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_BUCKET)
        .createSignedUrl(key, 60 * 60); // 1 hour

    if (error) throw error;

    return data.signedUrl;
}