"use client";

import { useState } from "react";
import { Plus, FileText, Image as ImageIcon, X } from "lucide-react";

interface AdminFABProps {
  onAddTextPoem: () => void;
  onAddImagePoem: () => void;
}

export default function AdminFAB({ onAddTextPoem, onAddImagePoem }: AdminFABProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <>
      {/* FAB Main Button */}
      <button
        className={`fab-main ${isOpen ? 'fab-open' : ''}`}
        onClick={toggleMenu}
        aria-label="Add Poem"
      >
        <Plus size={24} className="fab-icon" />
        <X size={24} className="fab-icon-close" />
      </button>

      {/* Backdrop */}
      {isOpen && <div className="fab-backdrop" onClick={toggleMenu} />}

      {/* FAB Menu Options */}
      <div className={`fab-menu ${isOpen ? 'fab-menu-open' : ''}`}>
        <button
          className="fab-option fab-option-1"
          onClick={() => {
            setIsOpen(false);
            onAddTextPoem();
          }}
          aria-label="Add Text Poem"
        >
          <FileText size={20} />
          <span>Text Poem</span>
        </button>

        <button
          className="fab-option fab-option-2"
          onClick={() => {
            setIsOpen(false);
            onAddImagePoem();
          }}
          aria-label="Add Image Poem"
        >
          <ImageIcon size={20} />
          <span>Image Poem</span>
        </button>
      </div>
    </>
  );
}
