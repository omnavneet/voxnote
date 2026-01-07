"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, X, FileImage, Image as ImageIcon } from "lucide-react";

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
          className="mb-6 p-4 rounded-xl bg-[#E8503A] border-2 border-[#2D2B28] text-white font-bold shadow-[4px_4px_0px_0px_#2D2B28]"
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
            className="fixed inset-0 z-[100] bg-[#2D2B28]/95 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setFullscreenImage(null)}
          >
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-6 right-6 p-3 rounded-xl bg-[#E8503A] border-2 border-[#FAF5EE] hover:bg-[#FFC94D] hover:text-[#2D2B28] transition-all text-[#FAF5EE] shadow-[2px_2px_0px_0px_#FAF5EE]"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={fullscreenImage}
              className="max-w-[90vw] max-h-[85vh] rounded-xl border-4 border-[#FAF5EE] object-contain shadow-[8px_8px_0px_0px_#000]"
              alt="fullscreen"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 md:mb-8">
        <div>
          <div className="flex items-center gap-3 mt-3">
            <div className="px-3 py-1 bg-[#2D2B28] rounded-full border border-[#2D2B28]">
                <span className="text-xs font-bold text-[#4ECDC4] tracking-wider">
                {images.length} {images.length === 1 ? "SNAP" : "SNAPS"}
                </span>
            </div>
          </div>
        </div>

        <label className="cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.02, y: -2, boxShadow: "4px 4px 0px 0px #2D2B28" }}
            whileTap={{ scale: 0.98, y: 0, boxShadow: "0px 0px 0px 0px #2D2B28" }}
            className={`flex items-center justify-center gap-3 px-6 py-4 text-sm border-2 border-[#2D2B28] rounded-xl shadow-[2px_2px_0px_0px_#2D2B28] transition-all font-black uppercase tracking-wide ${
                loading ? "bg-[#FAF5EE] text-[#2D2B28]/50" : "bg-[#4ECDC4] text-[#2D2B28]"
            }`}
          >
            <Upload size={20} strokeWidth={3} />
            {loading ? "Uploading..." : "Upload Image"}
          </motion.div>
          <input type="file" accept="image/*" hidden onChange={handleUpload} disabled={loading} />
        </label>
      </div>

      <div className="flex-1 overflow-auto pr-2 custom-scrollbar">
        {images.length === 0 ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-[#2D2B28]/20 rounded-3xl bg-[#FAF5EE]/50">
            <div className="text-center opacity-50">
              <div className="w-24 h-24 rounded-full bg-[#2D2B28] flex items-center justify-center mx-auto mb-6">
                <ImageIcon size={40} className="text-[#FAF5EE]" strokeWidth={1.5} />
              </div>
              <p className="text-lg text-[#2D2B28] font-black uppercase tracking-widest">No images yet</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 pb-6">
            {images.map((img, idx) => (
              <motion.div
                key={img.imageId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="relative group rounded-xl overflow-hidden bg-white border-2 border-[#2D2B28] shadow-[4px_4px_0px_0px_#2D2B28] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#2D2B28] transition-all duration-200 aspect-square flex flex-col"
              >
                <div className="flex-1 w-full h-full p-2 overflow-hidden bg-[#FAF5EE]">
                  <img
                    src={img.url}
                    alt={img.filename}
                    className="w-full h-full object-cover rounded-lg border border-[#2D2B28]/10 cursor-pointer hover:scale-105 transition-transform duration-500"
                    onClick={() => setFullscreenImage(img.url)}
                  />
                </div>

                <div className="absolute top-4 right-4 z-10">
                  {deleteConfirm === img.imageId ? (
                    <div className="flex items-center gap-2 bg-[#FAF5EE] border-2 border-[#2D2B28] rounded-xl p-1.5 shadow-[2px_2px_0px_0px_#2D2B28]">
                      <button
                        onClick={() => handleDelete(img.imageId)}
                        disabled={deletingId === img.imageId}
                        className="px-3 py-1.5 text-xs bg-[#E8503A] border border-[#2D2B28] rounded-lg text-white font-bold hover:opacity-80 transition-all disabled:opacity-50"
                      >
                        {deletingId === img.imageId ? "..." : "Confirm"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 text-xs bg-white border border-[#2D2B28] rounded-lg text-[#2D2B28] font-bold hover:bg-gray-100 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDeleteConfirm(img.imageId)}
                      className="p-2 rounded-xl bg-[#FAF5EE] border-2 border-[#2D2B28] shadow-[2px_2px_0px_0px_#2D2B28] hover:bg-[#E8503A] hover:text-white transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
                    >
                      <Trash2 size={18} strokeWidth={2.5} />
                    </motion.button>
                  )}
                </div>

                <div className="bg-[#2D2B28] py-2 px-3 flex justify-center border-t-2 border-[#2D2B28]">
                    <p className="text-[10px] md:text-xs text-[#FAF5EE] font-mono font-bold tracking-widest truncate">
                        {new Date(img.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                    </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #2D2B28;
          border-radius: 4px;
          border: 2px solid #FFF9E6;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}