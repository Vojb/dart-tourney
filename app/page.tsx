"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Add types for tournament and matches

type Match = {
  id: number;
  group?: number;
  round?: number;
  team1: string;
  team2: string;
  time: string;
  board: number;
  score1: number | null;
  score2: number | null;
  completed: boolean;
  winner?: string | null;
  nextMatchId?: number | null;
  nextMatchPosition?: string;
};

type Tournament = {
  groups: string[][];
  matches: Match[];
};

export default function TournamentScheduler() {
  const [numTeams, setNumTeams] = useState(8);
  const [numBoards, setNumBoards] = useState(2);
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

      // Add new teams if needed
      while (newTeamNames.length < numTeams) {
        newTeamNames.push(`Team ${newTeamNames.length + 1}`);
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
      matchDuration,
      startTime,
      teamsAdvancing,
    };
    localStorage.setItem("dartTournamentSettings", JSON.stringify(settings));
  }, [numTeams, numBoards, matchDuration, startTime, teamsAdvancing]);

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
      const updatedGroups = tournament.groups.map((group) =>
        group.map((team) => (team === oldName ? newName : team))
      );

      // Update matches
      const updatedMatches = tournament.matches.map((match) => ({
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
        const updatedKnockout = knockoutMatches.map((match) => ({
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
      tournament.groups.forEach((group) => {
        const index = group.findIndex((team) => team === selectedTeam);
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

  // Generate a random pastel color
  const generateRandomColor = () => {
    // Generate pastel colors for better visibility
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`;
  };

  const generateTournament = () => {
    // Create teams array using custom team names
    const teams = [...teamNames];

    // Generate colors for teams
    const colors = {};
    teams.forEach((team) => {
      // Keep existing colors if available
      colors[team] = teamColors[team] || generateRandomColor();
    });
    setTeamColors(colors);

    // Calculate optimal group size based on number of teams and boards
    const numGroups = Math.min(numBoards, Math.ceil(numTeams / 4));
    const groups = createGroups(teams, numGroups);

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
    teams.forEach((team) => {
      teamLastPlayed[team] = -1; // -1 means never played yet
    });

    while (allGroupMatches.length > 0) {
      const timeSlotTeams = new Set(); // Teams playing in current time slot
      let boardsUsedInTimeSlot = 0;
      let matchScheduledInThisTimeSlot = false;

      // Try to schedule matches for all available boards in this time slot
      while (boardsUsedInTimeSlot < numBoards && allGroupMatches.length > 0) {
        // Score each potential match based on how long since teams last played
        const scoredMatches = allGroupMatches.map((match, index) => {
          // Skip if either team is already playing in this time slot
          if (
            timeSlotTeams.has(match.team1) ||
            timeSlotTeams.has(match.team2)
          ) {
            return { index, score: -1 }; // Not eligible
          }

          // Calculate rest score - higher is better (more rest time)
          // If a team played in the previous time slot, we want to avoid scheduling them if possible
          const team1RestScore = currentTimeSlot - teamLastPlayed[match.team1];
          const team2RestScore = currentTimeSlot - teamLastPlayed[match.team2];

          // Prioritize matches where both teams have had some rest
          // Lower score means one or both teams played recently
          const minRestScore = Math.min(team1RestScore, team2RestScore);

          return { index, score: minRestScore };
        });

        // Filter out ineligible matches and sort by score (higher is better)
        const eligibleMatches = scoredMatches
          .filter((m) => m.score >= 0)
          .sort((a, b) => b.score - a.score);

        if (eligibleMatches.length > 0) {
          // Take the best match (teams with most rest time)
          const bestMatchIndex = eligibleMatches[0].index;
          const match = allGroupMatches.splice(bestMatchIndex, 1)[0];

          // Add teams to the current time slot
          timeSlotTeams.add(match.team1);
          timeSlotTeams.add(match.team2);

          // Update when these teams last played
          teamLastPlayed[match.team1] = currentTimeSlot;
          teamLastPlayed[match.team2] = currentTimeSlot;

          // Add match to schedule
          matches.push({
            ...match,
            id: matches.length + 1,
            time: formatTime(currentTime),
            board: boardsUsedInTimeSlot + 1,
            score1: null,
            score2: null,
            completed: false,
            team1: match.team1 || "",
            team2: match.team2 || "",
          });

          boardsUsedInTimeSlot++;
          matchScheduledInThisTimeSlot = true;
        } else {
          // No eligible matches for this time slot
          break;
        }
      }

      // If we couldn't schedule any matches in this time slot, or all boards are used,
      // move to the next time slot
      if (
        !matchScheduledInThisTimeSlot ||
        boardsUsedInTimeSlot >= numBoards ||
        allGroupMatches.length === 0
      ) {
        currentTime += matchDuration * 60 * 1000;
        currentTimeSlot++;
      }
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
      description: `Created a tournament with ${numTeams} teams and ${numBoards} dartboards.`,
    });
  };

  const createGroups = (teams: string[], numGroups: number): string[][] => {
    const groups: string[][] = Array.from({ length: numGroups }, () => []);
    teams.forEach((team, index) => {
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
    const [hours, minutes] = timeString.split(":").map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, "0")}:${date
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const openScoreDialog = (match, isKnockout = false) => {
    setSelectedMatch({ ...match, isKnockout });
    setScore1(match.score1 !== null ? match.score1.toString() : "");
    setScore2(match.score2 !== null ? match.score2.toString() : "");
  };

  const saveScore = () => {
    if (!selectedMatch) return;

    if (selectedMatch.isKnockout) {
      // Update knockout match
      const updatedMatches = knockoutMatches.map((match) => {
        if (match.id === selectedMatch.id) {
          return {
            ...match,
            score1: Number.parseInt(score1) || 0,
            score2: Number.parseInt(score2) || 0,
            completed: true,
            winner:
              Number.parseInt(score1) > Number.parseInt(score2)
                ? selectedMatch.team1
                : selectedMatch.team2,
          };
        }
        return match;
      });

      setKnockoutMatches(updatedMatches);

      // Check if we need to update next round matches with the winner
      if (selectedMatch.nextMatchId) {
        const nextMatch = updatedMatches.find(
          (m) => m.id === selectedMatch.nextMatchId
        );
        if (nextMatch) {
          const winner =
            Number.parseInt(score1) > Number.parseInt(score2)
              ? selectedMatch.team1
              : selectedMatch.team2;

          // Update the next match with this winner
          updatedMatches.forEach((match, index) => {
            if (match.id === selectedMatch.nextMatchId) {
              if (selectedMatch.nextMatchPosition === "team1") {
                updatedMatches[index] = {
                  ...match,
                  team1: winner,
                };
              } else {
                updatedMatches[index] = {
                  ...match,
                  team2: winner,
                };
              }
            }
          });

          setKnockoutMatches(updatedMatches);
        }
      }
    } else {
      // Update group stage match
      const updatedMatches = tournament.matches.map((match) => {
        if (match.id === selectedMatch.id) {
          return {
            ...match,
            score1: Number.parseInt(score1) || 0,
            score2: Number.parseInt(score2) || 0,
            completed: true,
          };
        }
        return match;
      });

      setTournament({
        groups: tournament.groups,
        matches: updatedMatches,
      });
    }

    setSelectedMatch(null);

    toast({
      title: "Score saved",
      description: `Updated result for ${selectedMatch.team1} vs ${selectedMatch.team2}`,
    });
  };

  // Update the calculateStandings function to include legs statistics
  const calculateStandings = (groupIndex: number) => {
    if (!tournament) return [];

    const groupNumber = groupIndex + 1;
    const groupMatches = tournament.matches.filter(
      (match: Match) => match.group === groupNumber
    );
    const teams = tournament.groups[groupIndex];

    const standings = teams.map((team: string) => ({
      name: team,
      played: 0,
      won: 0,
      lost: 0,
      drawn: 0,
      points: 0,
      legsFor: 0,
      legsAgainst: 0,
      legDiff: 0,
      color: (teamColors as { [key: string]: string })[team] || "#ccc",
    }));

    groupMatches.forEach((match: Match) => {
      if (!match.completed) return;
      const team1Index = standings.findIndex((t) => t.name === match.team1);
      const team2Index = standings.findIndex((t) => t.name === match.team2);
      if (team1Index === -1 || team2Index === -1) return;
      // Update matches played
      standings[team1Index].played++;
      standings[team2Index].played++;
      // Update legs statistics, with null checks
      if (match.score1 !== null && match.score2 !== null) {
        standings[team1Index].legsFor += match.score1;
        standings[team1Index].legsAgainst += match.score2;
        standings[team2Index].legsFor += match.score2;
        standings[team2Index].legsAgainst += match.score1;
        if (match.score1 > match.score2) {
          standings[team1Index].won++;
          standings[team1Index].points += 3;
          standings[team2Index].lost++;
        } else if (match.score1 < match.score2) {
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
    standings.forEach((team) => {
      team.legDiff = team.legsFor - team.legsAgainst;
    });

    // Sort by points (descending), then by leg difference
    return standings.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.legDiff - a.legDiff;
    });
  };

  // Function to get teams that advance from group stage
  const getAdvancingTeams = () => {
    if (!tournament) return [];

    const advancingTeams: any[] = [];

    tournament.groups.forEach((group, groupIndex) => {
      const standings = calculateStandings(groupIndex);
      // Take top N teams from each group
      const topTeams = standings.slice(0, teamsAdvancing);
      advancingTeams.push(
        ...topTeams.map((team) => ({
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
    const advancingTeams = getAdvancingTeams();

    if (advancingTeams.length === 0) {
      toast({
        variant: "destructive",
        title: "Cannot create knockout stage",
        description:
          "Please complete the group stage matches to determine advancing teams.",
      });
      return;
    }

    // Check if we have enough completed matches
    const completedMatches = tournament.matches.filter(
      (match) => match.completed
    );
    const totalMatches = tournament.matches.length;

    if (completedMatches.length < totalMatches) {
      toast({
        variant: "default" as const,
        title: "Group stage incomplete",
        description: `Only ${completedMatches.length} of ${totalMatches} matches are completed. Standings may change.`,
      });
    }

    // Determine the bracket size (8, 16, 32, etc.)
    let bracketSize = 2;
    while (bracketSize < advancingTeams.length) {
      bracketSize *= 2;
    }

    // Create knockout matches
    const matches = [];
    let matchId = 1;
    let currentRound = 1;
    let teamsInRound = advancingTeams;
    let nextRoundFirstMatchId = Math.ceil(advancingTeams.length / 2) + 1;

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

          roundMatches.push({
            id: matchId++,
            round: currentRound,
            team1: `Winner of Match ${previousRoundFirstIndex + i * 2}`,
            team2: `Winner of Match ${previousRoundFirstIndex + i * 2 + 1}`,
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
      description: `Created knockout bracket with ${advancingTeams.length} advancing teams.`,
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
        tournament.matches.length * matchDuration * 60000;

    // Add time based on round and match index
    const timeOffset =
      (round - 1) * 60 * 60000 + matchIndex * matchDuration * 60000;
    return formatTime(baseTime + timeOffset);
  };

  // Function to check if a team plays in consecutive time slots
  const getTeamSchedule = (teamName: string) => {
    if (!tournament) return [];

    return tournament.matches
      .filter((match) => match.team1 === teamName || match.team2 === teamName)
      .sort((a, b) => parseTime(a.time) - parseTime(b.time))
      .map((match) => ({
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
    <div className="container mx-auto py-4 px-2 sm:px-4 md:px-6">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-4 sm:mb-6">
        {tournamentName}
      </h1>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full max-w-4xl mx-auto"
      >
        <TabsList
          className="flex w-full overflow-x-auto no-scrollbar gap-1 sm:grid sm:grid-cols-4 sm:gap-2"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <TabsTrigger
            value="setup"
            className="min-w-[120px] flex-1 text-xs sm:text-sm py-3"
          >
            Setup
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            disabled={!tournament}
            className="min-w-[120px] flex-1 text-xs sm:text-sm py-3"
          >
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="standings"
            disabled={!tournament}
            className="min-w-[120px] flex-1 text-xs sm:text-sm py-3"
          >
            Standings
          </TabsTrigger>
          <TabsTrigger
            value="finals"
            disabled={!tournament}
            className="min-w-[120px] flex-1 text-xs sm:text-sm py-3"
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {tournament.matches.map((match, index) => (
                    <Card key={index} className="w-full">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm sm:text-base">
                          Match {index + 1}
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Board {match.board} • {match.time}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    teamColors[match.team1] || "#ccc",
                                }}
                              />
                              <span className="text-sm sm:text-base truncate">
                                {match.team1}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    teamColors[match.team2] || "#ccc",
                                }}
                              />
                              <span className="text-sm sm:text-base truncate">
                                {match.team2}
                              </span>
                            </div>
                          </div>
                          {match.completed ? (
                            <div className="flex flex-col items-end gap-1">
                              <div className="font-semibold text-base">
                                {match.score1} - {match.score2}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openScoreDialog(match)}
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
                              onClick={() => openScoreDialog(match)}
                              className="shrink-0"
                            >
                              Score
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-2 gap-4 min-w-[400px]">
                    {Array.from({ length: numBoards }, (_, boardIdx) => {
                      const boardMatches = tournament.matches.filter(
                        (m) => m.board === boardIdx + 1
                      );
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
                            boardMatches.map((match, idx) => (
                              <Card key={idx} className="w-full">
                                <CardHeader className="pb-2">
                                  <CardTitle className="text-xs sm:text-sm">
                                    {match.time}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{
                                            backgroundColor:
                                              teamColors[match.team1] || "#ccc",
                                          }}
                                        />
                                        <span className="text-xs sm:text-sm truncate">
                                          {match.team1}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-2">
                                        <div
                                          className="w-3 h-3 rounded-full"
                                          style={{
                                            backgroundColor:
                                              teamColors[match.team2] || "#ccc",
                                          }}
                                        />
                                        <span className="text-xs sm:text-sm truncate">
                                          {match.team2}
                                        </span>
                                      </div>
                                    </div>
                                    {match.completed ? (
                                      <div className="flex flex-col items-end gap-1">
                                        <div className="font-semibold text-base">
                                          {match.score1} - {match.score2}
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => openScoreDialog(match)}
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
                                        onClick={() => openScoreDialog(match)}
                                        className="shrink-0"
                                      >
                                        Score
                                      </Button>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="standings" className="mt-4">
          {tournament && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {tournament.groups.map((_, groupIndex) => {
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
                              {standings.map((team, index) => (
                                <tr
                                  key={team.name}
                                  className="border-b last:border-0"
                                >
                                  <td className="flex items-center gap-2 py-1 pr-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{
                                        backgroundColor:
                                          teamColors[team.name] || "#ccc",
                                      }}
                                    />
                                    <span className="truncate max-w-[100px]">
                                      {team.name}
                                    </span>
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
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      teamColors[match.team1] || "#ccc",
                                  }}
                                />
                                <span className="text-sm sm:text-base truncate">
                                  {match.team1}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{
                                    backgroundColor:
                                      teamColors[match.team2] || "#ccc",
                                  }}
                                />
                                <span className="text-sm sm:text-base truncate">
                                  {match.team2}
                                </span>
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
                  className="w-4 h-4 rounded-full mb-2"
                  style={{ backgroundColor: teamColors[selectedMatch.team1] }}
                ></div>
                <div className="text-center text-sm">{selectedMatch.team1}</div>
                <Input
                  type="number"
                  min="0"
                  className="mt-2 text-center"
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                />
              </div>

              <div className="text-center text-xl font-bold">vs</div>

              <div className="flex flex-col items-center">
                <div
                  className="w-4 h-4 rounded-full mb-2"
                  style={{ backgroundColor: teamColors[selectedMatch.team2] }}
                ></div>
                <div className="text-center text-sm">{selectedMatch.team2}</div>
                <Input
                  type="number"
                  min="0"
                  className="mt-2 text-center"
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedMatch(null)}>
              Cancel
            </Button>
            <Button onClick={saveScore}>Save Result</Button>
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
