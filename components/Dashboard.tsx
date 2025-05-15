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

interface DashboardProps {
  tournament: Tournament | null;
  teamColors: { [key: string]: string };
  knockoutMatches: Match[];
  teamsAdvancing: number;
  openScoreDialog: (match: Match, isKnockout?: boolean) => void;
  parseTime: (timeString: string) => number;
  calculateStandings: (groupIndex: number) => any[];
  getKnockoutMatchesByRound: () => { name: string; matches: Match[] }[];
}

export function Dashboard({
  tournament,
  teamColors,
  knockoutMatches,
  teamsAdvancing,
  openScoreDialog,
  parseTime,
  calculateStandings,
  getKnockoutMatchesByRound,
}: DashboardProps) {
  if (!tournament) {
    return (
      <div className="py-6 text-center text-muted-foreground">
        Generate a tournament to see the dashboard
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Schedule Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Upcoming Matches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {tournament.matches
                .filter((match) => !match.completed)
                .sort((a, b) => parseTime(a.time) - parseTime(b.time))
                .slice(0, 10)
                .map((match) => (
                  <div
                    key={match.id}
                    className="flex items-center justify-between p-3 rounded-md border"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <Badge variant="outline" className="mr-2">
                          {match.time}
                        </Badge>
                        <Badge variant="secondary" className="mr-2">
                          Board {match.board}
                        </Badge>
                        {match.group !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            Group {String.fromCharCode(65 + match.group)}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: teamColors[match.team1] }}
                        ></div>
                        <span className="font-medium truncate">
                          {match.team1}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: teamColors[match.team2] }}
                        ></div>
                        <span className="font-medium truncate">
                          {match.team2}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openScoreDialog(match)}
                      className="shrink-0 ml-2"
                    >
                      Score
                    </Button>
                  </div>
                ))}
              {tournament.matches.filter((match) => !match.completed).length ===
                0 && (
                <div className="py-6 text-center text-muted-foreground">
                  No upcoming matches
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Standings Section */}
      <div className="space-y-6">
        {tournament.groups.map((_, groupIndex) => (
          <Card key={groupIndex}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Group {String.fromCharCode(65 + groupIndex)} Standings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium">Team</th>
                      <th className="text-center py-2 font-medium">P</th>
                      <th className="text-center py-2 font-medium">W</th>
                      <th className="text-center py-2 font-medium">L</th>
                      <th className="text-center py-2 font-medium">Pts</th>
                      <th className="text-center py-2 font-medium">+/-</th>
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
                            <td className="py-2 flex items-center">
                              <div
                                className="w-3 h-3 rounded-full mr-2"
                                style={{
                                  backgroundColor: teamColors[team.name],
                                }}
                              ></div>
                              <span
                                className={`truncate max-w-[120px] ${
                                  isAdvancing ? "font-medium" : ""
                                }`}
                              >
                                {team.name}
                              </span>
                              {isAdvancing && (
                                <Medal className="w-3 h-3 ml-1 text-yellow-500" />
                              )}
                            </td>
                            <td className="text-center py-2">{team.played}</td>
                            <td className="text-center py-2">{team.won}</td>
                            <td className="text-center py-2">{team.lost}</td>
                            <td className="text-center py-2 font-medium">
                              {team.points}
                            </td>
                            <td className="text-center py-2">
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
            </CardContent>
          </Card>
        ))}

        {knockoutMatches.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Finals Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-3">
                  {getKnockoutMatchesByRound().map((round) => (
                    <div key={round.name} className="mb-4">
                      <div className="text-sm font-medium mb-2">
                        {round.name}
                      </div>
                      <div className="space-y-2">
                        {round.matches.map((match) => (
                          <div
                            key={match.id}
                            className="flex justify-between items-center p-2 rounded-md border"
                          >
                            <div className="flex items-center space-x-2 min-w-0">
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
                                  <span className="text-sm truncate">
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
                                  <span className="text-sm truncate">
                                    {match.team2.includes("Winner of Match")
                                      ? "TBD"
                                      : match.team2}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {match.completed ? (
                              <div className="text-sm font-medium">
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
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
