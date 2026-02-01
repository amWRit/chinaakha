import { useEffect, useState } from "react";

export default function PoemsImageTab() {
  const [poems, setPoems] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [fileId, setFileId] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'IMAGE')));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/poems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: 'IMAGE', image: { fileId }, title })
    });
    setFileId(""); setTitle("");
    setShowAdd(false);
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'IMAGE')));
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/poems", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'IMAGE')));
  };

  return (
    <div>
      <button className="admin-btn add" onClick={() => setShowAdd(v => !v)}>{showAdd ? "Cancel" : "Add Image Poem"}</button>
      {showAdd && (
        <form className="admin-form" onSubmit={handleAdd}>
          <input placeholder="Paste Google Drive FileId" value={fileId} onChange={e => setFileId(e.target.value)} required />
          <input placeholder="Title (optional)" value={title} onChange={e => setTitle(e.target.value)} />
          <button className="admin-btn add" type="submit">Add</button>
        </form>
      )}
      <ul className="admin-list">
        {poems.map(poem => (
          <li className="admin-list-item" key={poem.id}>
            <span>
              <img src={`https://drive.google.com/uc?export=view&id=${poem.image?.fileId}`} alt="Poem Image" style={{ maxWidth: 80, borderRadius: 8, marginRight: 12 }} />
              {poem.title}
            </span>
            <div className="admin-actions">
              {/* View/Edit can be implemented as needed */}
              <button className="admin-btn delete" onClick={() => handleDelete(poem.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
