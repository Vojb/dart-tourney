import React, { useCallback } from "react";
import { Button } from "../../components/ui/button";
import { Match, Tournament } from "../types/tournament";
import { MatchList } from "../components/MatchList";
import { MatchBoardGrid } from "../components/MatchBoardGrid";
import { useResultsStore } from "../stores/resultsStore";
import { useTournamentStore } from "../stores/tournamentStore";
import { useTeamsStore } from "../stores/teamsStore";
import { toast } from "../../components/ui/use-toast";

interface ResultsTabProps {
  numBoards: number;
  openScoreDialog: (match: Match, isKnockout?: boolean) => void;
}

export function ResultsTab({ numBoards, openScoreDialog }: ResultsTabProps) {
  const tournament = useTournamentStore((state) => state.tournament);
  const teamColors = useTeamsStore((state) => state.teamColors);
  const { matchView, setMatchView } = useResultsStore();

  // Get score handling functions from the tournament store
  const handleScoreChangeFromStore = useTournamentStore(
    (state) => state.handleScoreChange
  );
  const handleScoreSaveFromStore = useTournamentStore(
    (state) => state.handleScoreSave
  );

  // Create wrapped handlers that update UI feedback
  const handleScoreChange = useCallback(
    (matchId: string | number, team: "team1" | "team2", change: number) => {
      if (!tournament) return;

      // Call the store's handler
      handleScoreChangeFromStore(matchId, team, change);

      // UI feedback (optional)
      toast({
        title: "Score updated",
        description: "The standings have been updated.",
        duration: 1500,
      });
    },
    [tournament, handleScoreChangeFromStore]
  );

  const handleScoreSave = useCallback(
    (match: Match) => {
      if (!tournament) return;

      // Call the store's handler
      handleScoreSaveFromStore(match);

      // No additional toast here as the store already shows one
    },
    [tournament, handleScoreSaveFromStore]
  );

  if (!tournament) {
    return null;
  }

  const completedMatches = tournament.matches.filter((m) => m.completed);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-2">
        <Button
          variant={matchView === "list" ? "default" : "outline"}
          size="sm"
          onClick={() => setMatchView("list")}
        >
          List View
        </Button>
        <Button
          variant={matchView === "boardGrid" ? "default" : "outline"}
          size="sm"
          onClick={() => setMatchView("boardGrid")}
        >
          Board Grid View
        </Button>
      </div>
      {matchView === "list" ? (
        <MatchList
          matches={completedMatches}
          teamColors={teamColors}
          onScoreClick={openScoreDialog}
          onScoreChange={handleScoreChange}
          onScoreSave={handleScoreSave}
          showGroup
        />
      ) : (
        <MatchBoardGrid
          matches={completedMatches}
          numBoards={numBoards}
          teamColors={teamColors}
          onScoreClick={openScoreDialog}
          onScoreChange={handleScoreChange}
          onScoreSave={handleScoreSave}
          showGroup
        />
      )}
      {completedMatches.length === 0 && (
        <div className="text-center p-6 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-1">No results yet</h3>
          <p className="text-muted-foreground">
            Results will appear here once matches are scored.
          </p>
        </div>
      )}
    </div>
  );
}
