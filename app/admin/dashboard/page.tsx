"use client";

import "@/styles/admin.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, BookOpen, Settings, LogOut } from "lucide-react";
import PoemsTab from "@/components/admin/PoemsTab";
import SettingsTab from "@/components/admin/SettingsTab";

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<'poems' | 'settings'>('poems');
  const router = useRouter();

  // Add admin class to body for admin-only styles
  useEffect(() => {
    document.body.classList.add('admin');
    return () => { document.body.classList.remove('admin'); };
  }, []);

  // Protect route: check session
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/admins', { method: 'GET', credentials: 'include' });
      if (!(res.status === 200 && res.headers.get('x-admin-authenticated') === 'true')) {
        router.replace('/admin/login');
      }
    })();
  }, [router]);

  return (
    <main className="admin-dashboard-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{textAlign:'center', marginBottom:10, display:'flex', alignItems:'center', gap:'12px'}}>
          <Shield size={32} />
          ADMIN
        </h1>
        <button
          className="admin-logout-btn"
          style={{ background: '#e46c6e', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 600, cursor: 'pointer', marginLeft: 16, display: 'flex', alignItems: 'center', gap: 8 }}
          onClick={async () => {
            await fetch('/api/admins/logout', { method: 'POST', credentials: 'include' });
            router.replace('/');
          }}
        >
          <LogOut size={20} /> Logout
        </button>
      </div>
      <div className="admin-tabs">
        <button className={`admin-tab${tab === 'poems' ? ' active' : ''}`} onClick={() => setTab('poems')}>
          <BookOpen size={20} />
          <span className="admin-tab-text">Poems</span>
        </button>
        <button className={`admin-tab${tab === 'settings' ? ' active' : ''}`} onClick={() => setTab('settings')}>
          <Settings size={20} />
          <span className="admin-tab-text">Settings</span>
        </button>
      </div>
      {tab === 'poems' && <PoemsTab />}
      {tab === 'settings' && <SettingsTab />}
    </main>
  );
}
