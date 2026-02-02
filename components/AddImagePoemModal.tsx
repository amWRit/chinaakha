"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

interface AddImagePoemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddImagePoemModal({ isOpen, onClose, onSuccess }: AddImagePoemModalProps) {
  const [title, setTitle] = useState("");
  const [driveLink, setDriveLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const extractFileId = (url: string): string => {
    // Extract file ID from various Google Drive URL formats
    const patterns = [
      /\/file\/d\/([^\/]+)/,  // https://drive.google.com/file/d/FILE_ID/view
      /id=([^&]+)/,           // https://drive.google.com/open?id=FILE_ID
      /\/d\/([^\/]+)/         // https://drive.google.com/uc?export=view&id=FILE_ID
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // If no pattern matches, assume it's already a file ID
    return url.trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fileId = extractFileId(driveLink);
      
      // Get all poems to calculate the correct order
      const poemsRes = await fetch("/api/poems");
      const allPoems = await poemsRes.json();
      const imagePoems = allPoems.filter((p: any) => p.type === 'IMAGE');
      const maxOrder = imagePoems.length > 0 ? Math.max(...imagePoems.map((p: any) => p.order ?? 0)) : -1;

      const response = await fetch("/api/poems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "IMAGE",
          title,
          image: { fileId },
          order: maxOrder + 1
        }),
      });

      if (response.ok) {
        setTitle("");
        setDriveLink("");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error adding image poem:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Image Poem</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <input
            type="text"
            className="modal-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <input
            type="text"
            className="modal-input"
            placeholder="e.g., https://drive.google.com/file/d/FILE_ID/view"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
            required
          />

          <div className="modal-helper-text">
            Paste the shareable link from Google Drive
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-btn modal-btn-cancel"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-btn modal-btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Adding..."
              ) : (
                <>
                  <Plus size={18} />
                  <span>Add Image</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
