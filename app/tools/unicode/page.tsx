"use client";

import { useState } from "react";
import UnicodeConverter from "@/components/unicode/UnicodeConverter";
import UnicodeNavbar from "@/components/unicode/UnicodeNavbar";

export default function UnicodePage() {
  const [showTips, setShowTips] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const handleToggleTips = () => {
    setShowTips(!showTips);
    if (!showTips) {
      setShowExamples(false);
    }
  };

  const handleToggleExamples = () => {
    setShowExamples(!showExamples);
    if (!showExamples) {
      setShowTips(false);
    }
  };

  return (
    <main className="unicode-page">
      <UnicodeNavbar 
        showTips={showTips}
        showExamples={showExamples}
        onToggleTips={handleToggleTips}
        onToggleExamples={handleToggleExamples}
      />

      <UnicodeConverter showTips={showTips} showExamples={showExamples} />
    </main>
  );
}
