import { useEffect, useState } from "react";
import { Pencil, Trash, Plus } from "lucide-react";
import Modal from "./Modal";

export default function PoemsTextTab() {
  const [poems, setPoems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPoem, setSelectedPoem] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'TEXT')));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing poem
      await fetch("/api/poems", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, title, content })
      });
    } else {
      // Add new poem
      await fetch("/api/poems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: 'TEXT', title, content })
      });
    }
    
    setTitle("");
    setContent("");
    setEditingId(null);
    setShowModal(false);
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'TEXT')));
  };

  const handleEdit = (poem: any) => {
    setEditingId(poem.id);
    setTitle(poem.title || "");
    setContent(poem.content || "");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setTitle("");
    setContent("");
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/poems", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'TEXT')));
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
          <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required />
          <textarea placeholder="Enter Nepali poem text" value={content} onChange={e => setContent(e.target.value)} required />
          <button className="admin-btn add" type="submit">{editingId ? "Update Poem" : "Add Poem"}</button>
        </form>
      </Modal>

      {/* View Modal */}
      {selectedPoem && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{ margin: '0 0 8px 0', color: '#e46c6e', fontSize: '1.2rem', fontWeight: 600 }}>
                {selectedPoem.title}
              </h4>
              <p style={{ margin: 0, color: '#999', fontSize: '0.85rem' }}>
                Created: {formatDate(selectedPoem.createdAt)}
              </p>
            </div>
            <div style={{ 
              padding: '16px', 
              background: '#f8f8f8', 
              borderRadius: '8px',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.6',
              color: '#333'
            }}>
              {selectedPoem.content}
            </div>
          </div>
        </Modal>
      )}

      <ul className="admin-list">
        {poems.map(poem => (
          <li className="admin-list-item" key={poem.id}>
            <span 
              style={{ cursor: 'pointer', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }} 
              onClick={() => handleViewPoem(poem)}
            >
              <span>{poem.title}</span>
              <span className="admin-timestamp">
                {formatDate(poem.createdAt)}
              </span>
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
    </div>
  );
}
