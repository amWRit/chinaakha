import Link from "next/link";
import { Home, ChevronDown, ChevronUp, Lightbulb, List } from "lucide-react";

interface UnicodeNavbarProps {
  showTips: boolean;
  showExamples: boolean;
  onToggleTips: () => void;
  onToggleExamples: () => void;
}

export default function UnicodeNavbar({
  showTips,
  showExamples,
  onToggleTips,
  onToggleExamples,
}: UnicodeNavbarProps) {
  return (
    <div className="unicode-header">
      <h1>
        <span className="title-full">Nepali Unicode Tool</span>
        <span className="title-short">Nepali Unicode</span>
      </h1>
      <div className="header-right">
        <div className="header-buttons">
          <button 
            className="header-toggle-btn"
            onClick={onToggleTips}
          >
            <Lightbulb size={18} />
            <span>Tips</span>
            {showTips ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button 
            className="header-toggle-btn"
            onClick={onToggleExamples}
          >
            <List size={18} />
            <span>Examples</span>
            {showExamples ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
        <Link href="/" className="back-button">
          <Home size={18} />
          <span>Home</span>
        </Link>
      </div>
    </div>
  );
}
