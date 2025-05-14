import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Pencil,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";
import { Match } from "@/types/tournament";
import { useState, useEffect, useRef } from "react";

interface MatchCardProps {
  match: Match;
  index?: number;
  teamColors: { [key: string]: string };
  onScoreClick: (match: Match) => void;
  onScoreChange?: (
    matchId: string | number,
    team: "team1" | "team2",
    change: number
  ) => void;
  onScoreSave?: (match: Match) => void;
  showGroup?: boolean;
  compact?: boolean;
}

export function MatchCard({
  match,
  index,
  teamColors,
  onScoreClick,
  onScoreChange,
  onScoreSave,
  showGroup = false,
  compact = false,
}: MatchCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [localScore1, setLocalScore1] = useState(match.score1 || 0);
  const [localScore2, setLocalScore2] = useState(match.score2 || 0);
  const [hasChanges, setHasChanges] = useState(false);
  const previousExpanded = useRef(expanded);

  // Update local scores when match scores change from props
  useEffect(() => {
    setLocalScore1(match.score1 || 0);
    setLocalScore2(match.score2 || 0);
    setHasChanges(false);
  }, [match.score1, match.score2]);

  // Save changes when collapsing the card
  useEffect(() => {
    // Only trigger when going from expanded to collapsed
    if (previousExpanded.current && !expanded && hasChanges && onScoreSave) {
      saveChanges();
      setHasChanges(false);
    }
    previousExpanded.current = expanded;
  }, [expanded]);

  const handleScoreChange = (team: "team1" | "team2", change: number) => {
    // Only update local state, don't save to server/parent yet
    if (team === "team1") {
      const newScore = Math.max(0, localScore1 + change);
      setLocalScore1(newScore);
    } else {
      const newScore = Math.max(0, localScore2 + change);
      setLocalScore2(newScore);
    }

    // Mark that we have unsaved changes
    setHasChanges(true);
  };

  const saveChanges = () => {
    if (onScoreSave) {
      const updatedMatch = { ...match };
      updatedMatch.score1 = localScore1;
      updatedMatch.score2 = localScore2;

      // Mark as completed if at least one team has points
      updatedMatch.completed = localScore1 > 0 || localScore2 > 0;

      // Save the updated match
      onScoreSave(updatedMatch);
      setHasChanges(false);
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle
          className={`${
            compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
          }`}
        >
          {index !== undefined ? `Match ${index + 1}` : match.time}
        </CardTitle>
        <CardDescription
          className={`${compact ? "text-xs" : "text-xs sm:text-sm"}`}
        >
          Board {match.board} • {match.time}
          {showGroup && match.group && ` • Group ${match.group}`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Collapsed view - only team names and scores */}
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={toggleExpanded}
        >
          <div className="flex items-center space-x-2">
            <div
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: teamColors[match.team1] || "#ccc",
              }}
            />
            <span
              className={`${
                compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
              } font-medium`}
            >
              {match.team1}
            </span>
          </div>

          <div className="flex items-center space-x-1">
            <span className="font-bold">{match.score1 || 0}</span>
            <span className="mx-1">-</span>
            <span className="font-bold">{match.score2 || 0}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`${
                compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
              } font-medium`}
            >
              {match.team2}
            </span>
            <div
              className="w-4 h-4 rounded-full"
              style={{
                backgroundColor: teamColors[match.team2] || "#ccc",
              }}
            />
          </div>

          <div className="ml-2">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Expanded view - scoring controls */}
        {expanded && (
          <div className="mt-4 space-y-4">
            {/* Team 1 scoring */}
            <div className="flex flex-col">
              <div
                className="flex items-center justify-between p-3 rounded-md"
                style={{
                  backgroundColor: teamColors[match.team1] || "#ccc",
                  color: getContrastColor(teamColors[match.team1] || "#ccc"),
                }}
              >
                <span className="font-medium">{match.team1}</span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-current hover:bg-black/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScoreChange("team1", -1);
                    }}
                    disabled={localScore1 <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-bold min-w-6 text-center">
                    {localScore1}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-current hover:bg-black/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScoreChange("team1", 1);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Team 2 scoring */}
            <div className="flex flex-col">
              <div
                className="flex items-center justify-between p-3 rounded-md"
                style={{
                  backgroundColor: teamColors[match.team2] || "#ccc",
                  color: getContrastColor(teamColors[match.team2] || "#ccc"),
                }}
              >
                <span className="font-medium">{match.team2}</span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-current hover:bg-black/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScoreChange("team2", -1);
                    }}
                    disabled={localScore2 <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-bold min-w-6 text-center">
                    {localScore2}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-current hover:bg-black/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScoreChange("team2", 1);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-center mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  saveChanges();
                }}
                className="flex items-center gap-1"
                disabled={!hasChanges}
              >
                <Save className="w-4 h-4" /> Save
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to determine text color based on background
function getContrastColor(hexColor: string): string {
  // Remove the # if it exists
  hexColor = hexColor.replace("#", "");

  // Parse the RGB values
  const r = parseInt(hexColor.substr(0, 2), 16);
  const g = parseInt(hexColor.substr(2, 2), 16);
  const b = parseInt(hexColor.substr(4, 2), 16);

  // Calculate the brightness (YIQ formula)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return black or white based on brightness
  return brightness > 128 ? "black" : "white";
}
