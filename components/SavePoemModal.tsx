"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface SavePoemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
  content: string;
}

export default function SavePoemModal({
  isOpen,
  onClose,
  onSuccess,
  onError,
  content,
}: SavePoemModalProps) {
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get the max order
      const poemsRes = await fetch("/api/poems");
      const poems = await poemsRes.json();
      const maxOrder = poems.length > 0 ? Math.max(...poems.map((p: any) => p.order)) : 0;

      const response = await fetch("/api/poems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "TEXT",
          title: title.trim(),
          content: content.trim(),
          status: "DRAFT",
          order: maxOrder + 1,
        }),
      });

      if (response.ok) {
        setTitle("");
        onSuccess();
        onClose();
      } else {
        onError("Failed to save poem. Please try again.");
      }
    } catch (error) {
      console.error("Error saving poem:", error);
      onError("An error occurred while saving the poem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewLines = content.split('\n').slice(0, 4);
  const hasMore = content.split('\n').length > 4;
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', position: 'relative' }}>
        <button className="modal-close" onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px' }}>
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', color: '#e46c6e', paddingRight: '40px' }}>
          Save as Draft Poem
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Title Input */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#555' }}>
              Title <span style={{ color: '#e46c6e' }}>*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter poem title"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#e46c6e'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Content Preview */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontWeight: 600, color: '#555' }}>
                Content Preview
              </label>
              <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                {charCount} characters • {wordCount} words
              </div>
            </div>
            <div
              style={{
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#f9fafb',
                maxHeight: '150px',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                fontSize: '0.95rem',
                color: '#333',
                lineHeight: '1.6',
              }}
            >
              {previewLines.join('\n')}
              {hasMore && '\n...'}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: '#6b7280',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isSubmitting ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !content.trim() || !title.trim()}
              style={{
                padding: '10px 24px',
                border: 'none',
                borderRadius: '8px',
                backgroundColor: isSubmitting || !content.trim() || !title.trim() ? '#d1d5db' : '#e46c6e',
                color: '#fff',
                fontWeight: 600,
                cursor: isSubmitting || !content.trim() || !title.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isSubmitting ? 'Saving...' : 'Save as Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
