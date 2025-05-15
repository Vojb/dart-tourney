"use client";

import { useState, useEffect } from "react";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

export function InstallPrompt() {
  const { installPrompt, isAppInstalled, promptToInstall } = useInstallPrompt();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Check local storage on mount to see if user previously dismissed the prompt
  useEffect(() => {
    const hasUserDismissed = localStorage.getItem("pwa-install-dismissed");
    if (hasUserDismissed) {
      setIsDismissed(true);
    }
  }, []);

  // Show prompt when installPrompt is available and app is not installed
  useEffect(() => {
    if (installPrompt && !isAppInstalled && !isDismissed) {
      // Wait a few seconds before showing the prompt for better UX
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setShowPrompt(false);
    }
  }, [installPrompt, isAppInstalled, isDismissed]);

  const handleInstall = async () => {
    try {
      await promptToInstall();
      setShowPrompt(false);
    } catch (error) {
      console.error("Failed to install:", error);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    // Remember user's choice in local storage
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-background border-t border-border shadow-lg">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex flex-col">
          <h3 className="text-lg font-medium">Install Dart Tournament App</h3>
          <p className="text-muted-foreground">
            Add to your home screen for a better experience
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
