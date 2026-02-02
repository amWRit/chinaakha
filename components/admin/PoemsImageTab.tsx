import { useEffect, useState } from "react";
import { Pencil, Trash, Plus } from "lucide-react";
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

  useEffect(() => {
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'IMAGE')));
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
        {poems.map(poem => (
          <li className="admin-list-item" key={poem.id}>
            <span 
              style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}
              onClick={() => handleViewPoem(poem)}
            >
              <Image 
                src={`https://drive.google.com/uc?export=view&id=${poem.image?.fileId}`} 
                alt={poem.title || "Poem Image"}
                width={80}
                height={80}
                style={{ borderRadius: 8, objectFit: 'cover' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span>{poem.title}</span>
                <span className="admin-timestamp">
                  {formatDate(poem.createdAt)}
                </span>
              </div>
            </span>
            <div className="admin-actions">
              <button className="admin-btn edit" onClick={() => handleEdit(poem)}>
                <Pencil size={16} />
              </button>
              <button className="admin-btn delete" onClick={() => handleDelete(poem.id)}>
                <Trash size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="">
        {selectedPoem && (
          <div>
            <h4 style={{ 
              color: '#e46c6e',
              marginBottom: '12px',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              {selectedPoem.title}
            </h4>
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
