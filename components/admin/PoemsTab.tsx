import { useState } from "react";
import PoemsTextTab from "./PoemsTextTab";
import PoemsImageTab from "./PoemsImageTab";

export default function PoemsTab() {
  const [subTab, setSubTab] = useState<'text' | 'image'>('text');
  return (
    <section className="admin-section">
      <div className="admin-subtabs">
        <button className={`admin-subtab${subTab === 'text' ? ' active' : ''}`} onClick={() => setSubTab('text')}>Text</button>
        <button className={`admin-subtab${subTab === 'image' ? ' active' : ''}`} onClick={() => setSubTab('image')}>Images</button>
      </div>
      {subTab === 'text' && <PoemsTextTab />}
      {subTab === 'image' && <PoemsImageTab />}
    </section>
  );
}
