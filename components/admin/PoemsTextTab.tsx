import { useEffect, useState } from "react";

export default function PoemsTextTab() {
  const [poems, setPoems] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'TEXT')));
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/poems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: 'TEXT', content })
    });
    setContent("");
    setShowAdd(false);
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'TEXT')));
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/poems", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetch("/api/poems").then(res => res.json()).then(data => setPoems(data.filter((p:any) => p.type === 'TEXT')));
  };

  return (
    <div>
      <button className="admin-btn add" onClick={() => setShowAdd(v => !v)}>{showAdd ? "Cancel" : "Add Text Poem"}</button>
      {showAdd && (
        <form className="admin-form" onSubmit={handleAdd}>
          <textarea placeholder="Enter Nepali poem text" value={content} onChange={e => setContent(e.target.value)} required />
          <button className="admin-btn add" type="submit">Add</button>
        </form>
      )}
      <ul className="admin-list">
        {poems.map(poem => (
          <li className="admin-list-item" key={poem.id}>
            <span>{poem.title}</span>
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
