import { useEffect, useState } from "react";

export default function SettingsTab() {
  const [admins, setAdmins] = useState<any[]>([]);
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
    setEmail(""); setPassword("");
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
      <h2>Admins</h2>
      <ul className="admin-list">
        {admins.map(admin => (
          <li className="admin-list-item" key={admin.id}>
            {admin.email}
            <div className="admin-actions">
              <button className="admin-btn delete" onClick={() => handleDelete(admin.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <form className="admin-form" onSubmit={handleAdd}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button className="admin-btn add" type="submit">Add Admin</button>
      </form>
    </div>
  );
}
