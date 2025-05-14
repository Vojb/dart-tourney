import { Match } from "@/types/tournament";
import { MatchCard } from "./MatchCard";

interface MatchListProps {
  matches: Match[];
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

export function MatchList({
  matches,
  teamColors,
  onScoreClick,
  onScoreChange,
  onScoreSave,
  showGroup = false,
}: MatchListProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map((match, index) => (
        <MatchCard
          key={match.id}
          match={match}
          index={index}
          teamColors={teamColors}
          onScoreClick={onScoreClick}
          onScoreChange={onScoreChange}
          onScoreSave={onScoreSave}
          showGroup={showGroup}
        />
      ))}
    </div>
  );
}
