// Local storage utility functions

import { Match, Tournament } from "../types/tournament";

/**
 * Keys used for localStorage
 */
export const STORAGE_KEYS = {
  TOURNAMENT: "dartTournament",
  TOURNAMENT_NAME: "dartTournamentName",
  TEAM_COLORS: "dartTournamentColors",
  KNOCKOUT_MATCHES: "dartTournamentKnockout",
  ACTIVE_TAB: "dartTournamentTab",
  SETTINGS: "dartTournamentSettings",
  TEAM_NAMES: "dartTournamentTeamNames",
};

/**
 * Save tournament data to localStorage
 */
export const saveTournament = (tournament: Tournament | null) => {
  if (tournament) {
    localStorage.setItem(STORAGE_KEYS.TOURNAMENT, JSON.stringify(tournament));
  }
};

/**
 * Save knockout matches to localStorage
 */
export const saveKnockoutMatches = (matches: Match[]) => {
  if (matches.length > 0) {
    localStorage.setItem(
      STORAGE_KEYS.KNOCKOUT_MATCHES,
      JSON.stringify(matches)
    );
  }
};

/**
 * Save team colors to localStorage
 */
export const saveTeamColors = (teamColors: { [key: string]: string }) => {
  if (Object.keys(teamColors).length > 0) {
    localStorage.setItem(STORAGE_KEYS.TEAM_COLORS, JSON.stringify(teamColors));
  }
};

/**
 * Save active tab to localStorage
 */
export const saveActiveTab = (activeTab: string) => {
  localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, activeTab);
};

/**
 * Save tournament settings to localStorage
 */
export const saveSettings = (settings: any) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

/**
 * Save tournament name to localStorage
 */
export const saveTournamentName = (name: string) => {
  localStorage.setItem(STORAGE_KEYS.TOURNAMENT_NAME, name);
};

/**
 * Save team names to localStorage
 */
export const saveTeamNames = (teamNames: string[]) => {
  localStorage.setItem(STORAGE_KEYS.TEAM_NAMES, JSON.stringify(teamNames));
};

/**
 * Clear all tournament data from localStorage except settings
 */
export const clearAllData = () => {
  try {
    // Save settings before clearing
    const settingsToPreserve = localStorage.getItem(STORAGE_KEYS.SETTINGS);

    // Log which keys are being removed
    console.log(
      "Clearing localStorage keys (except settings):",
      Object.keys(STORAGE_KEYS).filter((key) => key !== "SETTINGS")
    );

    // Remove all keys defined in STORAGE_KEYS except settings
    Object.entries(STORAGE_KEYS).forEach(([keyName, keyValue]) => {
      if (keyName !== "SETTINGS") {
        localStorage.removeItem(keyValue);
      }
    });

    // Legacy key that might still be in use
    localStorage.removeItem("dartTournament");

    // Clear all Zustand persistent stores except settings
    const storeKeys = [
      "dart-tournament-teams",
      "dart-tournament-dialog",
      "dart-tournament-results",
      "dart-tournament-schedule",
      "dart-tournament-standings",
      "dart-tournament-finals",
      "dart-tournament-dashboard",
      "dart-tournament-data",
      // Add storage suffix versions
      "dart-tournament-teams-storage",
      "dart-tournament-dialog-storage",
      "dart-tournament-results-storage",
      "dart-tournament-schedule-storage",
      "dart-tournament-standings-storage",
      "dart-tournament-finals-storage",
      "dart-tournament-dashboard-storage",
      "dart-tournament-data-storage",
      // Legacy storage keys
      "dartTournament-storage",
    ];

    // Remove all store keys except settings
    storeKeys.forEach((key) => {
      if (!key.includes("settings")) {
        localStorage.removeItem(key);
      }
    });

    // Restore settings if they existed
    if (settingsToPreserve) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, settingsToPreserve);
    }

    console.log(
      "Tournament data cleared from localStorage (settings preserved)"
    );
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};
