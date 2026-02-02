"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";

interface AddTextPoemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTextPoemModal({ isOpen, onClose, onSuccess }: AddTextPoemModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get all poems to calculate the correct order
      const poemsRes = await fetch("/api/poems");
      const allPoems = await poemsRes.json();
      const textPoems = allPoems.filter((p: any) => p.type === 'TEXT');
      const maxOrder = textPoems.length > 0 ? Math.max(...textPoems.map((p: any) => p.order ?? 0)) : -1;

      const response = await fetch("/api/poems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "TEXT", title, content, order: maxOrder + 1 }),
      });

      if (response.ok) {
        setTitle("");
        setContent("");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Error adding poem:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Text Poem</h3>
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

          <textarea
            className="modal-textarea"
            placeholder="Write your poem here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={12}
          />

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
                  <span>Add Poem</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
