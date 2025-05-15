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
  tournamentName?: string;
}

export function MatchList({
  matches,
  teamColors,
  onScoreClick,
  onScoreChange,
  onScoreSave,
  showGroup = false,
  tournamentName,
}: MatchListProps) {
  return (
    <div className="flex flex-col gap-3 w-full max-w-[600px] mx-auto">
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
          tournamentName={tournamentName}
        />
      ))}
    </div>
  );
}
