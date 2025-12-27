"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Trash2, X } from "lucide-react";

export default function ImagesPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  async function fetchImages() {
    try {
      const res = await fetch("http://localhost:5000/images", {
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Failed to fetch images:", res.status);
        setImages([]);
        return;
      }

      const data = await res.json();
      setImages(data);
    } catch (error) {
      console.error("Error fetching images:", error);
      setImages([]);
    }
  }

  useEffect(() => {
    fetchImages();
  }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/images", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (res.ok) {
        fetchImages();
      } else {
        console.error("Upload failed:", res.status);
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(imageId) {
    try {
      const res = await fetch(`http://localhost:5000/images/${imageId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        fetchImages();
        setDeleteConfirm(null);
      } else {
        console.error("Delete failed:", res.status);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  }


  const getGridClass = (index) => {
    const patterns = [
      "col-span-2 row-span-2", // Large featured
      "col-span-1 row-span-1", // Regular
      "col-span-1 row-span-2", // Tall
      "col-span-2 row-span-1", // Wide
      "col-span-1 row-span-1", // Regular
      "col-span-1 row-span-1", // Regular
    ];
    return patterns[index % patterns.length];
  };

  return (
    <div className="h-screen flex flex-col max-w-7xl mx-auto px-6 py-3">
      {/* Fullscreen Modal */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-8"
            onClick={() => setFullscreenImage(null)}
          >
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X size={20} className="text-white" strokeWidth={1.5} />
            </button>
            <img
              src={fullscreenImage}
              className="max-w-full max-h-full rounded-xl object-contain"
              alt="fullscreen"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-md font-light text-slate-200">Image Gallery</h1>
            <p className="text-xs text-slate-500 font-light mt-0.5">
              {images.length} {images.length === 1 ? "image" : "images"}
            </p>
          </div>
        </div>

        <label className="cursor-pointer">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-5 py-2.5 text-xs border border-orange-500/30 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 transition-all text-orange-400 font-light"
          >
            <Upload size={14} strokeWidth={1.5} />
            {loading ? "Uploading..." : "Upload Image"}
          </motion.div>
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={handleUpload}
            disabled={loading}
          />
        </label>
      </div>

      {/* Gallery */}
      <div className="flex-1 overflow-auto">
        {images.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">

              <p className="text-sm text-slate-500 font-light">No images uploaded yet</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-4 auto-rows-[200px] gap-4 pb-6">
            {images?.map((img, idx) => (
              <motion.div
                key={img.imageId}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className={`${getGridClass(idx)} relative group rounded-xl overflow-hidden bg-white/5 border border-white/10 backdrop-blur-sm`}
              >
                <img
                  src={img.url}
                  alt={img.filename}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setFullscreenImage(img.url)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {deleteConfirm === img.imageId ? (
                    <div className="flex items-center gap-2 bg-black/80 backdrop-blur-sm rounded-lg p-1">
                      <button
                        onClick={() => handleDelete(img.imageId)}
                        className="px-2 py-1 text-[10px] bg-red-500/20 border border-red-500/30 rounded text-red-400 hover:bg-red-500/30 transition-colors"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-2 py-1 text-[10px] bg-white/10 border border-white/20 rounded text-slate-300 hover:bg-white/20 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setDeleteConfirm(img.imageId)}
                      className="p-2 rounded-lg bg-black/60 backdrop-blur-sm hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 transition-all"
                    >
                      <Trash2 size={14} className="text-slate-300 hover:text-red-400" strokeWidth={1.5} />
                    </motion.button>
                  )}
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-xs text-white font-light truncate">
                    {new Date(img.createdAt).toLocaleString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}