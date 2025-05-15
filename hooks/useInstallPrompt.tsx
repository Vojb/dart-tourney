"use client";

import { useState, useEffect } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

// Extended navigator interface for Safari's standalone property
interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

export function useInstallPrompt() {
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if app is installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as NavigatorWithStandalone).standalone === true
    ) {
      setIsAppInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", () => {
      setIsAppInstalled(true);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", () => {
        setIsAppInstalled(true);
        setInstallPrompt(null);
      });
    };
  }, []);

  const promptToInstall = async () => {
    if (!installPrompt) {
      return;
    }
    // Show the install prompt
    installPrompt.prompt();
    // Wait for the user to respond to the prompt
    const choiceResult = await installPrompt.userChoice;
    // Reset the install prompt variable
    setInstallPrompt(null);
    return choiceResult.outcome;
  };

  return { installPrompt, isAppInstalled, promptToInstall };
}
