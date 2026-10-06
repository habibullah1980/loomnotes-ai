"use client";

import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";
import { Sun, Moon, Laptop } from "lucide-react";

interface ThemeToggleProps {
  variant?: "icon" | "dropdown" | "pill";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className = "" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`h-8 w-8 rounded-xl border border-slate-200 bg-white/50 animate-pulse ${className}`} />
    );
  }

  const toggleTheme = () => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  if (variant === "pill") {
    return (
      <div className={`inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 p-1 text-xs font-semibold ${className}`}>
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
            theme === "light"
              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
          }`}
          title="Light Mode"
        >
          <Sun className="h-3.5 w-3.5" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
            theme === "dark"
              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
          }`}
          title="Dark Mode"
        >
          <Moon className="h-3.5 w-3.5" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("system")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
            theme === "system"
              ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-2xs font-bold"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
          }`}
          title="System Preference"
        >
          <Laptop className="h-3.5 w-3.5" />
          <span>Auto</span>
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle theme"
      className={`relative flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all shadow-2xs cursor-pointer active:scale-95 ${className}`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-slate-600 transition-transform -rotate-90 scale-100" />
      )}
    </button>
  );
}
