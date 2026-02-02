import { useState } from "react";
import { FileText, Image } from "lucide-react";
import PoemsTextTab from "./PoemsTextTab";
import PoemsImageTab from "./PoemsImageTab";

export default function PoemsTab() {
  const [subTab, setSubTab] = useState<'text' | 'image'>('text');
  return (
    <section className="admin-section">
      <div className="admin-subtabs">
        <button className={`admin-subtab${subTab === 'text' ? ' active' : ''}`} onClick={() => setSubTab('text')}>
          <FileText size={18} />
          <span className="admin-tab-text">Text</span>
        </button>
        <button className={`admin-subtab${subTab === 'image' ? ' active' : ''}`} onClick={() => setSubTab('image')}>
          <Image size={18} />
          <span className="admin-tab-text">Images</span>
        </button>
      </div>
      {subTab === 'text' && <PoemsTextTab />}
      {subTab === 'image' && <PoemsImageTab />}
    </section>
  );
}
