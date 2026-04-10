"use client";

import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">NutriSense</p>
        <h1 className="text-lg font-semibold">AI Food & Health Intelligence</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
