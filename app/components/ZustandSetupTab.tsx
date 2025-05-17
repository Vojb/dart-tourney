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

export function ZustandSetupTab() {
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
    resetSettings,
  } = useSettingsStore();

  // Tournament store
  const { generateTournament, reset: resetTournament } = useTournamentStore();

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

  // Initialize team names when component mounts or numTeams changes
  useEffect(() => {
    if (!teamNames || teamNames.length === 0 || teamNames.length !== numTeams) {
      initializeTeamNames(numTeams);
    }
  }, [numTeams, teamNames, initializeTeamNames]);

  // Generate tournament handler
  const handleGenerateTournament = () => {
    // Ensure team names are initialized before tournament generation
    if (!teamNames || teamNames.length === 0 || teamNames.length !== numTeams) {
      initializeTeamNames(numTeams);
    }

    generateTournament(
      teamNames,
      numGroups,
      numBoards,
      startTime,
      matchDuration,
      teamColors,
      setTeamColors
    );
  };

  // Clear all data
  const clearSavedData = () => {
    // Clear localStorage
    clearAllData();

    // Reset all Zustand stores
    resetSettings();
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
      description: "All saved tournament data has been removed.",
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
              max={Math.min(Math.floor(numTeams / 2), 8)}
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
        <Button onClick={handleGenerateTournament} className="w-full sm:w-auto">
          Generate Tournament
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
