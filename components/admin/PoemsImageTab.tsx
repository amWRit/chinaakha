import { useEffect, useState } from "react";
import { Pencil, Trash, Plus, GripVertical } from "lucide-react";
import Image from "next/image";
import Modal from "./Modal";

export default function PoemsImageTab() {
  const [poems, setPoems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPoem, setSelectedPoem] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [driveLink, setDriveLink] = useState("");
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'IMAGE').sort((a:any, b:any) => (a.order || 0) - (b.order || 0))));
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
        await fetch("/api/poems", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, image: { fileId }, title })
        });
      } else {
        // Add new poem
        await fetch("/api/poems", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: 'IMAGE', image: { fileId }, title })
        });
      }
      
      setDriveLink("");
      setTitle("");
      setEditingId(null);
      setShowModal(false);
      fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'IMAGE')));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (poem: any) => {
    setEditingId(poem.id);
    // Show the file ID in the input when editing
    setDriveLink(poem.image?.fileId || "");
    setTitle(poem.title || "");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setDriveLink("");
    setTitle("");
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/poems", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
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
      <button className="admin-btn add" onClick={() => setShowModal(true)}>
        <Plus size={18} />
        <span className="admin-btn-text">Add</span>
      </button>
      
      <Modal isOpen={showModal} onClose={handleCloseModal} title={editingId ? "Update Image Poem" : "Add Image Poem"}>
        <form className="admin-form" onSubmit={handleAdd}>
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
                <button className="admin-btn delete" onClick={() => handleDelete(poem.id)}>
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
    </div>
  );
}
