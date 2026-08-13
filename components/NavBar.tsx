"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NotebookIcon, SunIcon, MoonIcon } from "./Icon";
import DocModal from "./DocModal";

const THEME_KEY = "connector:theme";

function applyTheme(nextIsDark: boolean) {
  document.documentElement.dataset.theme = nextIsDark ? "dark" : "light";
}

export default function NavBar() {
  const [isDark, setIsDark] = useState(false);
  const [docOpen, setDocOpen] = useState(false);

  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem(THEME_KEY) : null;
    const prefersDark =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = saved ? saved === "dark" : prefersDark;
    setIsDark(next);
    applyTheme(next);
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      applyTheme(next);
      if (typeof window !== "undefined") {
        localStorage.setItem(THEME_KEY, next ? "dark" : "light");
      }
      return next;
    });
  };

  return (
    <>
      <header className="nav-bar">
        <div className="nav-bar__brand">
          <span className="nav-bar__brand-mark" aria-hidden>
            <NotebookIcon size={12} />
          </span>
          <span>Connector</span>
        </div>
        <nav className="nav-bar__links" aria-label="Primary">
          <Link className="nav-bar__link" href="/coming-soon">
            Product
          </Link>
          <button
            type="button"
            className="nav-bar__link"
            onClick={() => setDocOpen(true)}
          >
            Documentation
          </button>
          <Link className="nav-bar__link" href="/coming-soon">
            Resources
          </Link>
          <Link className="nav-bar__link" href="/coming-soon">
            Contact
          </Link>
        </nav>
        <div className="nav-bar__actions">
          <button
            type="button"
            className="btn-ghost"
            onClick={toggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
          </button>
          <Link className="nav-bar__link" href="/coming-soon">
            Log in
          </Link>
          <Link className="btn-utility" href="/coming-soon">
            Get Connector free
          </Link>
        </div>
      </header>

      <DocModal isOpen={docOpen} onClose={() => setDocOpen(false)} />
    </>
  );
}
