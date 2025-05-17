import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";
import { Clock, Trophy, Target, Medal } from "lucide-react";
import { Match, Tournament } from "../app/types/tournament";
import { MatchList } from "../app/components/MatchList";
import { MatchBoardGrid } from "../app/components/MatchBoardGrid";
import { useDashboardStore } from "../app/stores/dashboardStore";
import { useTournamentStore } from "../app/stores/tournamentStore";
import { useTeamsStore } from "../app/stores/teamsStore";
import { useSettingsStore } from "../app/stores/settingsStore";
import { useScheduleStore } from "../app/stores/scheduleStore";
import { calculateStandings } from "../app/utils/scoring";

interface DashboardTabProps {
  teamsAdvancing: number;
  openScoreDialog: (match: Match, isKnockout?: boolean) => void;
  parseTime: (timeString: string) => number;
  getKnockoutMatchesByRound: () => { name: string; matches: Match[] }[];
  numBoards: number;
}

export function DashboardTab({
  teamsAdvancing,
  openScoreDialog,
  parseTime,
  getKnockoutMatchesByRound,
  numBoards,
}: DashboardTabProps) {
  const tournament = useTournamentStore((state) => state.tournament);
  const knockoutMatches = useTournamentStore((state) => state.knockoutMatches);
  const createKnockoutStage = useTournamentStore(
    (state) => state.createKnockoutStage
  );
  const teamColors = useTeamsStore((state) => state.teamColors);
  const startTime = useSettingsStore((state) => state.startTime);
  const matchDuration = useSettingsStore((state) => state.matchDuration);
  const tournamentName = useSettingsStore((state) => state.tournamentName);
  const { scheduleView: matchView, setScheduleView: setMatchView } =
    useScheduleStore();
  const { activeTab, setActiveTab } = useDashboardStore();
  const handleScoreChange = useTournamentStore(
    (state) => state.handleScoreChange
  );
  const handleScoreSave = useTournamentStore((state) => state.handleScoreSave);

  // Calculate standings for a group
  const calculateStandingsForGroup = (groupIndex: number) => {
    if (!tournament || !tournament.groups || !tournament.matches) return [];

    if (groupIndex < 0 || groupIndex >= tournament.groups.length) return [];

    const groupTeams = tournament.groups[groupIndex];
    if (!groupTeams || !Array.isArray(groupTeams) || groupTeams.length === 0)
      return [];

    const groupMatches = tournament.matches.filter(
      (m) => m.group === groupIndex + 1
    );
    return calculateStandings(groupTeams, groupMatches);
  };

  if (!tournament) {
    return (
      <div className="text-center p-6 bg-muted/30 rounded-lg">
        <h3 className="text-lg font-medium mb-1">
          No tournament data available
        </h3>
        <p className="text-muted-foreground">
          Generate a tournament to see the dashboard.
        </p>
      </div>
    );
  }

  // Get upcoming matches
  const upcomingMatches = tournament.matches
    .filter((match) => !match.completed)
    .sort((a, b) => parseTime(a.time) - parseTime(b.time))
    .slice(0, 10);

  return (
    <div className="flex flex-col landscape:flex-row gap-4 md:gap-6 w-full h-[calc(100vh-180px)] md:h-[calc(100vh-150px)] lg:h-[calc(100vh-130px)]">
      {/* Standings Section */}
      <Card
        className="w-full landscape:w-[45%] landscape:min-w-[350px] landscape:h-full overflow-visible"
        style={{
          flex: "0.4 1 0%",
          minHeight: "200px",
          maxHeight: "landscape:none 45%",
        }}
      >
        <CardHeader className="pb-1 md:pb-2 shrink-0">
          <CardTitle className="text-base lg:text-lg flex items-center">
            <Trophy className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
            Standings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-4 overflow-auto landscape:h-[calc(100%-40px)]">
          <div className="flex flex-wrap gap-3 md:gap-4">
            {/* Group Standings */}
            {tournament.groups.map((_, groupIndex) => (
              <div
                key={groupIndex}
                className="border rounded-lg p-2 md:p-3 bg-card flex-1 min-w-[250px] sm:min-w-[280px]"
              >
                <h3 className="text-sm md:text-base lg:text-lg font-medium flex items-center mb-1 md:mb-2">
                  <Trophy className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5 mr-1 md:mr-2" />
                  Group {String.fromCharCode(65 + groupIndex)}
                </h3>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs md:text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 font-medium">Team</th>
                        <th className="text-center py-1 font-medium">P</th>
                        <th className="text-center py-1 font-medium">W</th>
                        <th className="text-center py-1 font-medium">L</th>
                        <th className="text-center py-1 font-medium">Pts</th>
                        <th className="text-center py-1 font-medium">+/-</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculateStandingsForGroup(groupIndex)
                        .sort((a, b) => {
                          if (a.points !== b.points) return b.points - a.points;
                          return b.legDiff - a.legDiff;
                        })
                        .map((team, index) => {
                          const isAdvancing = index < teamsAdvancing;
                          return (
                            <tr
                              key={team.name}
                              className={`border-b last:border-0 ${
                                isAdvancing ? "font-medium" : ""
                              }`}
                            >
                              <td className="py-1 flex items-center">
                                <div
                                  className="w-2 h-2 md:w-3 md:h-3 rounded-full mr-1"
                                  style={{
                                    backgroundColor: teamColors[team.name],
                                  }}
                                ></div>
                                <span
                                  className={`truncate max-w-[70px] xs:max-w-[80px] sm:max-w-[100px] md:max-w-[120px] ${
                                    isAdvancing ? "font-medium" : ""
                                  }`}
                                >
                                  {team.name}
                                </span>
                                {isAdvancing && (
                                  <Medal className="w-3 h-3 ml-1 text-yellow-500" />
                                )}
                              </td>
                              <td className="text-center py-1">
                                {team.played}
                              </td>
                              <td className="text-center py-1">{team.won}</td>
                              <td className="text-center py-1">{team.lost}</td>
                              <td className="text-center py-1 font-semibold">
                                {team.points}
                              </td>
                              <td className="text-center py-1">
                                {team.legDiff > 0 && "+"}
                                {team.legDiff}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        {tournament &&
          tournament.matches &&
          tournament.matches.length > 0 &&
          tournament.matches.every((m) => m.completed) &&
          knockoutMatches.length === 0 && (
            <div className="flex justify-center pb-4">
              <Button
                onClick={() =>
                  createKnockoutStage(
                    numBoards,
                    teamsAdvancing,
                    startTime,
                    matchDuration,
                    teamColors,
                    (tab: string) =>
                      setActiveTab(
                        tab as
                          | "teams"
                          | "groups"
                          | "schedule"
                          | "results"
                          | "standings"
                          | "finals"
                      )
                  )
                }
              >
                Start Finals
              </Button>
            </div>
          )}
      </Card>

      {/* Upcoming Matches */}
      <Card
        className="w-full landscape:w-[55%] landscape:min-w-[350px] landscape:flex-1 landscape:h-full overflow-hidden"
        style={{
          flex: "0.6 1 0%",
          minHeight: "250px",
          maxHeight: "landscape:none 55%",
        }}
      >
        <CardHeader className="pb-1 md:pb-2 shrink-0">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base lg:text-lg flex items-center">
              <Clock className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              Upcoming Matches
            </CardTitle>
            <div className="flex gap-1 md:gap-2">
              <Button
                variant={matchView === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setMatchView("list")}
                className="h-6 md:h-7 text-xs px-1.5 md:px-2"
              >
                List
              </Button>
              <Button
                variant={matchView === "boardGrid" ? "default" : "outline"}
                size="sm"
                onClick={() => setMatchView("boardGrid")}
                className="h-6 md:h-7 text-xs px-1.5 md:px-2"
              >
                Board Grid
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 md:p-4 h-[calc(100%-50px)] md:h-[calc(100%-55px)] landscape:h-[calc(100%-45px)] overflow-hidden">
          <ScrollArea className="h-full w-full pr-2 md:pr-4">
            <div
              className={`${
                matchView === "list" ? "w-full max-w-[650px] mx-auto" : ""
              }`}
            >
              {upcomingMatches.length > 0 ? (
                matchView === "list" ? (
                  <MatchList
                    matches={upcomingMatches}
                    teamColors={teamColors}
                    onScoreClick={openScoreDialog}
                    onScoreChange={handleScoreChange}
                    onScoreSave={handleScoreSave}
                    showGroup
                  />
                ) : (
                  <MatchBoardGrid
                    matches={upcomingMatches}
                    numBoards={numBoards}
                    teamColors={teamColors}
                    onScoreClick={openScoreDialog}
                    onScoreChange={handleScoreChange}
                    onScoreSave={handleScoreSave}
                    showGroup
                  />
                )
              ) : (
                <div className="py-4 md:py-6 text-center text-muted-foreground">
                  No upcoming matches
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Finals Overview - Only visible in portrait mode or when no tournament is active */}
      {knockoutMatches.length > 0 && (
        <Card className="w-full landscape:hidden">
          <CardHeader className="pb-1 md:pb-2">
            <CardTitle className="text-base lg:text-lg flex items-center">
              <Target className="w-4 h-4 lg:w-5 lg:h-5 mr-2" />
              Finals Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-3 md:p-4">
            <div className="max-h-[200px] md:max-h-[250px] overflow-auto pr-2 md:pr-4">
              <div className="flex flex-wrap gap-3 md:gap-4">
                {getKnockoutMatchesByRound().map((round, roundIndex) => (
                  <div
                    key={roundIndex}
                    className="border rounded-lg p-2 md:p-3 bg-card flex-1 min-w-[250px] sm:min-w-[280px]"
                  >
                    <h3 className="text-sm font-medium mb-2">{round.name}</h3>
                    <div className="space-y-2">
                      {round.matches.map((match, matchIndex) => (
                        <div
                          key={matchIndex}
                          className="flex justify-between items-center p-2 bg-muted/40 rounded"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <div
                                className="w-2 h-2 md:w-3 md:h-3 rounded-full mr-1"
                                style={{
                                  backgroundColor:
                                    teamColors[match.team1] || "#ccc",
                                }}
                              ></div>
                              <span className="text-xs truncate max-w-[100px]">
                                {match.team1.includes("Winner of Match")
                                  ? "TBD"
                                  : match.team1}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <div
                                className="w-2 h-2 md:w-3 md:h-3 rounded-full mr-1"
                                style={{
                                  backgroundColor:
                                    teamColors[match.team2] || "#ccc",
                                }}
                              ></div>
                              <span className="text-xs truncate max-w-[100px]">
                                {match.team2.includes("Winner of Match")
                                  ? "TBD"
                                  : match.team2}
                              </span>
                            </div>
                          </div>
                          {match.score1 !== null && match.score2 !== null ? (
                            <div className="text-sm font-medium">
                              {match.score1}-{match.score2}
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs px-2"
                              onClick={() => openScoreDialog(match, true)}
                            >
                              Score
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
