import React, { useEffect, useMemo } from "react";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Match, Tournament } from "../types/tournament";
import { Pencil } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { useStandingsStore } from "../stores/standingsStore";
import { useTournamentStore } from "../stores/tournamentStore";
import { useTeamsStore } from "../stores/teamsStore";
import { useSettingsStore } from "../stores/settingsStore";
import { toast } from "../../components/ui/use-toast";
import { calculateStandings } from "../utils/scoring";

interface StandingsTabProps {
  openTeamNameDialog: (team: string) => void;
}

export function StandingsTab({ openTeamNameDialog }: StandingsTabProps) {
  // Get data from stores
  const tournament = useTournamentStore((state) => state.tournament);
  const knockoutMatches = useTournamentStore((state) => state.knockoutMatches);
  const createKnockoutStage = useTournamentStore(
    (state) => state.createKnockoutStage
  );
  const teamColors = useTeamsStore((state) => state.teamColors);
  const { sortBy, showTiebreakers, setSortBy, setShowTiebreakers } =
    useStandingsStore();
  const { numBoards, teamsAdvancing, startTime, matchDuration } =
    useSettingsStore();
  const setActiveTab = (tab: string) => {
    // Using setTimeout to avoid any potential React state batching issues
    setTimeout(() => {
      const tabsElement = document.querySelector(
        `[data-state="active"][data-value="${tab}"]`
      );
      if (tabsElement) {
        tabsElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  // Handle "Start Finals" button click
  const handleStartFinals = () => {
    createKnockoutStage(
      numBoards,
      teamsAdvancing,
      startTime,
      matchDuration,
      teamColors,
      setActiveTab
    );
  };

  // Debug logging to see tournament structure
  console.log("StandingsTab rendered with:", {
    tournamentExists: !!tournament,
    hasGroups: tournament ? !!tournament.groups : false,
    groupsIsArray: tournament ? Array.isArray(tournament.groups) : false,
    groupsLength:
      tournament && tournament.groups ? tournament.groups.length : 0,
    hasMatches: tournament ? !!tournament.matches : false,
    matchesCount:
      tournament && tournament.matches ? tournament.matches.length : 0,
  });

  // Add additional safety check to ensure the tournament is properly structured
  useEffect(() => {
    if (
      tournament &&
      (!tournament.groups || !Array.isArray(tournament.groups))
    ) {
      console.error(
        "StandingsTab: Invalid tournament structure detected, groups is not an array"
      );
      // Force a refresh of the tournament store
      const updatedTournament = {
        ...tournament,
        groups: [],
        matches: tournament.matches || [],
      };
      useTournamentStore.getState().setTournament(updatedTournament);
    }
  }, [tournament]);

  // Calculate standings for a specific group
  const calculateStandingsForGroup = (groupIndex: number) => {
    if (!tournament) {
      console.error("calculateStandingsForGroup: Tournament is null");
      return [];
    }

    // Safety check: Make sure groups exists and the groupIndex is valid
    if (!tournament.groups || !Array.isArray(tournament.groups)) {
      console.error("calculateStandingsForGroup: tournament.groups is invalid");
      return [];
    }

    if (groupIndex < 0 || groupIndex >= tournament.groups.length) {
      console.error(
        `calculateStandingsForGroup: Invalid groupIndex ${groupIndex}`
      );
      return [];
    }

    // Get the teams for this group
    const groupTeams = tournament.groups[groupIndex];

    if (!Array.isArray(groupTeams) || groupTeams.length === 0) {
      console.error(
        `calculateStandingsForGroup: Invalid or empty group at index ${groupIndex}`
      );
      return [];
    }

    // Get matches for this group
    const groupMatches =
      tournament.matches?.filter((m: Match) => m.group === groupIndex + 1) ||
      [];

    // Calculate and return standings
    try {
      return calculateStandings(groupTeams, groupMatches);
    } catch (error) {
      console.error(
        `Error calculating standings for group ${groupIndex}:`,
        error
      );
      return [];
    }
  };

  // If there's no tournament data at all, show a message
  if (!tournament) {
    return (
      <div className="text-center p-6 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium mb-1">
          No tournament data available
        </h3>
        <p className="text-muted-foreground">
          Generate a tournament to see standings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 justify-center">
        {tournament.groups.map((group: string[], groupIndex: number) => {
          // Debug the group data
          console.log(`Processing group ${groupIndex}:`, {
            group,
            groupLength: group.length,
            isArray: Array.isArray(group),
          });

          // Calculate standings safely with try/catch
          let standings = [];
          try {
            console.log(`Calling calculateStandings for group ${groupIndex}`);
            standings = calculateStandingsForGroup(groupIndex);
            console.log(`Got standings for group ${groupIndex}:`, standings);
          } catch (error) {
            console.error(
              `Error calculating standings for group ${groupIndex}:`,
              error
            );
            // Return a placeholder card if standings calculation fails
            return (
              <Card
                key={groupIndex}
                className="flex-grow basis-full md:basis-[calc(50%-0.5rem)]"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base">
                    Group {groupIndex + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 text-center text-muted-foreground">
                    Error loading standings for this group
                  </div>
                </CardContent>
              </Card>
            );
          }

          // If standings array is empty, show placeholder
          if (!standings || standings.length === 0) {
            return (
              <Card
                key={groupIndex}
                className="flex-grow basis-full md:basis-[calc(50%-0.5rem)]"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm sm:text-base">
                    Group {groupIndex + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 text-center text-muted-foreground">
                    No standings data available for this group
                  </div>
                </CardContent>
              </Card>
            );
          }

          return (
            <Card
              key={groupIndex}
              className={`flex-grow ${
                tournament.groups.length <= 2
                  ? "basis-full md:basis-[calc(50%-0.5rem)]"
                  : tournament.groups.length <= 3
                  ? "basis-full md:basis-[calc(33.333%-0.667rem)]"
                  : tournament.groups.length === 4
                  ? "basis-full sm:basis-[calc(50%-0.5rem)]"
                  : tournament.groups.length <= 6
                  ? "basis-full sm:basis-[calc(50%-0.5rem)] md:basis-[calc(33.333%-0.667rem)]"
                  : "basis-full sm:basis-[calc(50%-0.5rem)] md:basis-[calc(33.333%-0.667rem)] xl:basis-[calc(25%-0.75rem)]"
              }`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm sm:text-base">
                  Group {groupIndex + 1}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left font-semibold py-1 pr-2">
                          Team
                        </th>
                        <th className="px-1">W</th>
                        <th className="px-1">D</th>
                        <th className="px-1">L</th>
                        <th className="px-1">Diff</th>
                        <th className="px-1">Pts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((team: any, index: number) => (
                        <tr
                          key={team.name || `team-${index}`}
                          className="border-b last:border-0"
                        >
                          <td className="flex items-center gap-2 py-1 pr-2">
                            <div
                              className="w-4 h-4 rounded-full shadow"
                              style={{
                                backgroundColor:
                                  teamColors[team.name] || "#ccc",
                              }}
                            />
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className="truncate max-w-[100px] cursor-pointer hover:underline flex items-center gap-1"
                                    onClick={() =>
                                      openTeamNameDialog(team.name)
                                    }
                                  >
                                    {team.name}
                                    <Pencil className="w-3 h-3 opacity-50" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Click to edit team name</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                          <td className="text-center px-1">{team.won}</td>
                          <td className="text-center px-1">{team.drawn}</td>
                          <td className="text-center px-1">{team.lost}</td>
                          <td className="text-center px-1">{team.legDiff}</td>
                          <td className="text-center px-1 font-semibold">
                            {team.points}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <div className="flex justify-center mt-4">
        {tournament &&
          tournament.matches &&
          tournament.matches.length > 0 &&
          tournament.matches.every((m: Match) => m.completed) &&
          Array.isArray(knockoutMatches) &&
          knockoutMatches.length === 0 && (
            <Button onClick={handleStartFinals}>Start Finals</Button>
          )}
      </div>
    </div>
  );
}
