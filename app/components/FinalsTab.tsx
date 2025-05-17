import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Match } from "../types/tournament";
import { MatchCard } from "./MatchCard";
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
  const { handleScoreChange, handleScoreSave } = useTournamentStore();
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
              <div className="space-y-3">
                {round.matches.map((match, matchIndex) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    teamColors={teamColors}
                    onScoreClick={(match) => openScoreDialog(match, true)}
                    onScoreChange={handleScoreChange}
                    onScoreSave={handleScoreSave}
                    compact={true}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
