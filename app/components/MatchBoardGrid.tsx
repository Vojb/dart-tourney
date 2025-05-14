import { Card } from "../../components/ui/card";
import { Match } from "@/types/tournament";
import { MatchCard } from "./MatchCard";

interface MatchBoardGridProps {
  matches: Match[];
  numBoards: number;
  teamColors: { [key: string]: string };
  onScoreClick: (match: Match) => void;
  onScoreChange?: (
    matchId: string | number,
    team: "team1" | "team2",
    change: number
  ) => void;
  onScoreSave?: (match: Match) => void;
  showGroup?: boolean;
}

export function MatchBoardGrid({
  matches,
  numBoards,
  teamColors,
  onScoreClick,
  onScoreChange,
  onScoreSave,
  showGroup = false,
}: MatchBoardGridProps) {
  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-2 gap-4 min-w-[400px]">
        {Array.from({ length: numBoards }, (_, boardIdx) => {
          const boardMatches = matches.filter((m) => m.board === boardIdx + 1);
          return (
            <div key={boardIdx} className="flex flex-col gap-2">
              <div className="font-semibold text-center mb-2">
                Board {boardIdx + 1}
              </div>
              {boardMatches.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs">
                  No matches
                </div>
              ) : (
                boardMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    teamColors={teamColors}
                    onScoreClick={onScoreClick}
                    onScoreChange={onScoreChange}
                    onScoreSave={onScoreSave}
                    showGroup={showGroup}
                    compact
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
