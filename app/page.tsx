"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Clock,
  Users,
  Target,
  Trophy,
  Save,
  Trash2,
  Edit,
  Check,
  Medal,
  Pencil,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import { toast } from "../components/ui/use-toast";
import { Alert, AlertDescription } from "../components/ui/alert";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { MatchList } from "@/components/MatchList";
import { MatchBoardGrid } from "@/components/MatchBoardGrid";
import { Match, Tournament } from "@/types/tournament";
import { useThemeState } from "../components/theme-provider";
import { DarkModeToggle } from "../components/DarkModeToggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";

export default function TournamentScheduler() {
  const [numTeams, setNumTeams] = useState(8);
  const [numBoards, setNumBoards] = useState(2);
  const [numGroups, setNumGroups] = useState(2);
  const [matchDuration, setMatchDuration] = useState(15);
  const [startTime, setStartTime] = useState("09:00");
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [activeTab, setActiveTab] = useState("setup");
  const [teamColors, setTeamColors] = useState<{ [key: string]: string }>({});
  const [selectedMatch, setSelectedMatch] = useState<
    (Match & { isKnockout?: boolean }) | null
  >(null);
  const [score1, setScore1] = useState("");
  const [score2, setScore2] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [teamNames, setTeamNames] = useState<string[]>([]);
  const [editingTeamIndex, setEditingTeamIndex] = useState(null);
  const [editingTeamName, setEditingTeamName] = useState("");
  const [showTeamNameDialog, setShowTeamNameDialog] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamsAdvancing, setTeamsAdvancing] = useState(2);
  const [knockoutMatches, setKnockoutMatches] = useState<Match[]>([]);
  const [knockoutStartTime, setKnockoutStartTime] = useState("");
  const [matchView, setMatchView] = useState<"list" | "boardGrid">("list");
  const [tournamentName, setTournamentName] = useState(
    "Dart Tournament Scheduler"
  );

  const { toggleTheme, mounted } = useThemeState();

  // Load data from local storage on component mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        // Load tournament data
        const savedTournament = localStorage.getItem("dartTournament");
        if (savedTournament) {
          setTournament(JSON.parse(savedTournament));
        }

        // Load tournament name
        const savedTournamentName = localStorage.getItem("dartTournamentName");
        if (savedTournamentName) {
          setTournamentName(savedTournamentName);
        }

        // Load team colors
        const savedColors = localStorage.getItem("dartTournamentColors");
        if (savedColors) {
          setTeamColors(JSON.parse(savedColors));
        }

        // Load knockout matches
        const savedKnockout = localStorage.getItem("dartTournamentKnockout");
        if (savedKnockout) {
          setKnockoutMatches(JSON.parse(savedKnockout));
        }

        // Load active tab
        const savedTab = localStorage.getItem("dartTournamentTab");
        if (savedTab) {
          setActiveTab(savedTab);
        }

        // Load settings
        const savedSettings = localStorage.getItem("dartTournamentSettings");
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          setNumTeams(settings.numTeams);
          setNumBoards(settings.numBoards);
          setNumGroups(settings.numGroups || 2);
          setMatchDuration(settings.matchDuration);
          setStartTime(settings.startTime);
          setTeamsAdvancing(settings.teamsAdvancing || 2);
        }

        // Load team names
        const savedTeamNames = localStorage.getItem("dartTournamentTeamNames");
        if (savedTeamNames) {
          setTeamNames(JSON.parse(savedTeamNames));
        } else {
          // Initialize with default team names
          setTeamNames(
            Array.from({ length: numTeams }, (_, i) => `Team ${i + 1}`)
          );
        }

        // Show toast if data was loaded
        if (savedTournament) {
          toast({
            title: "Tournament data loaded",
            description: "Your saved tournament has been restored.",
          });
        }
      } catch (error) {
        console.error("Error loading saved data:", error);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "There was a problem loading your saved tournament.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedData();
  }, []);

  // Calculate and set knockout start time when group matches are generated
  useEffect(() => {
    if (tournament && tournament.matches.length > 0) {
      const matches = tournament.matches;
      const lastMatch = [...matches].sort(
        (a, b) =>
          parseTime(a.time) +
          matchDuration * 60000 -
          (parseTime(b.time) + matchDuration * 60000)
      )[matches.length - 1];

      const lastMatchEndTime =
        parseTime(lastMatch.time) + matchDuration * 60000;
      const knockoutTime = new Date(lastMatchEndTime + 30 * 60000); // 30 minutes after last group match
      setKnockoutStartTime(formatTime(knockoutTime.getTime()));
    }
  }, [tournament, matchDuration]);

  // Update team names when numTeams changes
  useEffect(() => {
    if (!isLoading) {
      const newTeamNames = [...teamNames];
      const colorNames = [
        "Blue",
        "Red",
        "Green",
        "Orange",
        "Purple",
        "Teal",
        "Yellow",
        "Navy",
        "Crimson",
        "Emerald",
        "Gold",
        "Indigo",
        "Pink",
        "Sky",
        "Lime",
        "Coral",
        "Violet",
        "Mint",
        "Amber",
        "Slate",
        "Rose",
        "Cyan",
        "Olive",
        "Maroon",
        "Turquoise",
        "Magenta",
        "Silver",
        "Bronze",
        "Ruby",
        "Sapphire",
        "Jade",
        "Amber",
      ];

      // Add new teams if needed
      while (newTeamNames.length < numTeams) {
        const index = newTeamNames.length;
        newTeamNames.push(colorNames[index % colorNames.length]);
      }

      // Remove teams if needed
      while (newTeamNames.length > numTeams) {
        newTeamNames.pop();
      }

      setTeamNames(newTeamNames);
    }
  }, [numTeams, isLoading]);

  // Save team names to local storage
  useEffect(() => {
    if (!isLoading && teamNames.length > 0) {
      localStorage.setItem(
        "dartTournamentTeamNames",
        JSON.stringify(teamNames)
      );
    }
  }, [teamNames, isLoading]);

  // Save tournament data to local storage whenever it changes
  useEffect(() => {
    if (tournament) {
      localStorage.setItem("dartTournament", JSON.stringify(tournament));
    }
  }, [tournament]);

  // Save knockout matches to local storage
  useEffect(() => {
    if (knockoutMatches.length > 0) {
      localStorage.setItem(
        "dartTournamentKnockout",
        JSON.stringify(knockoutMatches)
      );
    }
  }, [knockoutMatches]);

  // Save team colors whenever they change
  useEffect(() => {
    if (Object.keys(teamColors).length > 0) {
      localStorage.setItem("dartTournamentColors", JSON.stringify(teamColors));
    }
  }, [teamColors]);

  // Save active tab whenever it changes
  useEffect(() => {
    localStorage.setItem("dartTournamentTab", activeTab);
  }, [activeTab]);

  // Save settings whenever they change
  useEffect(() => {
    const settings = {
      numTeams,
      numBoards,
      numGroups,
      matchDuration,
      startTime,
      teamsAdvancing,
    };
    localStorage.setItem("dartTournamentSettings", JSON.stringify(settings));
  }, [
    numTeams,
    numBoards,
    numGroups,
    matchDuration,
    startTime,
    teamsAdvancing,
  ]);

  // Save tournament name whenever it changes
  useEffect(() => {
    localStorage.setItem("dartTournamentName", tournamentName);
  }, [tournamentName]);

  // Clear all saved data
  const clearSavedData = () => {
    localStorage.removeItem("dartTournament");
    localStorage.removeItem("dartTournamentColors");
    localStorage.removeItem("dartTournamentTab");
    localStorage.removeItem("dartTournamentSettings");
    localStorage.removeItem("dartTournamentTeamNames");
    localStorage.removeItem("dartTournamentKnockout");

    setTournament(null);
    setTeamColors({});
    setActiveTab("setup");
    setTeamNames(Array.from({ length: numTeams }, (_, i) => `Team ${i + 1}`));
    setKnockoutMatches([]);

    toast({
      title: "Tournament data cleared",
      description: "All saved tournament data has been removed.",
    });
  };

  // Handle team name change
  const handleTeamNameChange = (index: number, newName: string) => {
    const updatedTeamNames = [...teamNames];
    const oldName = updatedTeamNames[index];
    updatedTeamNames[index] = newName;
    setTeamNames(updatedTeamNames);

    // If tournament exists, update all references to this team
    if (tournament) {
      // Update team colors
      const updatedColors = { ...teamColors };
      if (updatedColors[oldName]) {
        updatedColors[newName] = updatedColors[oldName];
        delete updatedColors[oldName];
        setTeamColors(updatedColors);
      }

      // Update tournament groups
      const updatedGroups = tournament.groups.map((group: string[]) =>
        group.map((team: string) => (team === oldName ? newName : team))
      );

      // Update matches
      const updatedMatches = tournament.matches.map((match: Match) => ({
        ...match,
        team1: match.team1 === oldName ? newName : match.team1,
        team2: match.team2 === oldName ? newName : match.team2,
      }));

      setTournament({
        groups: updatedGroups,
        matches: updatedMatches,
      });

      // Update knockout matches if necessary
      if (knockoutMatches.length > 0) {
        const updatedKnockout = knockoutMatches.map((match: Match) => ({
          ...match,
          team1: match.team1 === oldName ? newName : match.team1,
          team2: match.team2 === oldName ? newName : match.team2,
        }));
        setKnockoutMatches(updatedKnockout);
      }
    }
  };

  // Open team name edit dialog
  const openTeamNameDialog = (team: string) => {
    setSelectedTeam(team);
    setEditingTeamName(team);
    setShowTeamNameDialog(true);
  };

  // Save edited team name
  const saveTeamName = () => {
    if (!selectedTeam || !editingTeamName.trim()) return;

    // Find the team in the tournament
    let teamIndex = -1;
    if (tournament) {
      tournament.groups.forEach((group: string[]) => {
        const index = group.findIndex((team: string) => team === selectedTeam);
        if (index !== -1) {
          teamIndex = teamNames.findIndex((name) => name === selectedTeam);
        }
      });
    } else {
      teamIndex = teamNames.findIndex((name) => name === selectedTeam);
    }

    if (teamIndex !== -1) {
      handleTeamNameChange(teamIndex, editingTeamName.trim());

      toast({
        title: "Team name updated",
        description: `"${selectedTeam}" has been renamed to "${editingTeamName.trim()}"`,
      });
    }

    setShowTeamNameDialog(false);
    setSelectedTeam(null);
    setEditingTeamName("");
  };

  // Generate a vibrant team color with better contrast
  const generateRandomColor = (usedColors: string[]) => {
    // Use a predefined set of vibrant colors with good contrast
    const vibrantColors = [
      "#3498db", // Blue
      "#e74c3c", // Red
      "#2ecc71", // Green
      "#f39c12", // Orange
      "#9b59b6", // Purple
      "#1abc9c", // Teal
      "#f1c40f", // Yellow
      "#34495e", // Navy Blue
      "#16a085", // Dark Teal
      "#d35400", // Burnt Orange
      "#c0392b", // Dark Red
      "#8e44ad", // Dark Purple
      "#27ae60", // Dark Green
      "#2980b9", // Ocean Blue
      "#ff6b81", // Pink
      "#5352ed", // Bright Blue
      "#ff4757", // Bright Red
      "#7bed9f", // Light Green
      "#70a1ff", // Sky Blue
      "#a4b0be", // Gray
      "#ff6348", // Coral
      "#7158e2", // Indigo
      "#3742fa", // Royal Blue
    ];

    // Find unused colors
    const unusedColors = vibrantColors.filter(
      (color) => !usedColors.includes(color)
    );

    // If there are unused colors, return one of them
    if (unusedColors.length > 0) {
      return unusedColors[Math.floor(Math.random() * unusedColors.length)];
    }

    // If all colors are used, generate a modified version of a random color
    const baseColor =
      vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
    // Slightly modify the color by adjusting hue
    const r = parseInt(baseColor.slice(1, 3), 16);
    const g = parseInt(baseColor.slice(3, 5), 16);
    const b = parseInt(baseColor.slice(5, 7), 16);

    // Generate a variation until we find one that's not already used
    let newColor;
    do {
      const variation = 30; // Color variation amount
      const newR = Math.max(
        0,
        Math.min(255, r + Math.floor(Math.random() * variation * 2) - variation)
      );
      const newG = Math.max(
        0,
        Math.min(255, g + Math.floor(Math.random() * variation * 2) - variation)
      );
      const newB = Math.max(
        0,
        Math.min(255, b + Math.floor(Math.random() * variation * 2) - variation)
      );

      newColor = `#${newR.toString(16).padStart(2, "0")}${newG
        .toString(16)
        .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
    } while (usedColors.includes(newColor));

    return newColor;
  };

  const generateTournament = () => {
    // Define color-to-name mapping with expanded color options
    const colorToNameMap: { [key: string]: string } = {
      "#3498db": "Blue",
      "#e74c3c": "Red",
      "#2ecc71": "Green",
      "#f39c12": "Orange",
      "#9b59b6": "Purple",
      "#1abc9c": "Teal",
      "#f1c40f": "Yellow",
      "#34495e": "Navy",
      "#16a085": "Dark Teal",
      "#d35400": "Burnt Orange",
      "#c0392b": "Dark Red",
      "#8e44ad": "Dark Purple",
      "#27ae60": "Dark Green",
      "#2980b9": "Ocean Blue",
      "#ff6b81": "Pink",
      "#5352ed": "Bright Blue",
      "#ff4757": "Bright Red",
      "#7bed9f": "Light Green",
      "#70a1ff": "Sky Blue",
      "#a4b0be": "Gray",
      "#ff6348": "Coral",
      "#7158e2": "Indigo",
      "#3742fa": "Royal Blue",
    };

    // Function to find closest color name for any hex color
    const getColorName = (hexColor: string): string => {
      // If exact match exists, use it
      if (colorToNameMap[hexColor]) {
        return colorToNameMap[hexColor];
      }

      // Parse the hex color
      const r = parseInt(hexColor.slice(1, 3), 16);
      const g = parseInt(hexColor.slice(3, 5), 16);
      const b = parseInt(hexColor.slice(5, 7), 16);

      // Find dominant color component
      const max = Math.max(r, g, b);
      let colorName = "Black";

      if (max > 200) {
        if (r > g && r > b) colorName = "Red";
        else if (g > r && g > b) colorName = "Green";
        else if (b > r && b > g) colorName = "Blue";
        else if (r > 200 && g > 200 && b < 100) colorName = "Yellow";
        else if (r > 200 && b > 200 && g < 100) colorName = "Purple";
        else if (g > 200 && b > 200 && r < 100) colorName = "Cyan";
        else if (r > 200 && g > 200 && b > 200) colorName = "White";
      } else if (max > 150) {
        if (r > g && r > b) colorName = "Dark Red";
        else if (g > r && g > b) colorName = "Dark Green";
        else if (b > r && b > g) colorName = "Dark Blue";
        else if (r > 150 && g > 150 && b < 100) colorName = "Gold";
        else if (r > 150 && b > 150 && g < 100) colorName = "Violet";
        else if (g > 150 && b > 150 && r < 100) colorName = "Teal";
        else colorName = "Silver";
      } else if (max > 100) {
        if (r > g && r > b) colorName = "Brown";
        else if (g > r && g > b) colorName = "Olive";
        else if (b > r && b > g) colorName = "Navy";
        else colorName = "Gray";
      }

      return colorName;
    };

    // Create teams array using custom team names
    const teams = [...teamNames];

    // Track all assigned colors and names to ensure uniqueness
    const usedColors: string[] = [];
    const usedNames: string[] = [];
    const colors: { [key: string]: string } = {};

    // First, preserve any existing colors
    teams.forEach((team) => {
      if (teamColors[team]) {
        colors[team] = teamColors[team];
        usedColors.push(teamColors[team]);
        usedNames.push(team);
      }
    });

    // Process teams in multiple passes:
    // 1. First assign unique colors to all teams
    // 2. Then rename teams based on their colors ensuring unique names

    // First pass: assign colors to all teams
    teams.forEach((team, index) => {
      if (!colors[team]) {
        const color = generateRandomColor(usedColors);
        colors[team] = color;
        usedColors.push(color);
      }
    });

    // Second pass: rename teams based on their colors
    const updatedTeams = [...teams];

    // Create a map to count occurrences of each color
    const colorCounts: { [colorName: string]: number } = {};

    teams.forEach((team, index) => {
      const color = colors[team];

      // Get base color name using the enhanced function
      let colorName = getColorName(color);

      // Count how many times this color has appeared
      if (!colorCounts[colorName]) {
        colorCounts[colorName] = 1;
      } else {
        colorCounts[colorName]++;
      }

      // Determine the new name based on color count
      let newName = colorName;
      if (colorCounts[colorName] > 1) {
        newName = `${colorName} ${colorCounts[colorName]}`;
      }

      // Update the team name
      updatedTeams[index] = newName;

      // Update the color assignment
      if (newName !== team) {
        colors[newName] = color;
        delete colors[team];

        // Add to used names list
        if (!usedNames.includes(newName)) {
          usedNames.push(newName);
        }
      }
    });

    // Update team names and colors
    setTeamNames(updatedTeams);
    setTeamColors(colors);

    // Use specified numGroups instead of calculating it
    const groups = createGroups(updatedTeams, numGroups);

    // Generate all matches for each group
    const allGroupMatches: Match[] = [];
    groups.forEach((group, groupIndex) => {
      const groupMatches = generateRoundRobinMatches(group);
      groupMatches.forEach((match) => {
        allGroupMatches.push({
          ...match,
          group: groupIndex + 1,
          id: 0, // placeholder, will be set later
          time: "",
          board: 0,
          score1: null,
          score2: null,
          completed: false,
          team1: match.team1 || "",
          team2: match.team2 || "",
        });
      });
    });

    // Schedule matches ensuring no team plays twice at the same time
    // and avoiding consecutive matches for teams when possible
    const matches = [];
    let currentTime = parseTime(startTime);
    let currentTimeSlot = 0;

    // Track when each team last played (by time slot index)
    const teamLastPlayed: Record<string, number> = {};
    updatedTeams.forEach((team) => {
      teamLastPlayed[team] = -1; // -1 means never played yet
    });

    // Continue until all matches are scheduled
    while (allGroupMatches.length > 0) {
      // Teams already playing in this time slot
      const teamsInCurrentTimeSlot = new Set<string>();
      // Boards already in use in this time slot
      const boardsInUse = new Set<number>();
      let matchesScheduledInThisTimeSlot = 0;

      // Try to schedule matches for this time slot
      let currentSlotMatches: Match[] = [];
      let canScheduleMore = true;

      while (
        canScheduleMore &&
        matchesScheduledInThisTimeSlot < numBoards &&
        allGroupMatches.length > 0
      ) {
        // Find eligible matches - teams not already playing in this time slot
        const eligibleMatches = allGroupMatches.filter(
          (match) =>
            !teamsInCurrentTimeSlot.has(match.team1) &&
            !teamsInCurrentTimeSlot.has(match.team2)
        );

        if (eligibleMatches.length === 0) {
          // No more matches can be scheduled in this time slot
          canScheduleMore = false;
          continue;
        }

        // Score matches based on rest time
        const scoredMatches = eligibleMatches
          .map((match, index) => {
            // Calculate rest score - higher is better (more rest time)
            const team1RestScore =
              currentTimeSlot - teamLastPlayed[match.team1];
            const team2RestScore =
              currentTimeSlot - teamLastPlayed[match.team2];
            const minRestScore = Math.min(team1RestScore, team2RestScore);

            return {
              originalIndex: allGroupMatches.indexOf(match),
              match,
              score: minRestScore,
            };
          })
          .sort((a, b) => b.score - a.score); // Sort by score descending

        if (scoredMatches.length > 0) {
          // Take the best match based on our scoring criteria
          const bestMatch = scoredMatches[0];
          const matchIndex = bestMatch.originalIndex;

          // Remove the match from the pending list
          const match = allGroupMatches.splice(matchIndex, 1)[0];

          // Find an available board
          let boardNumber = 1;
          while (boardsInUse.has(boardNumber) && boardNumber <= numBoards) {
            boardNumber++;
          }

          if (boardNumber > numBoards) {
            // No more boards available in this time slot
            // Put the match back and move to next time slot
            allGroupMatches.push(match);
            canScheduleMore = false;
            continue;
          }

          // Mark board and teams as in use for this time slot
          boardsInUse.add(boardNumber);
          teamsInCurrentTimeSlot.add(match.team1);
          teamsInCurrentTimeSlot.add(match.team2);

          // Update when these teams last played
          teamLastPlayed[match.team1] = currentTimeSlot;
          teamLastPlayed[match.team2] = currentTimeSlot;

          // Create the scheduled match
          const scheduledMatch: Match = {
            ...match,
            id: matches.length + 1,
            time: formatTime(currentTime),
            board: boardNumber,
            score1: null,
            score2: null,
            completed: false,
            team1: match.team1 || "",
            team2: match.team2 || "",
          };

          // Add to current time slot matches and all matches
          currentSlotMatches.push(scheduledMatch);
          matches.push(scheduledMatch);
          matchesScheduledInThisTimeSlot++;
        } else {
          canScheduleMore = false;
        }
      }

      // Move to the next time slot
      currentTime += matchDuration * 60 * 1000;
      currentTimeSlot++;
    }

    // Sort matches by time for the schedule view
    const sortedMatches = [...matches].sort((a, b) => {
      if (a.time === b.time) {
        return a.board - b.board;
      }
      return parseTime(a.time) - parseTime(b.time);
    });

    // Clear any existing knockout matches
    setKnockoutMatches([]);

    const newTournament = { groups, matches: sortedMatches };
    setTournament(newTournament);
    setActiveTab("schedule");

    toast({
      title: "Tournament generated",
      description: `Created a tournament with ${numTeams} teams, ${numGroups} groups, and ${numBoards} dartboards.`,
    });
  };

  const createGroups = (teams: string[], numGroups: number): string[][] => {
    const groups: string[][] = Array.from({ length: numGroups }, () => []);
    teams.forEach((team: string, index: number) => {
      groups[index % numGroups].push(team);
    });
    return groups;
  };

  const generateRoundRobinMatches = (teams: string[]): Partial<Match>[] => {
    const matches: Partial<Match>[] = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          team1: teams[i],
          team2: teams[j],
        });
      }
    }
    return matches;
  };

  const parseTime = (timeString: string): number => {
    // Create a static date to avoid hydration issues
    const [hours, minutes] = timeString.split(":").map(Number);
    // Use the same date reference (Jan 1, 2023) for consistency
    const date = new Date(2023, 0, 1, hours, minutes, 0, 0);
    return date.getTime();
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    // Get hours and minutes and format with leading zeros
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const openScoreDialog = (match: Match, isKnockout = false) => {
    setSelectedMatch({ ...match, isKnockout });
    setScore1(match.score1 !== null ? match.score1.toString() : "");
    setScore2(match.score2 !== null ? match.score2.toString() : "");
  };

  const saveScore = () => {
    if (!selectedMatch || !tournament) return;

    if (selectedMatch.isKnockout) {
      // Determine the winner - in knockout matches, we can't have a tie
      let winner: string;
      const score1Int = parseInt(score1) || 0;
      const score2Int = parseInt(score2) || 0;

      // Handle ties in knockout matches
      if (score1Int === score2Int) {
        toast({
          title: "Invalid score",
          description:
            "Knockout matches cannot end in a tie. Please enter different scores.",
          variant: "destructive",
        });
        return;
      }

      winner =
        score1Int > score2Int ? selectedMatch.team1 : selectedMatch.team2;

      const updatedMatches = knockoutMatches.map((m: Match) => {
        if (m.id === selectedMatch.id) {
          return {
            ...m,
            score1: score1Int,
            score2: score2Int,
            completed: true,
            winner: winner,
          };
        }
        return m;
      });

      // Update next match with actual team name instead of "Winner of Match X"
      updateKnockoutBracket(updatedMatches, selectedMatch.id, winner);

      setKnockoutMatches(updatedMatches);
    } else {
      // Update group stage match
      const updatedMatches = tournament.matches.map((m: Match) => {
        if (m.id === selectedMatch.id) {
          return {
            ...m,
            score1: parseInt(score1) || 0,
            score2: parseInt(score2) || 0,
            completed: true,
          };
        }
        return m;
      });

      setTournament({
        groups: tournament.groups,
        matches: updatedMatches,
      });
    }

    setSelectedMatch(null);
    setScore1("");
    setScore2("");

    toast({
      title: "Score saved",
      description: `Updated result for ${selectedMatch.team1} vs ${selectedMatch.team2}`,
    });
  };

  // Function to update the knockout bracket when a match is completed
  const updateKnockoutBracket = (
    matches: Match[],
    matchId: number,
    winner: string
  ) => {
    // Find the completed match
    const completedMatch = matches.find((m) => m.id === matchId);
    if (!completedMatch || !completedMatch.nextMatchId) return;

    // Update the next match with the winner
    for (const match of matches) {
      if (match.id === completedMatch.nextMatchId) {
        if (completedMatch.nextMatchPosition === "team1") {
          match.team1 = winner;
        } else if (completedMatch.nextMatchPosition === "team2") {
          match.team2 = winner;
        }

        // If this updated match is already completed, we need to propagate
        // the winner up the bracket as well
        if (match.completed && match.nextMatchId) {
          updateKnockoutBracket(
            matches,
            match.id,
            match.winner ||
              (match.score1 && match.score2 && match.score1 > match.score2
                ? match.team1
                : match.team2)
          );
        }

        break;
      }
    }

    // Save the updated bracket to localStorage
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("tournamentData");
      if (savedData) {
        const data = JSON.parse(savedData);
        localStorage.setItem(
          "tournamentData",
          JSON.stringify({
            ...data,
            knockoutMatches: matches,
          })
        );
      }
    }
  };

  // Update the calculateStandings function
  const calculateStandings = (groupIndex: number) => {
    if (!tournament) return [];

    const groupTeams = tournament.groups[groupIndex];
    const groupMatches = tournament.matches.filter(
      (m: Match) => m.group === groupIndex + 1
    );

    const standings = groupTeams.map((team: string) => ({
      name: team,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      points: 0,
      legsFor: 0,
      legsAgainst: 0,
      legDiff: 0,
    }));

    groupMatches.forEach((m: Match) => {
      if (!m.completed) return;
      const team1Index = standings.findIndex(
        (t: { name: string }) => t.name === m.team1
      );
      const team2Index = standings.findIndex(
        (t: { name: string }) => t.name === m.team2
      );
      if (team1Index === -1 || team2Index === -1) return;
      // Update matches played
      standings[team1Index].played++;
      standings[team2Index].played++;
      // Update legs statistics, with null checks
      if (m.score1 !== null && m.score2 !== null) {
        standings[team1Index].legsFor += m.score1;
        standings[team1Index].legsAgainst += m.score2;
        standings[team2Index].legsFor += m.score2;
        standings[team2Index].legsAgainst += m.score1;
        if (m.score1 > m.score2) {
          standings[team1Index].won++;
          standings[team1Index].points += 3;
          standings[team2Index].lost++;
        } else if (m.score1 < m.score2) {
          standings[team2Index].won++;
          standings[team2Index].points += 3;
          standings[team1Index].lost++;
        } else {
          standings[team1Index].drawn++;
          standings[team2Index].drawn++;
          standings[team1Index].points += 1;
          standings[team2Index].points += 1;
        }
      }
    });

    // Calculate leg difference
    standings.forEach(
      (team: { legsFor: number; legsAgainst: number; legDiff: number }) => {
        team.legDiff = team.legsFor - team.legsAgainst;
      }
    );

    // Sort by points (descending), then by leg difference
    return standings.sort(
      (
        a: { points: number; legDiff: number },
        b: { points: number; legDiff: number }
      ) => {
        if (b.points !== a.points) {
          return b.points - a.points;
        }
        return b.legDiff - a.legDiff;
      }
    );
  };

  // Function to get teams that advance from group stage
  const getAdvancingTeams = () => {
    if (!tournament) return [];

    const advancingTeams: any[] = [];

    tournament.groups.forEach((group: string[], groupIndex: number) => {
      const standings = calculateStandings(groupIndex);
      // Take top N teams from each group
      const topTeams = standings.slice(0, teamsAdvancing);
      advancingTeams.push(
        ...topTeams.map((team: any) => ({
          name: team.name,
          group: groupIndex + 1,
          position: advancingTeams.length + 1,
          color: teamColors[team.name],
        }))
      );
    });

    return advancingTeams;
  };

  // Create knockout stage matches
  const createKnockoutMatches = () => {
    if (!tournament) return;

    // Check if we have enough completed matches
    const completedMatches = tournament.matches.filter(
      (match: Match) => match.completed
    );
    const totalMatches = tournament.matches.length;

    if (completedMatches.length < totalMatches) {
      toast({
        title: "Cannot start finals",
        description: "Please complete all group stage matches first.",
        variant: "destructive",
      });
      return;
    }

    // Determine the bracket size (8, 16, 32, etc.)
    let bracketSize = 2;
    while (bracketSize < getAdvancingTeams().length) {
      bracketSize *= 2;
    }

    // Create knockout matches
    const matches = [];
    let matchId = 1;
    let currentRound = 1;
    let teamsInRound = getAdvancingTeams();
    let nextRoundFirstMatchId = Math.ceil(teamsInRound.length / 2) + 1;

    // For first round, match teams based on group performance
    // Example: Group A 1st vs Group B 2nd, Group B 1st vs Group A 2nd
    while (teamsInRound.length > 1) {
      const roundMatches = [];
      const numMatchesInRound = Math.floor(teamsInRound.length / 2);

      // For the first round, create matchups
      if (currentRound === 1) {
        // Sort teams by position in group
        const sortedTeams = [...teamsInRound].sort((a, b) => {
          // First by group number
          if (a.group !== b.group) return a.group - b.group;
          // Then by position within group
          return a.position - b.position;
        });

        // Create matchups (1st vs last, 2nd vs 2nd last, etc.)
        for (let i = 0; i < Math.floor(sortedTeams.length / 2); i++) {
          const team1 = sortedTeams[i];
          const team2 = sortedTeams[sortedTeams.length - 1 - i];

          // Calculate which match in the next round this will feed into
          const nextMatchId =
            currentRound < Math.log2(bracketSize)
              ? nextRoundFirstMatchId + Math.floor(i / 2)
              : null;
          const nextMatchPosition = i % 2 === 0 ? "team1" : "team2";

          roundMatches.push({
            id: matchId++,
            round: currentRound,
            team1: team1.name,
            team2: team2.name,
            time: calculateKnockoutMatchTime(currentRound, i),
            board: (i % numBoards) + 1,
            score1: null,
            score2: null,
            completed: false,
            winner: null,
            nextMatchId,
            nextMatchPosition,
          });
        }
      } else {
        // For later rounds, create placeholder matches
        for (let i = 0; i < numMatchesInRound; i++) {
          const nextMatchId =
            currentRound < Math.log2(bracketSize)
              ? nextRoundFirstMatchId + Math.floor(i / 2)
              : null;
          const nextMatchPosition = i % 2 === 0 ? "team1" : "team2";

          // For matches after the first round, teams will be determined by winners
          const previousRoundFirstIndex = matchId - numMatchesInRound * 2;

          // Create match referencing the previous matches
          const previousMatch1Id = previousRoundFirstIndex + i * 2;
          const previousMatch2Id = previousRoundFirstIndex + i * 2 + 1;

          roundMatches.push({
            id: matchId++,
            round: currentRound,
            team1: `Winner of Match ${previousMatch1Id}`,
            team2: `Winner of Match ${previousMatch2Id}`,
            time: calculateKnockoutMatchTime(currentRound, i),
            board: (i % numBoards) + 1,
            score1: null,
            score2: null,
            completed: false,
            winner: null,
            nextMatchId,
            nextMatchPosition,
          });
        }
      }

      matches.push(...roundMatches);

      // Prepare for next round
      teamsInRound = roundMatches.map((match) => ({
        name: `Winner of Match ${match.id}`,
        match: match.id,
      }));

      currentRound++;
      nextRoundFirstMatchId = matchId;
    }

    setKnockoutMatches(matches);
    setActiveTab("finals");

    toast({
      title: "Knockout stage created",
      description: `Created knockout bracket with ${
        getAdvancingTeams().length
      } advancing teams.`,
    });
  };

  // Calculate time for knockout match
  const calculateKnockoutMatchTime = (
    round: number,
    matchIndex: number
  ): string => {
    // Use knockout start time for base
    const baseTime = knockoutStartTime
      ? parseTime(knockoutStartTime)
      : parseTime(startTime) +
        (tournament?.matches.length || 0) * matchDuration * 60000;

    // Add time based on round and match index
    const timeOffset =
      (round - 1) * 60 * 60000 + matchIndex * matchDuration * 60000;
    return formatTime(baseTime + timeOffset);
  };

  // Function to check if a team plays in consecutive time slots
  const getTeamSchedule = (teamName: string) => {
    if (!tournament) return [];

    return tournament.matches
      .filter(
        (match: Match) => match.team1 === teamName || match.team2 === teamName
      )
      .sort((a: Match, b: Match) => parseTime(a.time) - parseTime(b.time))
      .map((match: Match) => ({
        time: match.time,
        opponent: match.team1 === teamName ? match.team2 : match.team1,
        board: match.board,
        completed: match.completed,
        result: match.completed
          ? match.team1 === teamName
            ? `${match.score1}-${match.score2}`
            : `${match.score2}-${match.score1}`
          : null,
      }));
  };

  // Get knockout round name
  const getKnockoutRoundName = (round: number, totalTeams: number) => {
    const totalRounds = Math.ceil(Math.log2(totalTeams));
    const roundsFromFinal = totalRounds - round;

    switch (roundsFromFinal) {
      case 0:
        return "Final";
      case 1:
        return "Semi-Finals";
      case 2:
        return "Quarter-Finals";
      case 3:
        return "Round of 16";
      case 4:
        return "Round of 32";
      default:
        return `Round ${round}`;
    }
  };

  // Group knockout matches by round
  const getKnockoutMatchesByRound = () => {
    if (!knockoutMatches.length || !tournament) return [];
    const rounds: { name: string; matches: Match[] }[] = [];
    const totalTeams = tournament.groups.reduce(
      (acc: number, group: string[]) =>
        acc + Math.min(group.length, teamsAdvancing),
      0
    );
    knockoutMatches.forEach((match: Match) => {
      if (!rounds[match.round! - 1]) {
        rounds[match.round! - 1] = {
          name: getKnockoutRoundName(match.round!, totalTeams),
          matches: [],
        };
      }
      rounds[match.round! - 1].matches.push(match);
    });
    return rounds;
  };

  // Update numGroups if the number of teams changes
  useEffect(() => {
    if (!isLoading) {
      // Ensure numGroups is between 1 and min(numTeams/2, 8)
      const maxGroups = Math.min(Math.floor(numTeams / 2), 8);
      // Use callback form of setState to avoid dependency on numGroups
      setNumGroups((currentNumGroups) => {
        if (currentNumGroups > maxGroups) {
          return maxGroups;
        } else if (currentNumGroups < 1) {
          return 1;
        }
        return currentNumGroups;
      });
    }
  }, [numTeams, isLoading]); // Remove numGroups from dependencies

  // Add these functions after the saveScore function
  const handleScoreChange = (
    matchId: string | number,
    team: "team1" | "team2",
    change: number
  ) => {
    if (!tournament) return;

    const matchIdNum =
      typeof matchId === "string" ? parseInt(matchId) : matchId;

    // Update the match in state
    const updatedMatches = tournament.matches.map((m: Match) => {
      if (m.id === matchIdNum) {
        const newMatch = { ...m };

        if (team === "team1") {
          newMatch.score1 = (newMatch.score1 || 0) + change;
          if (newMatch.score1 < 0) newMatch.score1 = 0;
        } else {
          newMatch.score2 = (newMatch.score2 || 0) + change;
          if (newMatch.score2 < 0) newMatch.score2 = 0;
        }

        // Mark as completed if not already
        if (!newMatch.completed) {
          newMatch.completed = true;
        }

        return newMatch;
      }
      return m;
    });

    setTournament({
      groups: tournament.groups,
      matches: updatedMatches,
    });
  };

  const handleScoreSave = (match: Match) => {
    if (!tournament) return;

    // First update the match in the tournament state
    const updatedMatches = tournament.matches.map((m: Match) =>
      m.id === match.id ? match : m
    );

    // Update the tournament state
    setTournament({
      groups: tournament.groups,
      matches: updatedMatches,
    });

    // Save to localStorage
    localStorage.setItem(
      "dartTournament",
      JSON.stringify({
        groups: tournament.groups,
        matches: updatedMatches,
      })
    );

    // Only show toast on significant changes to avoid too many notifications
    if ((match.score1 || 0) > 0 || (match.score2 || 0) > 0) {
      toast({
        title: "Score updated",
        description: `${match.team1} ${match.score1 || 0} - ${
          match.score2 || 0
        } ${match.team2}`,
        duration: 2000, // shorter toast duration
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            Loading tournament data...
          </h2>
          <p className="text-muted-foreground">
            Please wait while we restore your saved tournament.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-4 px-2 sm:px-4 md:px-6 relative">
      <DarkModeToggle />

      <h1
        className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6 cursor-pointer hover:opacity-90 transition-opacity"
        onClick={toggleTheme}
        suppressHydrationWarning
        title="Click to toggle dark mode"
      >
        {tournamentName}
      </h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full max-w-4xl mx-auto"
      >
        <TabsList
          className="flex flex-wrap w-full gap-1 h-auto"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <TabsTrigger
            value="setup"
            className="flex-1 text-xs sm:text-sm py-2 px-2 sm:px-3 min-w-0"
          >
            Setup
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            disabled={!tournament}
            className="flex-1 text-xs sm:text-sm py-2 px-2 sm:px-3 min-w-0"
          >
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="results"
            disabled={!tournament}
            className="flex-1 text-xs sm:text-sm py-2 px-2 sm:px-3 min-w-0"
          >
            Results
          </TabsTrigger>
          <TabsTrigger
            value="standings"
            disabled={!tournament}
            className="flex-1 text-xs sm:text-sm py-2 px-2 sm:px-3 min-w-0"
          >
            Standings
          </TabsTrigger>
          <TabsTrigger
            value="finals"
            disabled={!tournament}
            className="flex-1 text-xs sm:text-sm py-2 px-2 sm:px-3 min-w-0"
          >
            Finals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Setup</CardTitle>
              <CardDescription>
                Configure your tournament settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="tournamentName">Tournament Name</Label>
                  <Input
                    id="tournamentName"
                    type="text"
                    value={tournamentName}
                    onChange={(e) => setTournamentName(e.target.value)}
                    className="w-full"
                    maxLength={50}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numTeams">Number of Teams</Label>
                  <Input
                    id="numTeams"
                    type="number"
                    min="4"
                    max="32"
                    value={numTeams}
                    onChange={(e) => setNumTeams(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numBoards">Number of Boards</Label>
                  <Input
                    id="numBoards"
                    type="number"
                    min="1"
                    max="8"
                    value={numBoards}
                    onChange={(e) => setNumBoards(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numGroups">Number of Groups</Label>
                  <Input
                    id="numGroups"
                    type="number"
                    min="1"
                    max={Math.min(Math.floor(numTeams / 2), 8)}
                    value={numGroups}
                    onChange={(e) => setNumGroups(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    {numGroups > 0
                      ? `Approximately ${Math.ceil(
                          numTeams / numGroups
                        )} teams per group`
                      : "Please enter a valid number"}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matchDuration">
                    Match Duration (minutes)
                  </Label>
                  <Input
                    id="matchDuration"
                    type="number"
                    min="5"
                    max="60"
                    value={matchDuration}
                    onChange={(e) => setMatchDuration(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="teamsAdvancing">
                    Teams Advancing per Group
                  </Label>
                  <Input
                    id="teamsAdvancing"
                    type="number"
                    min="1"
                    max="4"
                    value={teamsAdvancing}
                    onChange={(e) =>
                      setTeamsAdvancing(parseInt(e.target.value))
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button onClick={generateTournament} className="w-full sm:w-auto">
                Generate Tournament
              </Button>
              <Button
                variant="outline"
                onClick={clearSavedData}
                className="w-full sm:w-auto"
              >
                Clear All Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="mt-4">
          {tournament && (
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
          )}
        </TabsContent>

        <TabsContent value="results" className="mt-4">
          {tournament && (
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
                  matches={tournament.matches.filter((m) => m.completed)}
                  teamColors={teamColors}
                  onScoreClick={openScoreDialog}
                  onScoreChange={handleScoreChange}
                  onScoreSave={handleScoreSave}
                  showGroup
                />
              ) : (
                <MatchBoardGrid
                  matches={tournament.matches.filter((m) => m.completed)}
                  numBoards={numBoards}
                  teamColors={teamColors}
                  onScoreClick={openScoreDialog}
                  onScoreChange={handleScoreChange}
                  onScoreSave={handleScoreSave}
                  showGroup
                />
              )}
              {tournament.matches.filter((m) => m.completed).length === 0 && (
                <div className="text-center p-6 bg-muted/30 rounded-lg">
                  <h3 className="text-lg font-medium mb-1">No results yet</h3>
                  <p className="text-muted-foreground">
                    Results will appear here once matches are scored.
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="standings" className="mt-4">
          {tournament && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tournament.groups.map((_: string[], groupIndex: number) => {
                  const standings = calculateStandings(groupIndex);
                  return (
                    <Card key={groupIndex}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm sm:text-base">
                          Group {groupIndex + 1}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-xs sm:text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left font-semibold py-1 pr-2">
                                  Team
                                </th>
                                <th className="px-1">W</th>
                                <th className="px-1">D</th>
                                <th className="px-1">L</th>
                                <th className="px-1">Diff</th>
                                <th className="px-1">Pts</th>
                              </tr>
                            </thead>
                            <tbody>
                              {standings.map((team: any, index: number) => (
                                <tr
                                  key={team.name}
                                  className="border-b last:border-0"
                                >
                                  <td className="flex items-center gap-2 py-1 pr-2">
                                    <div
                                      className="w-4 h-4 rounded-full shadow"
                                      style={{
                                        backgroundColor:
                                          teamColors[team.name] || "#ccc",
                                      }}
                                    />
                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <span
                                            className="truncate max-w-[100px] cursor-pointer hover:underline flex items-center gap-1"
                                            onClick={() =>
                                              openTeamNameDialog(team.name)
                                            }
                                          >
                                            {team.name}
                                            <Pencil className="w-3 h-3 opacity-50" />
                                          </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>Click to edit team name</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </TooltipProvider>
                                  </td>
                                  <td className="text-center px-1">
                                    {team.won}
                                  </td>
                                  <td className="text-center px-1">
                                    {team.drawn}
                                  </td>
                                  <td className="text-center px-1">
                                    {team.lost}
                                  </td>
                                  <td className="text-center px-1">
                                    {team.legDiff}
                                  </td>
                                  <td className="text-center px-1 font-semibold">
                                    {team.points}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="flex justify-center mt-4">
                {tournament &&
                  tournament.matches.every((m: Match) => m.completed) &&
                  Array.isArray(knockoutMatches) &&
                  knockoutMatches.length === 0 && (
                    <Button onClick={createKnockoutMatches}>
                      Start Finals
                    </Button>
                  )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="finals" className="mt-4">
          {knockoutMatches.length > 0 && (
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
                                    backgroundColor:
                                      teamColors[match.team1] || "#ccc",
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
                                    backgroundColor:
                                      teamColors[match.team2] || "#ccc",
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
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openScoreDialog(match, true)}
                                  className="h-7 w-7"
                                  aria-label="Edit score"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openScoreDialog(match, true)}
                                className="shrink-0 ml-2"
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
          )}
        </TabsContent>
      </Tabs>

      {/* Score Dialog */}
      <Dialog
        open={!!selectedMatch}
        onOpenChange={(open) => !open && setSelectedMatch(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedMatch && (
                <div className="text-center">
                  Enter Match Result
                  <div className="text-sm font-normal mt-1">
                    {selectedMatch.team1} vs {selectedMatch.team2}
                  </div>
                  {selectedMatch.isKnockout && (
                    <Badge variant="outline" className="mt-1">
                      Knockout Match
                    </Badge>
                  )}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedMatch && (
            <div className="grid grid-cols-3 items-center gap-4 py-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full shadow-md mb-2"
                  style={{ backgroundColor: teamColors[selectedMatch.team1] }}
                ></div>
                <div className="text-center text-sm">
                  {selectedMatch.team1.includes("Winner of Match")
                    ? "TBD"
                    : selectedMatch.team1}
                </div>
                {selectedMatch.team1.includes("Winner of Match") ? (
                  <div className="mt-2 text-center text-muted-foreground text-sm">
                    Waiting for results
                  </div>
                ) : (
                  <Input
                    type="number"
                    min="0"
                    className="mt-2 text-center"
                    value={score1}
                    onChange={(e) => setScore1(e.target.value)}
                  />
                )}
              </div>

              <div className="text-center text-xl font-bold">vs</div>

              <div className="flex flex-col items-center">
                <div
                  className="w-6 h-6 rounded-full shadow-md mb-2"
                  style={{ backgroundColor: teamColors[selectedMatch.team2] }}
                ></div>
                <div className="text-center text-sm">
                  {selectedMatch.team2.includes("Winner of Match")
                    ? "TBD"
                    : selectedMatch.team2}
                </div>
                {selectedMatch.team2.includes("Winner of Match") ? (
                  <div className="mt-2 text-center text-muted-foreground text-sm">
                    Waiting for results
                  </div>
                ) : (
                  <Input
                    type="number"
                    min="0"
                    className="mt-2 text-center"
                    value={score2}
                    onChange={(e) => setScore2(e.target.value)}
                  />
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMatch(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveScore}
              disabled={
                !!(
                  selectedMatch &&
                  (selectedMatch.team1.includes("Winner of Match") ||
                    selectedMatch.team2.includes("Winner of Match"))
                )
              }
            >
              Save Result
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Name Edit Dialog */}
      <Dialog open={showTeamNameDialog} onOpenChange={setShowTeamNameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Team Name</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="team-name" className="mb-2 block">
              Team Name
            </Label>
            <Input
              id="team-name"
              value={editingTeamName}
              onChange={(e) => setEditingTeamName(e.target.value)}
              className="w-full"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTeamNameDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={saveTeamName} disabled={!editingTeamName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
