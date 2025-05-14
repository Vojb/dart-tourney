"use client";

import * as React from "react";
import { useThemeState } from "./theme-provider";
import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";

export function DarkModeToggle() {
  const { theme, toggleTheme, mounted } = useThemeState();

  return (
    <div className="absolute right-4 top-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        title="Toggle dark mode"
      >
        {mounted && theme === "dark" ? (
          <Moon className="h-5 w-5" />
        ) : (
          <Sun className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle dark mode</span>
      </Button>
    </div>
  );
}
