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

interface DashboardTabProps {
  tournament: Tournament | null;
  teamColors: { [key: string]: string };
  knockoutMatches: Match[];
  teamsAdvancing: number;
  openScoreDialog: (match: Match, isKnockout?: boolean) => void;
  parseTime: (timeString: string) => number;
  calculateStandings: (groupIndex: number) => any[];
  getKnockoutMatchesByRound: () => { name: string; matches: Match[] }[];
  matchView: "list" | "boardGrid";
  numBoards: number;
  onScoreChange?: (
    matchId: string | number,
    team: "team1" | "team2",
    change: number
  ) => void;
  onScoreSave?: (match: Match) => void;
}

export function DashboardTab({
  tournament,
  teamColors,
  knockoutMatches,
  teamsAdvancing,
  openScoreDialog,
  parseTime,
  calculateStandings,
  getKnockoutMatchesByRound,
  matchView,
  numBoards,
  onScoreChange,
  onScoreSave,
}: DashboardTabProps) {
  if (!tournament) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        Generate a tournament to see the dashboard
      </div>
    );
  }

  // Get upcoming matches
  const upcomingMatches = tournament.matches
    .filter((match) => !match.completed)
    .sort((a, b) => parseTime(a.time) - parseTime(b.time))
    .slice(0, 10);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Standings Section */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Standings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <div className="flex flex-wrap gap-4">
            {/* Group Standings */}
            {tournament.groups.map((_, groupIndex) => (
              <div
                key={groupIndex}
                className="border rounded-lg p-3 bg-card flex-1 min-w-[280px]"
              >
                <h3 className="text-base md:text-lg font-medium flex items-center mb-2">
                  <Trophy className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Group {String.fromCharCode(65 + groupIndex)}
                </h3>
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-xs md:text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1 md:py-2 font-medium">
                          Team
                        </th>
                        <th className="text-center py-1 md:py-2 font-medium">
                          P
                        </th>
                        <th className="text-center py-1 md:py-2 font-medium">
                          W
                        </th>
                        <th className="text-center py-1 md:py-2 font-medium">
                          L
                        </th>
                        <th className="text-center py-1 md:py-2 font-medium">
                          Pts
                        </th>
                        <th className="text-center py-1 md:py-2 font-medium">
                          +/-
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculateStandings(groupIndex)
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
                              <td className="py-1 md:py-2 flex items-center">
                                <div
                                  className="w-2 h-2 md:w-3 md:h-3 rounded-full mr-1 md:mr-2"
                                  style={{
                                    backgroundColor: teamColors[team.name],
                                  }}
                                ></div>
                                <span
                                  className={`truncate max-w-[80px] md:max-w-[120px] ${
                                    isAdvancing ? "font-medium" : ""
                                  }`}
                                >
                                  {team.name}
                                </span>
                                {isAdvancing && (
                                  <Medal className="w-3 h-3 ml-1 text-yellow-500" />
                                )}
                              </td>
                              <td className="text-center py-1 md:py-2">
                                {team.played}
                              </td>
                              <td className="text-center py-1 md:py-2">
                                {team.won}
                              </td>
                              <td className="text-center py-1 md:py-2">
                                {team.lost}
                              </td>
                              <td className="text-center py-1 md:py-2 font-medium">
                                {team.points}
                              </td>
                              <td className="text-center py-1 md:py-2">
                                {team.legDiff > 0
                                  ? `+${team.legDiff}`
                                  : team.legDiff}
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
      </Card>

      {/* Finals Overview */}
      {knockoutMatches.length > 0 && (
        <Card className="w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Finals Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <div className="flex flex-wrap gap-4">
              {getKnockoutMatchesByRound().map((round) => (
                <div
                  key={round.name}
                  className="border rounded-lg p-3 bg-card flex-1 min-w-[280px]"
                >
                  <h3 className="text-base md:text-lg font-medium mb-2">
                    {round.name}
                  </h3>
                  <div className="space-y-2">
                    {round.matches.map((match) => (
                      <div
                        key={match.id}
                        className="flex justify-between items-center p-2 rounded-md border"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-muted-foreground mb-1">
                            {match.time}
                          </div>
                          <div className="flex items-center space-x-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: teamColors[match.team1],
                              }}
                            ></div>
                            <span className="text-xs md:text-sm truncate">
                              {match.team1.includes("Winner of Match")
                                ? "TBD"
                                : match.team1}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <div
                              className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: teamColors[match.team2],
                              }}
                            ></div>
                            <span className="text-xs md:text-sm truncate">
                              {match.team2.includes("Winner of Match")
                                ? "TBD"
                                : match.team2}
                            </span>
                          </div>
                        </div>
                        {match.completed ? (
                          <div className="text-xs md:text-sm font-medium">
                            {match.score1}-{match.score2}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Upcoming
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Section */}
      <Card className="w-full">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Upcoming Matches
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={matchView === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => {}} // This is handled at the parent level
                className="h-7 text-xs px-2"
              >
                List
              </Button>
              <Button
                variant={matchView === "boardGrid" ? "default" : "outline"}
                size="sm"
                onClick={() => {}} // This is handled at the parent level
                className="h-7 text-xs px-2"
              >
                Board Grid
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          {upcomingMatches.length > 0 ? (
            matchView === "list" ? (
              <MatchList
                matches={upcomingMatches}
                teamColors={teamColors}
                onScoreClick={openScoreDialog}
                onScoreChange={onScoreChange}
                onScoreSave={onScoreSave}
                showGroup
              />
            ) : (
              <MatchBoardGrid
                matches={upcomingMatches}
                numBoards={numBoards}
                teamColors={teamColors}
                onScoreClick={openScoreDialog}
                onScoreChange={onScoreChange}
                onScoreSave={onScoreSave}
                showGroup
              />
            )
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              No upcoming matches
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
