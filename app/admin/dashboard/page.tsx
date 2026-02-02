"use client";

import "@/styles/admin.css";
import { useEffect, useState } from "react";
import { Shield, BookOpen, Settings } from "lucide-react";
import PoemsTab from "@/components/admin/PoemsTab";
import SettingsTab from "@/components/admin/SettingsTab";

export default function AdminDashboardPage() {
  const [tab, setTab] = useState<'poems' | 'settings'>('poems');

  // Add admin class to body for admin-only styles
  useEffect(() => {
    document.body.classList.add('admin');
    return () => { document.body.classList.remove('admin'); };
  }, []);

  return (
    <main className="admin-dashboard-container">
      <h1 style={{textAlign:'center', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:'12px'}}>
        <Shield size={32} />
        ADMIN
      </h1>
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
