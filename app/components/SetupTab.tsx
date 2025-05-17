import React, { ChangeEvent, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import {
  useSettingsStore,
  useTournamentStore,
  useTeamsStore,
  useResultsStore,
  useFinalsStore,
  useScheduleStore,
  useStandingsStore,
  useDashboardStore,
  useDialogStore,
} from "../stores";
import { toast } from "../../components/ui/use-toast";
import { clearAllData } from "../utils/localStorage";
import { generateRandomColor } from "../utils/tournament";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";

export function SetupTab() {
  // Settings store
  const {
    tournamentName,
    numTeams,
    numBoards,
    numGroups,
    matchDuration,
    startTime,
    teamsAdvancing,
    setTournamentName,
    setNumTeams,
    setNumBoards,
    setNumGroups,
    setMatchDuration,
    setStartTime,
    setTeamsAdvancing,
    setActiveTab,
    resetSettings,
  } = useSettingsStore();

  // Tournament store
  const {
    tournament,
    knockoutMatches,
    generateTournament,
    reset: resetTournament,
  } = useTournamentStore();

  // Teams store
  const {
    teamNames,
    teamColors,
    setTeamColors,
    initializeTeamNames,
    reset: resetTeams,
  } = useTeamsStore();

  // Get reset functions from other stores
  const resetResults = useResultsStore((state) => state.reset);
  const resetFinals = useFinalsStore((state) => state.reset);
  const resetSchedule = useScheduleStore((state) => state.reset);
  const resetStandings = useStandingsStore((state) => state.reset);
  const resetDashboard = useDashboardStore((state) => state.reset);
  const resetDialog = useDialogStore((state) => state.resetAllDialogs);

  // Check if tournament already exists
  const tournamentExists = !!(
    tournament?.matches?.length || knockoutMatches?.length
  );

  // Initialize team names when component mounts or numTeams changes
  useEffect(() => {
    // Only initialize if we have no team names at all
    if (!teamNames || teamNames.length === 0) {
      console.log("Initializing team names with numTeams:", numTeams);
      initializeTeamNames(numTeams);
    } else if (teamNames.length < numTeams) {
      // If we have fewer team names than numTeams, add more teams
      console.log(
        "Adding more team names. Current:",
        teamNames.length,
        "Target:",
        numTeams
      );
      const additionalTeams = Array.from(
        { length: numTeams - teamNames.length },
        (_, i) =>
          `${teamNames.length + i + 1}. Team ${teamNames.length + i + 1}`
      );
      const updatedTeamNames = [...teamNames, ...additionalTeams];

      // Initialize colors for the new teams
      const newTeamColors = { ...teamColors };
      const usedColors = Object.values(teamColors);

      additionalTeams.forEach((teamName) => {
        if (!newTeamColors[teamName]) {
          newTeamColors[teamName] = generateRandomColor(usedColors);
          usedColors.push(newTeamColors[teamName]);
        }
      });

      // Update the stores
      setTeamColors(newTeamColors);
      useTeamsStore.setState({ teamNames: updatedTeamNames });
    }
  }, [numTeams, teamNames, initializeTeamNames, teamColors, setTeamColors]);

  // Generate tournament handler
  const handleGenerateTournament = () => {
    // Ensure team names are initialized before tournament generation
    if (!teamNames || teamNames.length === 0) {
      console.log("No team names, initializing before tournament generation");
      initializeTeamNames(numTeams);
    } else if (teamNames.length < numTeams) {
      console.log(
        "Team names array smaller than numTeams, this may cause issues"
      );
    }

    // Add debug logging
    console.log("Generating tournament with:", {
      teamNamesLength: teamNames.length,
      teamNames: teamNames,
      numGroups,
      numBoards,
      startTime,
      matchDuration,
    });

    try {
      // Reset tournament first to ensure a clean state
      resetTournament();

      // Generate the tournament
      generateTournament(
        teamNames,
        numGroups,
        numBoards,
        startTime,
        matchDuration,
        teamColors,
        setTeamColors
      );

      // Navigate to schedule tab after successful tournament generation
      setActiveTab("schedule");
    } catch (error) {
      console.error("Error generating tournament:", error);
      toast({
        title: "Error",
        description: "Failed to generate tournament. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Clear all data
  const clearSavedData = () => {
    // Clear localStorage
    clearAllData();

    // Reset all Zustand stores except settings
    resetTournament();
    resetTeams();
    resetResults();
    resetFinals();
    resetSchedule();
    resetStandings();
    resetDashboard();
    resetDialog();

    toast({
      title: "Tournament data cleared",
      description:
        "All tournament data has been removed while preserving your settings.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tournament Setup</CardTitle>
        <CardDescription>Configure your tournament settings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="tournamentName">Tournament Name</Label>
            <Input
              id="tournamentName"
              type="text"
              value={tournamentName}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTournamentName(e.target.value)
              }
              className="w-full"
              maxLength={50}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numTeams">Number of Teams</Label>
            <Input
              id="numTeams"
              type="number"
              min="4"
              max="32"
              value={numTeams}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNumTeams(parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numBoards">Number of Boards</Label>
            <Input
              id="numBoards"
              type="number"
              min="1"
              max="8"
              value={numBoards}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNumBoards(parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="numGroups">Number of Groups</Label>
            <Input
              id="numGroups"
              type="number"
              min="1"
              max={Math.max(1, Math.min(numTeams, 16))}
              value={numGroups}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNumGroups(parseInt(e.target.value))
              }
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              {numGroups > 0
                ? `Approximately ${Math.ceil(
                    numTeams / numGroups
                  )} teams per group`
                : "Please enter a valid number"}
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="matchDuration">Match Duration (minutes)</Label>
            <Input
              id="matchDuration"
              type="number"
              min="5"
              max="60"
              value={matchDuration}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setMatchDuration(parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startTime">Start Time</Label>
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setStartTime(e.target.value)
              }
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="teamsAdvancing">Teams Advancing per Group</Label>
            <Input
              id="teamsAdvancing"
              type="number"
              min="1"
              value={teamsAdvancing}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setTeamsAdvancing(parseInt(e.target.value))
              }
              className="w-full"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleGenerateTournament}
                disabled={tournamentExists}
                className="w-full sm:w-auto"
              >
                Generate Tournament
              </Button>
            </TooltipTrigger>
            {tournamentExists && (
              <TooltipContent>
                <p>Reset the tournament first to generate a new one</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
        <Button
          variant="outline"
          onClick={() => {
            // Reset only the tournament structure
            resetTournament();
            toast({
              title: "Tournament reset",
              description:
                "Tournament structure has been reset, but your settings are preserved.",
            });
          }}
          className="w-full sm:w-auto"
        >
          Reset Tournament
        </Button>
        <Button
          variant="outline"
          onClick={clearSavedData}
          className="w-full sm:w-auto"
        >
          Clear All Data
        </Button>
      </CardFooter>
    </Card>
  );
}
