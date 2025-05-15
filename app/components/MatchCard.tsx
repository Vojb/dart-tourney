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

  // Gradient styles for the color bar
  const color1 = teamColors[match.team1] || "#ccc";
  const color2 = teamColors[match.team2] || "#ccc";
  const gradientStyle = {
    background: `linear-gradient(135deg, ${color1} 0%, ${color1} 45%, ${color2} 55%, ${color2} 100%)`,
    height: "6px",
    width: "100%",
    borderRadius: "3px",
    marginBottom: "8px",
  };

  // Gradient style for the unified scoring box
  const scoringBoxGradientStyle = {
    background: `linear-gradient(135deg, ${color1} 0%, ${color1} 45%, ${color2} 55%, ${color2} 100%)`,
    borderRadius: "6px",
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
        {/* Color gradient bar at the top */}
        <div style={gradientStyle}></div>

        {/* Current scores display */}
        <div
          className="grid grid-cols-[1fr_auto_1fr_auto] items-center cursor-pointer"
          onClick={toggleExpanded}
        >
          {/* Team 1 with fixed width and truncation */}
          <div className="flex items-center space-x-2 min-w-0 pr-2">
            <span
              className={`${
                compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
              } font-medium truncate`}
              title={match.team1}
            >
              {match.team1}
            </span>
          </div>

          {/* Score section with fixed width - showing local score state */}
          <div className="flex items-center justify-center px-2 w-16">
            <span className="font-bold">{localScore1}</span>
            <span className="mx-1">-</span>
            <span className="font-bold">{localScore2}</span>
          </div>

          {/* Team 2 with fixed width and truncation */}
          <div className="flex items-center justify-end space-x-2 min-w-0 pl-2">
            <span
              className={`${
                compact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
              } font-medium truncate text-right`}
              title={match.team2}
            >
              {match.team2}
            </span>
          </div>

          {/* Toggle icon */}
          <div className="ml-1 flex-shrink-0">
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
            {/* Unified scoring box with gradient */}
            <div
              className="p-4 grid grid-cols-2 gap-8"
              style={scoringBoxGradientStyle}
            >
              {/* Team 1 controls */}
              <div className="flex flex-col items-center space-y-3">
                <span className="font-medium text-white text-center mb-1">
                  {match.team1}
                </span>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 bg-white/20 text-white hover:bg-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScoreChange("team1", -1);
                    }}
                    disabled={localScore1 <= 0}
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 bg-white/20 text-white hover:bg-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScoreChange("team1", 1);
                    }}
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Team 2 controls */}
              <div className="flex flex-col items-center space-y-3">
                <span className="font-medium text-white text-center mb-1">
                  {match.team2}
                </span>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 bg-white/20 text-white hover:bg-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScoreChange("team2", -1);
                    }}
                    disabled={localScore2 <= 0}
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-9 w-9 bg-white/20 text-white hover:bg-white/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleScoreChange("team2", 1);
                    }}
                  >
                    <Plus className="w-5 h-5" />
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
