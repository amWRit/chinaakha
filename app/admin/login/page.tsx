"use client";

import "@/styles/admin.css";

import { useState, useEffect } from "react"; 
import { useRouter } from "next/navigation";
import { Shield, LogIn, LogOut, Home, LayoutDashboard } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admins', { method: 'GET', credentials: 'include' })
      .then(res => res.json())
      .then(data => setIsLoggedIn(!!data.authenticated))
      .catch(() => setIsLoggedIn(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    setLoading(false);
    if (res.ok) {
      window.location.href = "/admin/dashboard";
    } else {
      const data = await res.json();
      setError(data.error || "Login failed");
    }
  };

  if (isLoggedIn === null) {
    return null; // or a spinner
  }

  return (
    <main className="admin-dashboard-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <section className="admin-section" style={{ maxWidth: 420, width: '100%', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', padding: '40px 32px 32px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
          <Shield size={40} color="#fff" style={{ marginBottom: 10 }} />
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: '1.7rem', margin: 0, letterSpacing: 1 }}>Admin Login</h1>
        </div>
        {isLoggedIn ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem', marginBottom: 8, textAlign: 'center' }}>
              <div>You are already logged in as admin</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18, width: '100%' }}>
              <button className="admin-action-btn" onClick={() => router.push('/') }><Home size={18}/> Go Home</button>
              <button className="admin-action-btn" onClick={() => router.push('/admin/dashboard') }><LayoutDashboard size={18}/> Go to Dashboard</button>
              <button className="admin-action-btn alt"
                onClick={async () => {
                  await fetch('/api/admins/logout', { method: 'POST', credentials: 'include' });
                  setIsLoggedIn(false);
                  router.replace('/');
                  // Optionally, force reload to clear any cached state
                  // window.location.reload();
                }}
              ><LogOut size={18}/> Log out</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                padding: '16px 18px',
                borderRadius: 10,
                border: '1.5px solid #fff',
                background: 'rgba(255,255,255,0.13)',
                color: '#fff',
                fontSize: '1.08rem',
                outline: 'none',
                fontWeight: 500,
                marginBottom: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              className="admin-input"
              autoComplete="username"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{
                padding: '16px 18px',
                borderRadius: 10,
                border: '1.5px solid #fff',
                background: 'rgba(255,255,255,0.13)',
                color: '#fff',
                fontSize: '1.08rem',
                outline: 'none',
                fontWeight: 500,
                marginBottom: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
              className="admin-input"
              autoComplete="current-password"
            />
            <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem" }}>
              <input
                type="checkbox"
                id="show-password"
                checked={showPassword}
                onChange={() => setShowPassword((v) => !v)}
                style={{ marginRight: "0.5rem", width: "1.25em", height: "1.25em" }}
              />
              <label htmlFor="show-password" style={{ fontSize: "0.95em", cursor: "pointer" }}>
                Show Password
              </label>
            </div>
            <button
              type="submit"
              className="admin-action-btn"
              style={{ marginTop: 4 }}
              disabled={loading}
            >
              <LogIn size={20} /> {loading ? 'Logging in...' : 'Login'}
            </button>
            {error && <div style={{ color: '#fff', background: '#e46c6e', borderRadius: 6, padding: '10px 14px', marginTop: 2, fontWeight: 500, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>{error}</div>}
          </form>
        )}
      </section>
    </main>
  );
}
