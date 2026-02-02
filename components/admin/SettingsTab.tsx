import { useState } from "react";
import { UserCircle, Sparkles } from "lucide-react";
import AccountTab from "./AccountTab";
import FutureTab from "./FutureTab";

export default function SettingsTab() {
  const [subTab, setSubTab] = useState<'account' | 'future'>('account');
  
  return (
    <section className="admin-section">
      <div className="admin-subtabs">
        <button className={`admin-subtab${subTab === 'account' ? ' active' : ''}`} onClick={() => setSubTab('account')}>
          <UserCircle size={18} />
          <span className="admin-tab-text">Account</span>
        </button>
        <button className={`admin-subtab${subTab === 'future' ? ' active' : ''}`} onClick={() => setSubTab('future')}>
          <Sparkles size={18} />
          <span className="admin-tab-text">Future</span>
        </button>
      </div>
      {subTab === 'account' && <AccountTab />}
      {subTab === 'future' && <FutureTab />}
    </section>
  );
}
