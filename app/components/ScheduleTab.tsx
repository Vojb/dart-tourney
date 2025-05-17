import React from "react";
import { Button } from "../../components/ui/button";
import { Match, Tournament } from "../types/tournament";
import { MatchList } from "../components/MatchList";
import { MatchBoardGrid } from "../components/MatchBoardGrid";
import { useScheduleStore } from "../stores/scheduleStore";
import { useTournamentStore } from "../stores/tournamentStore";
import { useTeamsStore } from "../stores/teamsStore";
import { useSettingsStore } from "../stores/settingsStore";

interface ScheduleTabProps {
  numBoards: number;
  openScoreDialog: (match: Match, isKnockout?: boolean) => void;
}

export function ScheduleTab({ numBoards, openScoreDialog }: ScheduleTabProps) {
  const tournament = useTournamentStore((state) => state.tournament);
  const { handleScoreChange, handleScoreSave } = useTournamentStore();
  const teamColors = useTeamsStore((state) => state.teamColors);
  const tournamentName = useSettingsStore((state) => state.tournamentName);
  const { scheduleView: matchView, setScheduleView: setMatchView } =
    useScheduleStore();

  if (!tournament) {
    return null;
  }

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
          matches={tournament.matches.filter((m) => !m.completed)}
          teamColors={teamColors}
          onScoreClick={openScoreDialog}
          onScoreChange={handleScoreChange}
          onScoreSave={handleScoreSave}
          showGroup
          tournamentName={tournamentName}
        />
      ) : (
        <MatchBoardGrid
          matches={tournament.matches.filter((m) => !m.completed)}
          numBoards={numBoards}
          teamColors={teamColors}
          onScoreClick={openScoreDialog}
          onScoreChange={handleScoreChange}
          onScoreSave={handleScoreSave}
          showGroup
          tournamentName={tournamentName}
        />
      )}
      {tournament.matches.filter((m) => !m.completed).length === 0 && (
        <div className="text-center p-6 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-medium mb-1">
            All matches have been played!
          </h3>
          <p className="text-muted-foreground">
            View results in the Results tab.
          </p>
        </div>
      )}
    </div>
  );
}
