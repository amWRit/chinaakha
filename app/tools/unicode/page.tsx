"use client";

import UnicodeConverter from "@/components/unicode/UnicodeConverter";
import Link from "next/link";
import { Home } from "lucide-react";

export default function UnicodePage() {
  return (
    <main className="unicode-page">
      <div className="unicode-header">
        <Link href="/" className="back-button">
          <Home size={18} />
          <span>Home</span>
        </Link>
        <h1>Nepali Unicode Tool</h1>
      </div>

      <UnicodeConverter />
    </main>
  );
}
