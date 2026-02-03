import { useEffect, useState } from "react";
import { Pencil, Trash, Plus, GripVertical } from "lucide-react";
import Modal from "./Modal";
import Markdown from "../Markdown";
import Toast from "../Toast";
import { useNepaliTransliteration } from "../../lib/useNepaliTransliteration";
import TransliterationSuggestions from "../TransliterationSuggestions";

export default function PoemsTextTab() {
  const [poems, setPoems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPoem, setSelectedPoem] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [poemToDelete, setPoemToDelete] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [useRomanizedNepali, setUseRomanizedNepali] = useState(false);

  const titleTransliteration = useNepaliTransliteration(title, setTitle, {
    enabled: useRomanizedNepali,
    fieldName: 'title',
  });

  const contentTransliteration = useNepaliTransliteration(content, setContent, {
    enabled: useRomanizedNepali,
    fieldName: 'content',
  });

  useEffect(() => {
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'TEXT').sort((a:any, b:any) => (a.order ?? 0) - (b.order ?? 0))));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        // Update existing poem
        await fetch("/api/poems", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, title, content })
        });
      } else {
        // Add new poem with correct order
        const poemsRes = await fetch("/api/poems");
        const allPoems = await poemsRes.json();
        const textPoems = allPoems.filter((p:any) => p.type === 'TEXT');
        const maxOrder = textPoems.length > 0 ? Math.max(...textPoems.map((p:any) => p.order ?? 0)) : -1;
        await fetch("/api/poems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: 'TEXT', title, content, order: maxOrder + 1 })
        });
      }
      setTitle("");
      setContent("");
      setEditingId(null);
      setShowModal(false);
      setToastMessage(editingId ? "Poem updated successfully!" : "Poem added successfully!");
      fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'TEXT').sort((a:any, b:any) => (a.order ?? 0) - (b.order ?? 0))));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (poem: any) => {
    setEditingId(poem.id);
    setUseRomanizedNepali(false);
    setTitle(poem.title || "");
    setContent(poem.content || "");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setTitle("");
    setContent("");
    setUseRomanizedNepali(false);
    titleTransliteration.clearSuggestions();
    contentTransliteration.clearSuggestions();
  };

  const requestDelete = (id: string) => {
    setPoemToDelete(id);
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    if (!poemToDelete) return;
    
    // Delete the poem
    await fetch("/api/poems", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: poemToDelete })
    });
    
    // Fetch updated poems and reorder them
    const res = await fetch("/api/poems");
    const allPoems = await res.json();
    const textPoems = allPoems.filter((p: any) => p.type === 'TEXT').sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    
    // Reorder to fill gaps
    const updates = textPoems.map((poem: any, index: number) => ({
      id: poem.id,
      order: index
    }));
    
    if (updates.length > 0) {
      await fetch("/api/poems", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates })
      });
    }
    
    setShowConfirmModal(false);
    setPoemToDelete(null);
    setToastMessage("Poem deleted successfully!");
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'TEXT')));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPoems = [...poems];
    const draggedPoem = newPoems[draggedIndex];
    newPoems.splice(draggedIndex, 1);
    newPoems.splice(index, 0, draggedPoem);
    
    setPoems(newPoems);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;
    
    // Update order in database
    const updates = poems.map((poem, index) => ({
      id: poem.id,
      order: index
    }));

    await fetch("/api/poems", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates })
    });

    setDraggedIndex(null);
  };

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    setDraggedIndex(index);
    setTouchStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (draggedIndex === null || touchStartY === null) return;
    
    const currentY = e.touches[0].clientY;
    const delta = currentY - touchStartY;
    
    // Calculate approximate item height (including padding and gap)
    const itemHeight = 90; // Approximate height of each list item
    const indexChange = Math.round(delta / itemHeight);
    
    if (indexChange !== 0) {
      const newIndex = Math.max(0, Math.min(poems.length - 1, draggedIndex + indexChange));
      
      if (newIndex !== draggedIndex) {
        const newPoems = [...poems];
        const draggedPoem = newPoems[draggedIndex];
        newPoems.splice(draggedIndex, 1);
        newPoems.splice(newIndex, 0, draggedPoem);
        
        setPoems(newPoems);
        setDraggedIndex(newIndex);
        setTouchStartY(currentY);
      }
    }
  };

  const handleTouchEnd = async () => {
    if (draggedIndex === null) return;
    
    // Update order in database
    const updates = poems.map((poem, index) => ({
      id: poem.id,
      order: index
    }));

    await fetch("/api/poems", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ updates })
    });

    setDraggedIndex(null);
    setTouchStartY(null);
  };

  const handleViewPoem = (poem: any) => {
    setSelectedPoem(poem);
    setShowViewModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <button className="admin-btn add" onClick={() => setShowModal(true)}>
        <Plus size={18} />
        <span className="admin-btn-text">Add</span>
      </button>

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? "Update Text Poem" : "Add Text Poem"}>
        <form className="admin-form" onSubmit={handleAdd}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75em', flexWrap: 'wrap', marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, padding: 0, color: '#333', fontSize: '0.95rem', fontWeight: 500 }}>
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
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Romanized Nepali</span>
            </label>
            <a href="/tools/unicode" target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.9em', color: '#666', whiteSpace: 'nowrap', marginLeft: 'auto' }}>
              Unicode Tool
            </a>
          </div>

          <div className="input-with-suggestions" style={{ width: '100%' }}>
            <input 
              placeholder="Title" 
              value={title} 
              onChange={(e) => titleTransliteration.handleChange(e.target.value)}
              onKeyDown={titleTransliteration.handleKeyDown}
              required 
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            <TransliterationSuggestions
              suggestions={titleTransliteration.suggestions}
              selectedIndex={titleTransliteration.selectedIndex}
              onSelect={titleTransliteration.applySuggestion}
              show={titleTransliteration.showSuggestions}
            />
          </div>

          <div className="input-with-suggestions" style={{ width: '100%' }}>
            <textarea 
              placeholder="Enter Nepali poem text" 
              value={content} 
              onChange={(e) => contentTransliteration.handleChange(e.target.value)}
              onKeyDown={contentTransliteration.handleKeyDown}
              required 
              style={{ width: '100%', boxSizing: 'border-box' }}
            />
            <TransliterationSuggestions
              suggestions={contentTransliteration.suggestions}
              selectedIndex={contentTransliteration.selectedIndex}
              onSelect={contentTransliteration.applySuggestion}
              show={contentTransliteration.showSuggestions}
            />
          </div>

          <div style={{ fontSize: '0.98em', marginBottom: 10, color: '#888' }}>
            <b>Markdown supported:</b> <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer">Markdown Guide</a> &nbsp;|&nbsp;
            <a href="https://markdownlivepreview.com/" target="_blank" rel="noopener noreferrer">Live Preview</a> &nbsp;|&nbsp;
            <a href="https://word2md.com/" target="_blank" rel="noopener noreferrer">Word2MD</a>
          </div>
          <button className="admin-btn add" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (editingId ? "Editing..." : "Adding...") : (editingId ? "Update Poem" : "Add Poem")}
          </button>
        </form>
      </Modal>

      {/* View Modal */}
      {selectedPoem && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ color: '#e46c6e', fontSize: '0.9rem', fontWeight: 600 }}>#{poems.findIndex(p => p.id === selectedPoem.id) + 1}</span>
                <h4 style={{ margin: 0, color: '#e46c6e', fontSize: '1.2rem', fontWeight: 600 }}>
                  {selectedPoem.title}
                </h4>
              </div>
              <p style={{ margin: 0, color: '#999', fontSize: '0.85rem' }}>
                Created: {formatDate(selectedPoem.createdAt)}
              </p>
            </div>
            <div style={{ 
              padding: '16px', 
              background: '#f8f8f8', 
              borderRadius: '8px',
              lineHeight: '1.6',
              color: '#333',
              whiteSpace: 'pre-wrap'
            }}>
              {selectedPoem.content}
            </div>
          </div>
        </Modal>
      )}

      <ul className="admin-list">
        {poems.map((poem, index) => (
          <li 
            key={poem.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            style={{ 
              opacity: draggedIndex === index ? 0.5 : 1,
              display: 'flex',
              gap: '0',
              alignItems: 'stretch',
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '10px',
              marginBottom: '12px',
              padding: '12px 16px 12px 0',
              transition: 'all 0.2s ease',
              color: '#fff'
            }}
          >
            {/* Drag Handle Column */}
            <div 
              style={{ 
                cursor: 'grab', 
                color: '#fff', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 8px 0 12px',
                borderRight: '2px solid rgba(255,255,255,0.2)',
                marginRight: '12px',
                alignSelf: 'stretch',
                touchAction: 'none'
              }}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <GripVertical size={20} />
            </div>
            
            {/* Content and Actions Wrapper */}
            <div className="poem-content-wrapper" style={{ 
              flex: 1, 
              minWidth: 0, 
              display: 'flex', 
              flexDirection: 'row',
              gap: '12px',
              alignItems: 'center'
            }}>
              {/* Content Area */}
              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Title */}
                <span 
                  style={{ 
                    cursor: 'pointer',
                    fontSize: '1rem',
                    fontWeight: 500,
                    wordBreak: 'break-word'
                  }} 
                  onClick={() => handleViewPoem(poem)}
                >
                  {poem.title}
                </span>
                
                {/* Timestamp */}
                <div 
                  className="admin-timestamp" 
                  style={{ cursor: 'pointer' }} 
                  onClick={() => handleViewPoem(poem)}
                >
                  {formatDate(poem.createdAt)}
                </div>
              </div>
              
              {/* Order Number */}
              <div className="admin-order-number" style={{ 
                fontSize: '0.85rem', 
                fontWeight: 600, 
                color: 'rgba(255,255,255,0.6)',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center'
              }}>
                #{index + 1}
              </div>
              
              {/* Action Buttons */}
              <div className="admin-actions" style={{ flexShrink: 0 }}>
                <button className="admin-btn edit" onClick={() => handleEdit(poem)}>
                  <Pencil size={16} />
                </button>
                <button className="admin-btn delete" onClick={() => requestDelete(poem.id)}>
                  <Trash size={16} />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Confirm Delete Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirm Delete">
        <div style={{ marginBottom: 18 }}>Are you sure you want to delete this poem?</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button className="admin-btn" onClick={() => setShowConfirmModal(false)} type="button">Cancel</button>
          <button className="admin-btn delete" onClick={handleDelete} type="button">Delete</button>
        </div>
      </Modal>

      {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  );
}
