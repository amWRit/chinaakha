import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import Modal from "./Modal";

export default function AccountTab() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch("/api/admins").then(res => res.json()).then(setAdmins);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    setEmail(""); 
    setPassword("");
    setShowAdd(false);
    fetch("/api/admins").then(res => res.json()).then(setAdmins);
  };

  const handleDelete = async (id: string) => {
    await fetch("/api/admins", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    fetch("/api/admins").then(res => res.json()).then(setAdmins);
  };

  return (
    <div>
      <button className="admin-btn add" onClick={() => setShowAdd(v => !v)}>
        {showAdd ? <X size={18} /> : <Plus size={18} />}
        <span className="admin-btn-text">{showAdd ? "Cancel" : "Add"}</span>
      </button>
      {showAdd && (
        <form className="admin-form" onSubmit={handleAdd}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button className="admin-btn add" type="submit">
            <Plus size={18} />
            <span className="admin-btn-text">Add</span>
          </button>
        </form>
      )}
      <ul className="admin-list">
        {admins.map(admin => (
          <li className="admin-list-item" key={admin.id}>
            <span>{admin.email}</span>
            <div className="admin-actions">
              <button className="admin-btn delete" onClick={() => handleDelete(admin.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
