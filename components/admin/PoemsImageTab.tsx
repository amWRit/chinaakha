import { useEffect, useState } from "react";
import { Pencil, Trash, Plus, GripVertical, FileText, Eye, Archive, BookOpenCheck, BookDashed, FileEdit, CheckCircle } from "lucide-react";
import Image from "next/image";
import Modal from "./Modal";
import Toast from "../Toast";

export default function PoemsImageTab() {
  const [poems, setPoems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPoem, setSelectedPoem] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [driveLink, setDriveLink] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('ALL');

  useEffect(() => {
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'IMAGE').sort((a:any, b:any) => (a.order ?? 0) - (b.order ?? 0))));
  }, []);

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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const fileId = extractFileId(driveLink);
      
      if (editingId) {
        // Update existing poem
        const response = await fetch("/api/poems", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, image: { fileId }, title, status })
        });
        
        if (!response.ok) {
          const error = await response.json();
          setErrorMessage(error.error || 'Failed to update poem');
          return;
        }
      } else {
        // Add new image poem with correct order
        const poemsRes = await fetch("/api/poems");
        const allPoems = await poemsRes.json();
        const imagePoems = allPoems.filter((p:any) => p.type === 'IMAGE');
        const maxOrder = imagePoems.length > 0 ? Math.max(...imagePoems.map((p:any) => p.order ?? 0)) : -1;
        
        const response = await fetch("/api/poems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: 'IMAGE', image: { fileId }, title, status, order: maxOrder + 1 })
        });
        
        if (!response.ok) {
          const error = await response.json();
          setErrorMessage(error.error || 'Failed to add poem');
          return;
        }
      }
      
      setDriveLink("");
      setTitle("");
      setEditingId(null);
      setShowModal(false);
      setToastMessage(editingId ? "Poem updated successfully!" : "Poem added successfully!");
      fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'IMAGE').sort((a:any, b:any) => (a.order ?? 0) - (b.order ?? 0))));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (poem: any) => {
    setEditingId(poem.id);
    // Build the full shareable link from the file ID
    const fileId = poem.image?.fileId || "";
    const shareableLink = fileId ? `https://drive.google.com/file/d/${fileId}/view` : "";
    setDriveLink(shareableLink);
    setTitle(poem.title || "");
    setStatus(poem.status || 'DRAFT');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setDriveLink("");
    setTitle("");
    setStatus('DRAFT');
    setErrorMessage(null);
  };

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [poemToDelete, setPoemToDelete] = useState<string | null>(null);

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
    const imagePoems = allPoems.filter((p: any) => p.type === 'IMAGE').sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    
    // Reorder to fill gaps
    const updates = imagePoems.map((poem: any, index: number) => ({
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
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'IMAGE')));
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {/* Status Filter */}
        <select 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value as 'ALL' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')}
          style={{
            padding: '10px 20px',
            paddingRight: '36px',
            borderRadius: '8px',
            border: '2px solid #e46c6e',
            background: '#fff',
            color: '#e46c6e',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
            minWidth: '150px'
          }}
        >
          <option value="ALL">All Poems</option>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <button className="admin-btn add" onClick={() => setShowModal(true)}>
          <Plus size={18} />
          <span className="admin-btn-text">Add</span>
        </button>
      </div>
      
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? "Update Image Poem" : "Add Image Poem"}>
        <form className="admin-form" onSubmit={handleAdd}>
          {errorMessage && (
            <div style={{ 
              padding: '12px', 
              backgroundColor: '#fee', 
              border: '1px solid #fcc', 
              borderRadius: '6px', 
              color: '#c33',
              fontSize: '0.9rem',
              marginBottom: '12px'
            }}>
              {errorMessage}
            </div>
          )}
          <div style={{ marginBottom: 0 }}>
            <div className="segmented-control status-selector">
              <div className="status-slider" style={{ 
                transform: `translateX(${status === 'DRAFT' ? 0 : status === 'PUBLISHED' ? 100 : 200}%)` 
              }} />
              <button
                type="button"
                className={`segment segment-draft ${status === 'DRAFT' ? 'active' : ''}`}
                onClick={() => setStatus('DRAFT')}
                title="Draft"
              >
                <FileEdit size={18} />
              </button>
              <button
                type="button"
                className={`segment segment-published ${status === 'PUBLISHED' ? 'active' : ''}`}
                onClick={() => setStatus('PUBLISHED')}
                title="Published"
              >
                <CheckCircle size={18} />
              </button>
              <button
                type="button"
                className={`segment segment-archived ${status === 'ARCHIVED' ? 'active' : ''}`}
                onClick={() => setStatus('ARCHIVED')}
                title="Archived"
              >
                <Archive size={18} />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>
              Title
            </label>
            <input placeholder="e.g., माया, सपना, etc." value={title} onChange={e => setTitle(e.target.value)} required />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ color: '#666', fontSize: '0.9rem', fontWeight: 500 }}>
              Google Drive Shareable link
            </label>
            <input 
              placeholder="e.g., https://drive.google.com/file/d/FILE_ID/view" 
              value={driveLink} 
              onChange={e => setDriveLink(e.target.value)} 
              required 
            />
          </div>
          <button className="admin-btn add" type="submit" disabled={isSubmitting}>
            {isSubmitting ? (editingId ? "Editing..." : "Adding...") : (editingId ? "Update Poem" : "Add Poem")}
          </button>
        </form>
      </Modal>

      <ul className="admin-list">
        {poems.filter(poem => filterStatus === 'ALL' || poem.status === filterStatus).map((poem, index) => (
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
              borderRight: `4px solid ${poem.status === 'PUBLISHED' ? '#10b981' : poem.status === 'DRAFT' ? '#f59e0b' : '#9ca3af'}`,
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
              <div style={{ 
                flex: 1, 
                minWidth: 0,
                display: 'flex',
                flexDirection: 'row',
                gap: '12px',
                alignItems: 'center'
              }}>
                {/* Image + Title */}
                <div 
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1, minWidth: 0 }}
                  onClick={() => handleViewPoem(poem)}
                >
                  <Image 
                    src={`https://drive.google.com/uc?export=view&id=${poem.image?.fileId}`} 
                    alt={poem.title || "Poem Image"}
                    width={60}
                    height={60}
                    style={{ borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>
                    <span style={{ fontWeight: 500 }}>{poem.title}</span>
                    <span className="admin-timestamp">
                      {formatDate(poem.createdAt)}
                    </span>
                  </div>
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
              <div className="admin-actions" style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
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

      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="">
        {selectedPoem && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ color: '#e46c6e', fontSize: '0.9rem', fontWeight: 600 }}>#{poems.findIndex(p => p.id === selectedPoem.id) + 1}</span>
              <h4 style={{ 
                color: '#e46c6e',
                margin: 0,
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>
                {selectedPoem.title}
              </h4>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '16px' }}>
              {formatDate(selectedPoem.createdAt)}
            </p>
            <div style={{ 
              display: 'flex',
              justifyContent: 'center',
              padding: '20px',
              backgroundColor: '#f8f8f8',
              borderRadius: '8px'
            }}>
              <Image 
                src={`https://drive.google.com/uc?export=view&id=${selectedPoem.image?.fileId}`} 
                alt={selectedPoem.title || "Poem Image"}
                width={400}
                height={400}
                style={{ borderRadius: 8, objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        )}
      </Modal>

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
