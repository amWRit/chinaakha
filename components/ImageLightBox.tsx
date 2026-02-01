import React, { useEffect } from "react";
import { X } from "lucide-react";
import Image from "next/image";

interface ImageLightboxProps {
  fileId: string;
  title?: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function ImageLightbox({ fileId, title, isOpen, onClose }: ImageLightboxProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Close">
        <X size={28} strokeWidth={2} />
      </button>

      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <Image
          src={`https://drive.google.com/uc?export=view&id=${fileId}`}
          alt={title || "Poem Image"}
          width={1200}
          height={1600}
          className="lightbox-image"
          style={{ 
            maxWidth: "100%", 
            maxHeight: "90vh",
            width: "auto",
            height: "auto",
            objectFit: "contain"
          }}
        />
        {title && (
          <div className="lightbox-title">
            <h2>{title}</h2>
          </div>
        )}
      </div>
    </div>
  );
}