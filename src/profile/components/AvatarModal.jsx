import { useState, useRef } from "react";
import { X, Upload, Trash2, Camera, AlertCircle, Check } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function AvatarModal({
  isOpen,
  onClose,
  userId,
  currentAvatarUrl,
  onAvatarUpdated
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedBlob, setSelectedBlob] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Process user image: center square crop and resize to 400x400 webp
  const processImage = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error("No file selected"));
      if (file.size > 5 * 1024 * 1024) {
        return reject(new Error("File size exceeds 5MB limit. Please choose a smaller image."));
      }
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.type)) {
        return reject(new Error("Unsupported file format. Please upload JPG, PNG, or WebP."));
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read the file."));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error("Failed to process the image."));
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const targetSize = 400;
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext("2d");

          // Center-crop square logic
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, targetSize, targetSize);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Image compression failed."));
              } else {
                resolve({ blob, preview: canvas.toDataURL("image/webp", 0.9) });
              }
            },
            "image/webp",
            0.9
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    try {
      const { blob, preview } = await processImage(file);
      setSelectedBlob(blob);
      setPreviewUrl(preview);
    } catch (err) {
      setError(err.message || "Failed to process image.");
    }
  };

  // Upload processed WebP to Supabase Storage avatars bucket
  const handleSaveAvatar = async () => {
    if (!selectedBlob || !userId) return;

    setLoading(true);
    setError("");

    try {
      const filePath = `${userId}/avatar.webp`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, selectedBlob, {
          contentType: "image/webp",
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const finalUrl = `${publicData.publicUrl}?v=${Date.now()}`;

      // Update profiles table
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: finalUrl })
        .eq("id", userId);

      if (dbError) {
        throw dbError;
      }

      // Sync with Navbar and parent component
      window.dispatchEvent(
        new CustomEvent("ksam:avatar-updated", { detail: { avatar_url: finalUrl } })
      );

      if (onAvatarUpdated) {
        onAvatarUpdated(finalUrl);
      }

      handleClose();
    } catch (err) {
      console.error("[Avatar Upload Error]", err);
      setError(err.message || "Failed to upload avatar. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Remove photo option
  const handleRemoveAvatar = async () => {
    if (!userId) return;

    setLoading(true);
    setError("");

    try {
      const filePath = `${userId}/avatar.webp`;
      await supabase.storage.from("avatars").remove([filePath]);

      const { error: dbError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userId);

      if (dbError) {
        throw dbError;
      }

      window.dispatchEvent(
        new CustomEvent("ksam:avatar-updated", { detail: { avatar_url: null } })
      );

      if (onAvatarUpdated) {
        onAvatarUpdated(null);
      }

      handleClose();
    } catch (err) {
      console.error("[Avatar Remove Error]", err);
      setError(err.message || "Failed to remove avatar.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPreviewUrl(null);
    setSelectedBlob(null);
    setError("");
    onClose();
  };

  return (
    <div className="ks-modal-backdrop" onClick={handleClose} role="dialog" aria-modal="true" aria-label="Upload Avatar Modal">
      <div className="ks-modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 440 }}>
        {/* Modal Header */}
        <div className="ks-modal-header">
          <h3 className="ks-modal-title">Profile Picture</h3>
          <button type="button" className="ks-modal-close-btn" onClick={handleClose} aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="ks-input-error" style={{ background: "rgba(239,68,68,0.1)", padding: "10px 14px", borderRadius: 10, marginBottom: 16 }}>
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        {/* Avatar Preview Display */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "20px 0" }}>
          <div
            style={{
              width: 150,
              height: 150,
              borderRadius: "50%",
              overflow: "hidden",
              border: "3px solid #2DFFB2",
              boxShadow: "0 0 25px rgba(45, 255, 178, 0.25)",
              background: "#080D15",
              position: "relative"
            }}
          >
            {previewUrl || currentAvatarUrl ? (
              <img
                src={previewUrl || currentAvatarUrl}
                alt="Avatar preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#748399"
                }}
              >
                <Camera size={44} />
              </div>
            )}
          </div>

          <p style={{ fontSize: 12, color: "#98A6BA", marginTop: 12, textAlign: "center" }}>
            JPG, PNG or WebP • Max 5MB • Automatically cropped to 400x400
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
          <button
            type="button"
            className="ks-btn-secondary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Upload size={16} />
            <span>Choose from Computer</span>
          </button>

          {selectedBlob && (
            <button
              type="button"
              className="ks-btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleSaveAvatar}
              disabled={loading}
            >
              {loading ? (
                <span>Uploading...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>Save New Photo</span>
                </>
              )}
            </button>
          )}

          {currentAvatarUrl && !selectedBlob && (
            <button
              type="button"
              className="ks-btn-danger"
              style={{ width: "100%", justifyContent: "center" }}
              onClick={handleRemoveAvatar}
              disabled={loading}
            >
              <Trash2 size={16} />
              <span>Remove Current Photo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
