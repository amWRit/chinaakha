"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { useNepaliTransliteration } from "../lib/useNepaliTransliteration";
import TransliterationSuggestions from "./TransliterationSuggestions";

interface AddTextPoemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTextPoemModal({ isOpen, onClose, onSuccess }: AddTextPoemModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useRomanizedNepali, setUseRomanizedNepali] = useState(false);

  const titleTransliteration = useNepaliTransliteration(title, setTitle, {
    enabled: useRomanizedNepali,
    fieldName: 'title',
  });

  const contentTransliteration = useNepaliTransliteration(content, setContent, {
    enabled: useRomanizedNepali,
    fieldName: 'content',
  });

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
          <div className="romanized-toggle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75em', flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5em', margin: 0, padding: 0 }}>
              <input
                type="checkbox"
                checked={useRomanizedNepali}
                onChange={(e) => {
                  setUseRomanizedNepali(e.target.checked);
                  if (!e.target.checked) {
                    titleTransliteration.clearSuggestions();
                    contentTransliteration.clearSuggestions();
                  }
                }}
              />
              <span style={{ color: '#222' }}>Romanized Nepali</span>
            </label>
            <a href="/tools/unicode" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9em', color: '#666', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
              Unicode Tool
            </a>
          </div>

          <div className="input-with-suggestions">
            <input
              type="text"
              className="modal-input"
              placeholder="Title"
              value={title}
              onChange={(e) => titleTransliteration.handleChange(e.target.value)}
              onKeyDown={titleTransliteration.handleKeyDown}
              required
            />
            <TransliterationSuggestions
              suggestions={titleTransliteration.suggestions}
              selectedIndex={titleTransliteration.selectedIndex}
              onSelect={titleTransliteration.applySuggestion}
              show={titleTransliteration.showSuggestions}
            />
          </div>

          <div className="input-with-suggestions">
            <textarea
              className="modal-textarea"
              placeholder="Write your poem here..."
              value={content}
              onChange={(e) => contentTransliteration.handleChange(e.target.value)}
              onKeyDown={contentTransliteration.handleKeyDown}
              required
              rows={12}
            />
            <TransliterationSuggestions
              suggestions={contentTransliteration.suggestions}
              selectedIndex={contentTransliteration.selectedIndex}
              onSelect={contentTransliteration.applySuggestion}
              show={contentTransliteration.showSuggestions}
            />
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
              {isSubmitting ? "Adding..." : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
