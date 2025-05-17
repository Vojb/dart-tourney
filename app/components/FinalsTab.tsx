import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Pencil } from "lucide-react";
import { Match } from "../types/tournament";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { useFinalsStore } from "../stores/finalsStore";
import { useTournamentStore } from "../stores/tournamentStore";
import { useTeamsStore } from "../stores/teamsStore";

interface FinalsTabProps {
  openScoreDialog: (match: Match, isKnockout?: boolean) => void;
  getKnockoutMatchesByRound: () => { name: string; matches: Match[] }[];
  openTeamNameDialog: (team: string) => void;
}

export function FinalsTab({
  openScoreDialog,
  getKnockoutMatchesByRound,
  openTeamNameDialog,
}: FinalsTabProps) {
  const knockoutMatches = useTournamentStore((state) => state.knockoutMatches);
  const teamColors = useTeamsStore((state) => state.teamColors);
  const { bracketView, setBracketView } = useFinalsStore();

  if (knockoutMatches.length === 0) {
    return (
      <div className="text-center p-8 bg-muted/30 rounded-lg mt-4">
        <h3 className="text-xl font-medium mb-2">Finals Not Started</h3>
        <p className="text-muted-foreground">
          Complete all group matches and click &quot;Start Finals&quot; in the
          Standings tab to begin the knockout phase.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {getKnockoutMatchesByRound().map((round, roundIndex) => (
          <Card key={roundIndex}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base">
                {round.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {round.matches.map((match, matchIndex) => (
                  <div
                    key={matchIndex}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full shadow"
                          style={{
                            backgroundColor: teamColors[match.team1] || "#ccc",
                          }}
                        />
                        {match.team1.includes("Winner of Match") ? (
                          <span className="text-sm sm:text-base text-muted-foreground">
                            TBD
                          </span>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className="text-sm sm:text-base truncate cursor-pointer hover:underline flex items-center gap-1"
                                  onClick={() =>
                                    openTeamNameDialog(match.team1)
                                  }
                                >
                                  {match.team1}
                                  <Pencil className="w-3 h-3 opacity-50" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Click to edit team name</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div
                          className="w-4 h-4 rounded-full shadow"
                          style={{
                            backgroundColor: teamColors[match.team2] || "#ccc",
                          }}
                        />
                        {match.team2.includes("Winner of Match") ? (
                          <span className="text-sm sm:text-base text-muted-foreground">
                            TBD
                          </span>
                        ) : (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className="text-sm sm:text-base truncate cursor-pointer hover:underline flex items-center gap-1"
                                  onClick={() =>
                                    openTeamNameDialog(match.team2)
                                  }
                                >
                                  {match.team2}
                                  <Pencil className="w-3 h-3 opacity-50" />
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Click to edit team name</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                    {match.score1 !== null && match.score2 !== null ? (
                      <div className="flex flex-col items-end gap-1">
                        <div className="font-semibold text-base">
                          {match.score1} - {match.score2}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {match.time}
                        </div>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openScoreDialog(match, true)}
                      >
                        Score
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
