import { useEffect, useState } from "react";
import { Plus, X, Trash } from "lucide-react";
import Modal from "./Modal";

export default function AccountTab() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch("/api/admins").then(res => res.json()).then(setAdmins);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await fetch("/api/admins", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-add-admin": "true"
        },
        body: JSON.stringify({ email, password })
      });
      setEmail(""); 
      setPassword("");
      setShowAdd(false);
      fetch("/api/admins").then(res => res.json()).then(setAdmins);
    } finally {
      setIsSubmitting(false);
    }
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
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <input
              type="checkbox"
              id="show-password-admin"
              checked={showPassword}
              onChange={() => setShowPassword(v => !v)}
              style={{ marginRight: "0.5rem", width: "1.25em", height: "1.25em" }}
            />
            <label htmlFor="show-password-admin" style={{ fontSize: "0.95em", cursor: "pointer" }}>
              Show Password
            </label>
          </div>
          <button className="admin-btn add" type="submit" disabled={isSubmitting}>
            <Plus size={18} />
            <span className="admin-btn-text">{isSubmitting ? "Adding..." : "Add"}</span>
          </button>
        </form>
      )}
      <ul className="admin-list">
        {admins.map(admin => (
          <li className="admin-list-item" key={admin.id}>
            <span>{admin.email}</span>
            <div className="admin-actions">
              <button className="admin-btn delete" onClick={() => handleDelete(admin.id)}>
                <Trash size={16} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
