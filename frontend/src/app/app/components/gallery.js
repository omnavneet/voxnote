"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, X, FileImage } from "lucide-react";

export default function ImagesPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  async function fetchImages() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images`, { credentials: "include" });
      if (!res.ok) return setImages([]);
      const data = await res.json();
      setImages(data);
    } catch {
      setImages([]);
      setError("Failed to load images");
    }
  }

  useEffect(() => {
    fetchImages();
  }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file || loading) return;

    const formData = new FormData();
    formData.append("image", file);
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      if (!res.ok) throw new Error();
      await fetchImages();
    } catch {
      setError("Failed to upload image");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(imageId) {
    if (deletingId) return;
    setDeletingId(imageId);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/images/${imageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error();
      await fetchImages();
      setDeleteConfirm(null);
    } catch {
      setError("Failed to delete image");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex flex-col max-w-7xl mx-auto h-[calc(100vh-200px)] md:h-[calc(100vh-180px)]">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium shadow-sm"
        >
          {error}
        </motion.div>
      )}

      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setFullscreenImage(null)}
          >
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-6 right-6 p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-all"
            >
              <X size={20} className="text-white" strokeWidth={2} />
            </button>
            <img
              src={fullscreenImage}
              className="max-w-full max-h-full rounded-2xl object-contain"
              alt="fullscreen"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">Image Gallery</h1>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-2 h-2 rounded-full bg-pink-500" />
            <p className="text-sm text-gray-600 font-semibold">
              {images.length} {images.length === 1 ? "image" : "images"}
            </p>
          </div>
        </div>

        <label className="cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl shadow-lg shadow-pink-300/50 hover:shadow-xl hover:shadow-pink-400/60 transition-all text-white font-bold disabled:opacity-50"
          >
            <Upload size={18} strokeWidth={2.5} />
            {loading ? "Uploading..." : "Upload Image"}
          </motion.div>
          <input type="file" accept="image/*" hidden onChange={handleUpload} disabled={loading} />
        </label>
      </div>

      <div className="flex-1 overflow-auto">
        {images.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-100 to-rose-100 border border-pink-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <FileImage size={32} className="text-pink-600" strokeWidth={2} />
              </div>
              <p className="text-sm text-gray-500 font-medium">No images uploaded yet</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 pb-6">
            {images.map((img, idx) => (
              <motion.div
                key={img.imageId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className="relative group rounded-3xl overflow-hidden bg-white/90 border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300 aspect-square"
              >
                <div className="w-full h-full p-3">
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="w-full h-full object-contain cursor-pointer"
                    onClick={() => setFullscreenImage(img.url)}
                  />
                </div>

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {deleteConfirm === img.imageId ? (
                    <div className="flex items-center gap-2 bg-white/95 backdrop-blur-xl rounded-2xl p-1.5 shadow-lg">
                      <button
                        onClick={() => handleDelete(img.imageId)}
                        disabled={deletingId === img.imageId}
                        className="px-3 py-1.5 text-xs bg-red-100 border border-red-200 rounded-xl text-red-600 font-bold hover:bg-red-200 transition-all disabled:opacity-50"
                      >
                        {deletingId === img.imageId ? "..." : "Delete"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 text-xs bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-bold hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDeleteConfirm(img.imageId)}
                      className="p-2.5 rounded-2xl bg-white/95 backdrop-blur-xl hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all shadow-lg"
                    >
                      <Trash2 size={16} className="text-gray-600 hover:text-red-600" strokeWidth={2} />
                    </motion.button>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-b-3xl">
                  <p className="text-xs text-white font-semibold truncate">
                    {new Date(img.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .overflow-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-auto::-webkit-scrollbar-track {
          background: rgba(243, 244, 246, 0.5);
          border-radius: 10px;
        }
        .overflow-auto::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
          border-radius: 10px;
        }
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.7);
        }
      `}</style>
    </div>
  );
}