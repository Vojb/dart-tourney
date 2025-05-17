"use client";

import { useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { toast } from "../components/ui/use-toast";
import { Match } from "./types/tournament";
import { useThemeState } from "../components/theme-provider";
import { DarkModeToggle } from "../components/DarkModeToggle";
import { DashboardTab } from "../components/DashboardTab";
import { SetupTab } from "./components/SetupTab";
import { ScheduleTab } from "./components/ScheduleTab";
import { ResultsTab } from "./components/ResultsTab";
import { StandingsTab } from "./components/StandingsTab";
import { FinalsTab } from "./components/FinalsTab";

import {
  parseTime,
  getKnockoutRoundName,
  updateKnockoutBracket,
} from "./utils/tournament";

import { useTournamentStore } from "./stores/tournamentStore";
import { useTeamsStore } from "./stores/teamsStore";
import { useSettingsStore } from "./stores/settingsStore";

export default function TournamentScheduler() {
  const {
    tournament,
    knockoutMatches,
    isLoading,
    selectedMatch,
    score1,
    score2,
    setSelectedMatch,
    setScore1,
    setScore2,
    saveScore,
    setTournament,
    setKnockoutMatches,
    setIsLoading,
  } = useTournamentStore();

  const {
    teamNames,
    teamColors,
    editingTeamName,
    selectedTeam,
    showTeamNameDialog,
    setEditingTeamName,
    setSelectedTeam,
    setShowTeamNameDialog,
    handleTeamNameChange,
    saveTeamName: storeTeamNameSave,
  } = useTeamsStore();

  const { numBoards, teamsAdvancing, tournamentName, activeTab, setActiveTab } =
    useSettingsStore();

  const { toggleTheme } = useThemeState();

  // Add hydration check
  useEffect(() => {
    // Set loading to false after stores are hydrated
    setIsLoading(false);
  }, [setIsLoading]);

  // Open team name edit dialog
  const openTeamNameDialog = (team: string) => {
    setSelectedTeam(team);
    setEditingTeamName(team);
    setShowTeamNameDialog(true);
  };

  // Save edited team name
  const saveTeamName = () => {
    if (!selectedTeam || !editingTeamName.trim()) return;

    // Use the store's saveTeamName which handles all the logic
    const result = storeTeamNameSave(tournament);

    // If we got a result back, update the tournament
    if (result?.updatedTournament) {
      setTournament(result.updatedTournament);
    }
    if (result?.updatedKnockout) {
      setKnockoutMatches(result.updatedKnockout);
    }

    toast({
      title: "Team name updated",
      description: `Team name has been updated`,
    });

    // Make sure to close the dialog
    setShowTeamNameDialog(false);
  };

  // open score dialog
  const openScoreDialog = (match: Match, isKnockout = false) => {
    setSelectedMatch({ ...match, isKnockout });
    setScore1(match.score1 !== null ? match.score1.toString() : "");
    setScore2(match.score2 !== null ? match.score2.toString() : "");
  };

  // save score dialog
  const handleSaveScore = () => {
    // Import updateKnockoutBracket from utils
    saveScore(teamColors, updateKnockoutBracket);

    if (selectedMatch) {
      toast({
        title: "Score saved",
        description: `Updated result for ${selectedMatch.team1} vs ${selectedMatch.team2}`,
      });
    }
  };

  // Get knockout matches by round for finals display
  const getKnockoutMatchesByRound = () => {
    // Check if knockoutMatches is valid
    if (
      !knockoutMatches ||
      !Array.isArray(knockoutMatches) ||
      knockoutMatches.length === 0
    ) {
      return [];
    }

    // Check if tournament is valid
    if (
      !tournament ||
      !tournament.groups ||
      !Array.isArray(tournament.groups)
    ) {
      return [];
    }

    // Prepare result array
    const rounds: { name: string; matches: Match[] }[] = [];

    try {
      // Calculate total teams
      const totalTeams = tournament.groups.reduce(
        (acc: number, group: string[]) => {
          if (!Array.isArray(group)) {
            return acc;
          }
          return acc + Math.min(group.length, teamsAdvancing);
        },
        0
      );

      if (totalTeams === 0) {
        return [];
      }

      // Process knockout matches
      knockoutMatches.forEach((match: Match) => {
        // Validate round property
        if (match.round === undefined || match.round === null) {
          return;
        }

        const roundIndex = match.round - 1;
        if (roundIndex < 0) {
          return;
        }

        // Initialize round if needed
        if (!rounds[roundIndex]) {
          const roundName = getKnockoutRoundName(match.round, totalTeams);
          rounds[roundIndex] = {
            name: roundName,
            matches: [],
          };
        }

        // Add match to round
        rounds[roundIndex].matches.push(match);
      });

      return rounds;
    } catch (error) {
      console.error("Error in getKnockoutMatchesByRound:", error);
      return [];
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Loading tournament data...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we restore your saved tournament.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DarkModeToggle />
      <h1
        className="text-xl mt-4 sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={toggleTheme}
        suppressHydrationWarning
        title="Click to toggle dark mode"
      >
        {tournamentName}
      </h1>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full mx-auto"
      >
        <TabsList
          className="flex flex-wrap w-full gap-1 h-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <TabsTrigger
            value="setup"
            className="flex-1 text-xs sm:text-sm py-2 px-2 sm:px-3 min-w-0"
          >
            Setup
          </TabsTrigger>
          <TabsTrigger
            value="dashboard"
            disabled={!tournament}
            className="flex-1 text-xs sm:text-sm py-2 px-2 sm:px-3 min-w-0 hidden md:flex"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            disabled={!tournament}
            className="flex-1 text-xs sm:text-sm py-2 px-2 sm:px-3 min-w-0"
          >
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="results"
            disabled={!tournament}
            className="flex-1 text-xs sm:text-sm py-2 px-2 sm:px-3 min-w-0"
          >
            Results
          </TabsTrigger>
          <TabsTrigger
            value="standings"
            disabled={!tournament}
            className="flex-1 text-xs sm:text-sm py-2 px-2 sm:px-3 min-w-0"
          >
            Standings
          </TabsTrigger>
          <TabsTrigger
            value="finals"
            disabled={!tournament}
            className="flex-1 text-xs sm:text-sm py-2 px-2 sm:px-3 min-w-0"
          >
            Finals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="mt-4 w-full">
          <SetupTab />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-4 w-full">
          <DashboardTab
            teamsAdvancing={teamsAdvancing}
            openScoreDialog={openScoreDialog}
            parseTime={parseTime}
            getKnockoutMatchesByRound={getKnockoutMatchesByRound}
            numBoards={numBoards}
          />
        </TabsContent>

        <TabsContent value="schedule" className="mt-4 w-full">
          <ScheduleTab
            numBoards={numBoards}
            openScoreDialog={openScoreDialog}
          />
        </TabsContent>

        <TabsContent value="results" className="mt-4 w-full">
          <ResultsTab numBoards={numBoards} openScoreDialog={openScoreDialog} />
        </TabsContent>

        <TabsContent value="standings" className="mt-4 w-full">
          <StandingsTab openTeamNameDialog={openTeamNameDialog} />
        </TabsContent>

        <TabsContent value="finals" className="mt-4 w-full">
          <FinalsTab
            getKnockoutMatchesByRound={getKnockoutMatchesByRound}
            openTeamNameDialog={openTeamNameDialog}
            openScoreDialog={openScoreDialog}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog for entering scores */}
      <Dialog
        open={!!selectedMatch}
        onOpenChange={(open) => !open && setSelectedMatch(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enter Match Score</DialogTitle>
          </DialogHeader>
          {selectedMatch && (
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <div
                  className="flex gap-2 items-center"
                  style={{
                    color: teamColors[selectedMatch.team1] || "inherit",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor:
                        teamColors[selectedMatch.team1] || "#ccc",
                    }}
                  />
                  <span className="font-medium">{selectedMatch.team1}</span>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  className="w-20 text-center"
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div
                  className="flex gap-2 items-center"
                  style={{
                    color: teamColors[selectedMatch.team2] || "inherit",
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{
                      backgroundColor:
                        teamColors[selectedMatch.team2] || "#ccc",
                    }}
                  />
                  <span className="font-medium">{selectedMatch.team2}</span>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  className="w-20 text-center"
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={handleSaveScore}>Save Score</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for editing team names */}
      <Dialog open={showTeamNameDialog} onOpenChange={setShowTeamNameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team Name</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              {selectedTeam && (
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: teamColors[selectedTeam] || "#ccc",
                  }}
                />
              )}
              <Input
                value={editingTeamName}
                onChange={(e) => setEditingTeamName(e.target.value)}
                maxLength={30}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveTeamName}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
