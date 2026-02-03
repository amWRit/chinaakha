"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Download, Trash2, FileText, ChevronDown, ChevronUp, MousePointerClick, Save } from "lucide-react";
import { useNepaliTransliteration } from "@/lib/useNepaliTransliteration";
import TransliterationSuggestions from "../TransliterationSuggestions";
import UnicodeTips from "./UnicodeTips";
import SavePoemModal from "../SavePoemModal";
import dynamic from "next/dynamic";
const Toast = dynamic(() => import("../Toast"), { ssr: false });

export default function UnicodeConverter() {
  const [romanizedText, setRomanizedText] = useState("");
  const [nepaliText, setNepaliText] = useState("");
  const [showTips, setShowTips] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const hasLoadedFromStorage = useRef(false);

  const transliteration = useNepaliTransliteration(romanizedText, setRomanizedText, {
    enabled: true,
    fieldName: 'unicode-converter',
  });

  // Check admin authentication status
  useEffect(() => {
    fetch("/api/admins", { method: "GET" })
      .then((res) => {
        if (res.status === 200 && res.headers.get("x-admin-authenticated") === "true") {
          setIsAdminAuthenticated(true);
        }
      })
      .catch(() => setIsAdminAuthenticated(false));
  }, []);

  // Load from localStorage on mount (before auto-save effect)
  useEffect(() => {
    if (!hasLoadedFromStorage.current) {
      const saved = localStorage.getItem('unicode-converter-text');
      if (saved) {
        setRomanizedText(saved);
      }
      hasLoadedFromStorage.current = true;
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    if (autoSave && hasLoadedFromStorage.current) {
      localStorage.setItem('unicode-converter-text', romanizedText);
    }
  }, [romanizedText, autoSave]);

  // Update Nepali text whenever romanized text changes
  useEffect(() => {
    setNepaliText(romanizedText);
  }, [romanizedText]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(nepaliText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([nepaliText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nepali-unicode.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (romanizedText) {
      setShowClearModal(true);
    }
  };

  const confirmClear = () => {
    setRomanizedText("");
    setNepaliText("");
    localStorage.removeItem('unicode-converter-text');
    setShowClearModal(false);
  };

  const handleSelectAll = () => {
    const outputElement = document.querySelector('.unicode-output-text') as HTMLElement;
    if (outputElement) {
      const range = document.createRange();
      range.selectNodeContents(outputElement);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  const charCount = nepaliText.length;
  const wordCount = nepaliText.trim() ? nepaliText.trim().split(/\s+/).length : 0;

  return (
    <div className="unicode-converter">
      {/* Tips Section */}
      <div className="unicode-tips-toggle">
        <button 
          className="tips-toggle-btn"
          onClick={() => setShowTips(!showTips)}
        >
          {showTips ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          <span>Tips & Tricks</span>
        </button>
      </div>

      {showTips && <UnicodeTips />}

      {/* Converter Panes */}
      <div className="unicode-panes">
        {/* Input Pane */}
        <div className="unicode-pane unicode-input-pane">
          <div className="pane-header">
            <h3>
              <FileText size={18} />
              <span className="header-text-long">Input</span>
              <span className="header-text-short">Input</span>
            </h3>
            <div className="pane-actions">
              <button 
                className="pane-btn pane-btn-secondary"
                onClick={handleClear}
                title="Clear all"
              >
                <Trash2 size={16} />
                <span>Clear</span>
              </button>
            </div>
          </div>
          <div className="pane-content">
            <div className="input-with-suggestions" style={{ width: '100%', height: '100%' }}>
              <textarea
                className="unicode-textarea unicode-input"
                placeholder="Type in English... (e.g., namaste, kasto cha)"
                value={romanizedText}
                onChange={(e) => transliteration.handleChange(e.target.value)}
                onKeyDown={transliteration.handleKeyDown}
                spellCheck={false}
              />
              {showSuggestions && (
                <TransliterationSuggestions
                  suggestions={transliteration.suggestions}
                  selectedIndex={transliteration.selectedIndex}
                  onSelect={transliteration.applySuggestion}
                  show={transliteration.showSuggestions}
                />
              )}
            </div>
          </div>
        </div>

        {/* Output Pane */}
        <div className="unicode-pane unicode-output-pane">
          <div className="pane-header">
            <h3>
              <FileText size={18} />
              <span className="header-text-long">Output</span>
              <span className="header-text-short">Output</span>
            </h3>
            <div className="pane-actions">
              {isAdminAuthenticated && (
                <button 
                  className="pane-btn pane-btn-primary"
                  onClick={() => setShowSaveModal(true)}
                  title="Save as draft poem"
                  disabled={!nepaliText.trim()}
                >
                  <Save size={16} />
                  <span className="btn-text-desktop">Save as Draft</span>
                </button>
              )}
              <button 
                className={`pane-btn ${copySuccess ? 'pane-btn-success' : ''}`}
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                <Copy size={16} />
                <span>{copySuccess ? 'Copied!' : 'Copy'}</span>
              </button>
              <button 
                className="pane-btn"
                onClick={handleDownload}
                title="Download as text file"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
              <button 
                className="pane-btn pane-btn-secondary"
                onClick={handleSelectAll}
                title="Select all text"
              >
                <MousePointerClick size={16} />
                <span>Select All</span>
              </button>
            </div>
          </div>
          <div className="pane-content">
            <div className="unicode-output-text" dir="auto">
              {nepaliText || <span className="placeholder-text">युनिकोड यहाँ देखिन्छ...</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Options & Stats */}
      <div className="unicode-footer">
        <div className="unicode-options">
          <label className="unicode-checkbox">
            <input
              type="checkbox"
              checked={showSuggestions}
              onChange={(e) => setShowSuggestions(e.target.checked)}
            />
            <span>Show suggestions while typing</span>
          </label>
          <label className="unicode-checkbox">
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
            />
            <span>Auto-save text (saves to your browser)</span>
          </label>
        </div>
        <div className="unicode-stats">
          <span>Characters: {charCount}</span>
          <span>•</span>
          <span>Words: {wordCount}</span>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="unicode-modal-overlay" onClick={() => setShowClearModal(false)}>
          <div className="unicode-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Clear All Text?</h3>
            <p>This will clear all your input and output text. This action cannot be undone.</p>
            <div className="unicode-modal-actions">
              <button 
                className="unicode-modal-btn unicode-modal-btn-cancel"
                onClick={() => setShowClearModal(false)}
              >
                Cancel
              </button>
              <button 
                className="unicode-modal-btn unicode-modal-btn-confirm"
                onClick={confirmClear}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Poem Modal */}
      <SavePoemModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSuccess={() => {
          setToastMessage("Poem saved to drafts successfully!");
        }}
        onError={(message) => setToastMessage(message)}
        content={nepaliText}
      />

      {/* Toast Message */}
      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
