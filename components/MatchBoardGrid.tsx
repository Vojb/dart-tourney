import { Match } from "@/types/tournament";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Pencil } from "lucide-react";

interface MatchBoardGridProps {
  matches: Match[];
  numBoards: number;
  teamColors: { [key: string]: string };
  onScoreClick: (match: Match) => void;
  showGroup?: boolean;
}

export function MatchBoardGrid({
  matches,
  numBoards,
  teamColors,
  onScoreClick,
  showGroup = false,
}: MatchBoardGridProps) {
  // Group matches by time
  const matchesByTime: { [key: string]: Match[] } = {};
  matches.forEach((match) => {
    if (!matchesByTime[match.time]) {
      matchesByTime[match.time] = [];
    }
    matchesByTime[match.time].push(match);
  });

  // Sort times
  const sortedTimes = Object.keys(matchesByTime).sort((a, b) => {
    const timeA = new Date(`2023-01-01T${a}`);
    const timeB = new Date(`2023-01-01T${b}`);
    return timeA.getTime() - timeB.getTime();
  });

  return (
    <div className="space-y-6">
      {sortedTimes.map((time) => (
        <Card key={time}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm sm:text-base">{time}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: numBoards }, (_, i) => i + 1).map(
                (board) => {
                  const match = matchesByTime[time].find(
                    (m) => m.board === board
                  );
                  if (!match) {
                    return (
                      <Card
                        key={`${time}-${board}`}
                        className="border-dashed border-muted"
                      >
                        <CardContent className="flex items-center justify-center p-4 h-24">
                          <span className="text-muted-foreground">
                            Board {board} - No Match
                          </span>
                        </CardContent>
                      </Card>
                    );
                  }
                  return (
                    <Card key={`${time}-${board}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium">
                            Board {match.board}
                            {showGroup &&
                              match.group &&
                              ` • Group ${match.group}`}
                          </span>
                          {match.completed ? (
                            <div className="font-semibold text-base">
                              {match.score1} - {match.score2}
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onScoreClick(match)}
                              className="shrink-0 h-7 text-xs"
                            >
                              Score
                            </Button>
                          )}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full shadow"
                              style={{
                                backgroundColor:
                                  teamColors[match.team1] || "#ccc",
                              }}
                            />
                            <span className="text-sm truncate max-w-[160px]">
                              {match.team1}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full shadow"
                              style={{
                                backgroundColor:
                                  teamColors[match.team2] || "#ccc",
                              }}
                            />
                            <span className="text-sm truncate max-w-[160px]">
                              {match.team2}
                            </span>
                          </div>
                        </div>
                        {match.completed && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onScoreClick(match)}
                            className="h-7 w-7 mt-2"
                            aria-label="Edit score"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                }
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
