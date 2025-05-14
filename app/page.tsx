"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Users, Target, Trophy, Save, Trash2, Edit, Check, Medal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TournamentScheduler() {
  const [numTeams, setNumTeams] = useState(8)
  const [numBoards, setNumBoards] = useState(2)
  const [matchDuration, setMatchDuration] = useState(15)
  const [startTime, setStartTime] = useState("09:00")
  const [tournament, setTournament] = useState(null)
  const [activeTab, setActiveTab] = useState("setup")
  const [teamColors, setTeamColors] = useState({})
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [score1, setScore1] = useState("")
  const [score2, setScore2] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [teamNames, setTeamNames] = useState([])
  const [editingTeamIndex, setEditingTeamIndex] = useState(null)
  const [editingTeamName, setEditingTeamName] = useState("")
  const [showTeamNameDialog, setShowTeamNameDialog] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamsAdvancing, setTeamsAdvancing] = useState(2)
  const [knockoutMatches, setKnockoutMatches] = useState([])
  const [knockoutStartTime, setKnockoutStartTime] = useState("")

  // Load data from local storage on component mount
  useEffect(() => {
    const loadSavedData = () => {
      try {
        // Load tournament data
        const savedTournament = localStorage.getItem("dartTournament")
        if (savedTournament) {
          setTournament(JSON.parse(savedTournament))
        }

        // Load team colors
        const savedColors = localStorage.getItem("dartTournamentColors")
        if (savedColors) {
          setTeamColors(JSON.parse(savedColors))
        }

        // Load knockout matches
        const savedKnockout = localStorage.getItem("dartTournamentKnockout")
        if (savedKnockout) {
          setKnockoutMatches(JSON.parse(savedKnockout))
        }

        // Load active tab
        const savedTab = localStorage.getItem("dartTournamentTab")
        if (savedTab) {
          setActiveTab(savedTab)
        }

        // Load settings
        const savedSettings = localStorage.getItem("dartTournamentSettings")
        if (savedSettings) {
          const settings = JSON.parse(savedSettings)
          setNumTeams(settings.numTeams)
          setNumBoards(settings.numBoards)
          setMatchDuration(settings.matchDuration)
          setStartTime(settings.startTime)
          setTeamsAdvancing(settings.teamsAdvancing || 2)
        }

        // Load team names
        const savedTeamNames = localStorage.getItem("dartTournamentTeamNames")
        if (savedTeamNames) {
          setTeamNames(JSON.parse(savedTeamNames))
        } else {
          // Initialize with default team names
          setTeamNames(Array.from({ length: numTeams }, (_, i) => `Team ${i + 1}`))
        }

        // Show toast if data was loaded
        if (savedTournament) {
          toast({
            title: "Tournament data loaded",
            description: "Your saved tournament has been restored.",
          })
        }
      } catch (error) {
        console.error("Error loading saved data:", error)
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "There was a problem loading your saved tournament.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadSavedData()
  }, [])

  // Calculate and set knockout start time when group matches are generated
  useEffect(() => {
    if (tournament && tournament.matches.length > 0) {
      const matches = tournament.matches
      const lastMatch = [...matches].sort(
        (a, b) => parseTime(a.time) + matchDuration * 60000 - (parseTime(b.time) + matchDuration * 60000),
      )[matches.length - 1]

      const lastMatchEndTime = parseTime(lastMatch.time) + matchDuration * 60000
      const knockoutTime = new Date(lastMatchEndTime + 30 * 60000) // 30 minutes after last group match
      setKnockoutStartTime(formatTime(knockoutTime.getTime()))
    }
  }, [tournament, matchDuration])

  // Update team names when numTeams changes
  useEffect(() => {
    if (!isLoading) {
      const newTeamNames = [...teamNames]

      // Add new teams if needed
      while (newTeamNames.length < numTeams) {
        newTeamNames.push(`Team ${newTeamNames.length + 1}`)
      }

      // Remove teams if needed
      while (newTeamNames.length > numTeams) {
        newTeamNames.pop()
      }

      setTeamNames(newTeamNames)
    }
  }, [numTeams, isLoading])

  // Save team names to local storage
  useEffect(() => {
    if (!isLoading && teamNames.length > 0) {
      localStorage.setItem("dartTournamentTeamNames", JSON.stringify(teamNames))
    }
  }, [teamNames, isLoading])

  // Save tournament data to local storage whenever it changes
  useEffect(() => {
    if (tournament) {
      localStorage.setItem("dartTournament", JSON.stringify(tournament))
    }
  }, [tournament])

  // Save knockout matches to local storage
  useEffect(() => {
    if (knockoutMatches.length > 0) {
      localStorage.setItem("dartTournamentKnockout", JSON.stringify(knockoutMatches))
    }
  }, [knockoutMatches])

  // Save team colors whenever they change
  useEffect(() => {
    if (Object.keys(teamColors).length > 0) {
      localStorage.setItem("dartTournamentColors", JSON.stringify(teamColors))
    }
  }, [teamColors])

  // Save active tab whenever it changes
  useEffect(() => {
    localStorage.setItem("dartTournamentTab", activeTab)
  }, [activeTab])

  // Save settings whenever they change
  useEffect(() => {
    const settings = {
      numTeams,
      numBoards,
      matchDuration,
      startTime,
      teamsAdvancing,
    }
    localStorage.setItem("dartTournamentSettings", JSON.stringify(settings))
  }, [numTeams, numBoards, matchDuration, startTime, teamsAdvancing])

  // Clear all saved data
  const clearSavedData = () => {
    localStorage.removeItem("dartTournament")
    localStorage.removeItem("dartTournamentColors")
    localStorage.removeItem("dartTournamentTab")
    localStorage.removeItem("dartTournamentSettings")
    localStorage.removeItem("dartTournamentTeamNames")
    localStorage.removeItem("dartTournamentKnockout")

    setTournament(null)
    setTeamColors({})
    setActiveTab("setup")
    setTeamNames(Array.from({ length: numTeams }, (_, i) => `Team ${i + 1}`))
    setKnockoutMatches([])

    toast({
      title: "Tournament data cleared",
      description: "All saved tournament data has been removed.",
    })
  }

  // Handle team name change
  const handleTeamNameChange = (index, newName) => {
    const updatedTeamNames = [...teamNames]
    const oldName = updatedTeamNames[index]
    updatedTeamNames[index] = newName
    setTeamNames(updatedTeamNames)

    // If tournament exists, update all references to this team
    if (tournament) {
      // Update team colors
      const updatedColors = { ...teamColors }
      if (updatedColors[oldName]) {
        updatedColors[newName] = updatedColors[oldName]
        delete updatedColors[oldName]
        setTeamColors(updatedColors)
      }

      // Update tournament groups
      const updatedGroups = tournament.groups.map((group) => group.map((team) => (team === oldName ? newName : team)))

      // Update matches
      const updatedMatches = tournament.matches.map((match) => ({
        ...match,
        team1: match.team1 === oldName ? newName : match.team1,
        team2: match.team2 === oldName ? newName : match.team2,
      }))

      setTournament({
        ...tournament,
        groups: updatedGroups,
        matches: updatedMatches,
      })

      // Update knockout matches if necessary
      if (knockoutMatches.length > 0) {
        const updatedKnockout = knockoutMatches.map((match) => ({
          ...match,
          team1: match.team1 === oldName ? newName : match.team1,
          team2: match.team2 === oldName ? newName : match.team2,
        }))
        setKnockoutMatches(updatedKnockout)
      }
    }
  }

  // Open team name edit dialog
  const openTeamNameDialog = (team) => {
    setSelectedTeam(team)
    setEditingTeamName(team)
    setShowTeamNameDialog(true)
  }

  // Save edited team name
  const saveTeamName = () => {
    if (!selectedTeam || !editingTeamName.trim()) return

    // Find the team in the tournament
    let teamIndex = -1
    if (tournament) {
      tournament.groups.forEach((group) => {
        const index = group.findIndex((team) => team === selectedTeam)
        if (index !== -1) {
          teamIndex = teamNames.findIndex((name) => name === selectedTeam)
        }
      })
    } else {
      teamIndex = teamNames.findIndex((name) => name === selectedTeam)
    }

    if (teamIndex !== -1) {
      handleTeamNameChange(teamIndex, editingTeamName.trim())

      toast({
        title: "Team name updated",
        description: `"${selectedTeam}" has been renamed to "${editingTeamName.trim()}"`,
      })
    }

    setShowTeamNameDialog(false)
    setSelectedTeam(null)
    setEditingTeamName("")
  }

  // Generate a random pastel color
  const generateRandomColor = () => {
    // Generate pastel colors for better visibility
    const hue = Math.floor(Math.random() * 360)
    return `hsl(${hue}, 70%, 80%)`
  }

  const generateTournament = () => {
    // Create teams array using custom team names
    const teams = [...teamNames]

    // Generate colors for teams
    const colors = {}
    teams.forEach((team) => {
      // Keep existing colors if available
      colors[team] = teamColors[team] || generateRandomColor()
    })
    setTeamColors(colors)

    // Calculate optimal group size based on number of teams and boards
    const numGroups = Math.min(numBoards, Math.ceil(numTeams / 4))
    const groups = createGroups(teams, numGroups)

    // Generate all matches for each group
    const allGroupMatches = []
    groups.forEach((group, groupIndex) => {
      const groupMatches = generateRoundRobinMatches(group)
      groupMatches.forEach((match) => {
        allGroupMatches.push({
          ...match,
          group: groupIndex + 1,
        })
      })
    })

    // Schedule matches ensuring no team plays twice at the same time
    // and avoiding consecutive matches for teams when possible
    const matches = []
    let currentTime = parseTime(startTime)
    let currentTimeSlot = 0

    // Track when each team last played (by time slot index)
    const teamLastPlayed = {}
    teams.forEach((team) => {
      teamLastPlayed[team] = -1 // -1 means never played yet
    })

    while (allGroupMatches.length > 0) {
      const timeSlotTeams = new Set() // Teams playing in current time slot
      let boardsUsedInTimeSlot = 0
      let matchScheduledInThisTimeSlot = false

      // Try to schedule matches for all available boards in this time slot
      while (boardsUsedInTimeSlot < numBoards && allGroupMatches.length > 0) {
        // Score each potential match based on how long since teams last played
        const scoredMatches = allGroupMatches.map((match, index) => {
          // Skip if either team is already playing in this time slot
          if (timeSlotTeams.has(match.team1) || timeSlotTeams.has(match.team2)) {
            return { index, score: -1 } // Not eligible
          }

          // Calculate rest score - higher is better (more rest time)
          // If a team played in the previous time slot, we want to avoid scheduling them if possible
          const team1RestScore = currentTimeSlot - teamLastPlayed[match.team1]
          const team2RestScore = currentTimeSlot - teamLastPlayed[match.team2]

          // Prioritize matches where both teams have had some rest
          // Lower score means one or both teams played recently
          const minRestScore = Math.min(team1RestScore, team2RestScore)

          return { index, score: minRestScore }
        })

        // Filter out ineligible matches and sort by score (higher is better)
        const eligibleMatches = scoredMatches.filter((m) => m.score >= 0).sort((a, b) => b.score - a.score)

        if (eligibleMatches.length > 0) {
          // Take the best match (teams with most rest time)
          const bestMatchIndex = eligibleMatches[0].index
          const match = allGroupMatches.splice(bestMatchIndex, 1)[0]

          // Add teams to the current time slot
          timeSlotTeams.add(match.team1)
          timeSlotTeams.add(match.team2)

          // Update when these teams last played
          teamLastPlayed[match.team1] = currentTimeSlot
          teamLastPlayed[match.team2] = currentTimeSlot

          // Add match to schedule
          matches.push({
            ...match,
            id: matches.length + 1,
            time: formatTime(currentTime),
            board: boardsUsedInTimeSlot + 1,
            score1: null,
            score2: null,
            completed: false,
          })

          boardsUsedInTimeSlot++
          matchScheduledInThisTimeSlot = true
        } else {
          // No eligible matches for this time slot
          break
        }
      }

      // If we couldn't schedule any matches in this time slot, or all boards are used,
      // move to the next time slot
      if (!matchScheduledInThisTimeSlot || boardsUsedInTimeSlot >= numBoards || allGroupMatches.length === 0) {
        currentTime += matchDuration * 60 * 1000
        currentTimeSlot++
      }
    }

    // Sort matches by time for the schedule view
    const sortedMatches = [...matches].sort((a, b) => {
      if (a.time === b.time) {
        return a.board - b.board
      }
      return parseTime(a.time) - parseTime(b.time)
    })

    // Clear any existing knockout matches
    setKnockoutMatches([])

    const newTournament = { groups, matches: sortedMatches }
    setTournament(newTournament)
    setActiveTab("schedule")

    toast({
      title: "Tournament generated",
      description: `Created a tournament with ${numTeams} teams and ${numBoards} dartboards.`,
    })
  }

  const createGroups = (teams, numGroups) => {
    const groups = Array.from({ length: numGroups }, () => [])
    teams.forEach((team, index) => {
      groups[index % numGroups].push(team)
    })
    return groups
  }

  const generateRoundRobinMatches = (teams) => {
    const matches = []

    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        matches.push({
          team1: teams[i],
          team2: teams[j],
        })
      }
    }

    return matches
  }

  const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date.getTime()
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`
  }

  const openScoreDialog = (match, isKnockout = false) => {
    setSelectedMatch({ ...match, isKnockout })
    setScore1(match.score1 !== null ? match.score1.toString() : "")
    setScore2(match.score2 !== null ? match.score2.toString() : "")
  }

  const saveScore = () => {
    if (!selectedMatch) return

    if (selectedMatch.isKnockout) {
      // Update knockout match
      const updatedMatches = knockoutMatches.map((match) => {
        if (match.id === selectedMatch.id) {
          return {
            ...match,
            score1: Number.parseInt(score1) || 0,
            score2: Number.parseInt(score2) || 0,
            completed: true,
            winner: Number.parseInt(score1) > Number.parseInt(score2) ? match.team1 : match.team2,
          }
        }
        return match
      })

      setKnockoutMatches(updatedMatches)

      // Check if we need to update next round matches with the winner
      if (selectedMatch.nextMatchId) {
        const nextMatch = updatedMatches.find((m) => m.id === selectedMatch.nextMatchId)
        if (nextMatch) {
          const winner = Number.parseInt(score1) > Number.parseInt(score2) ? selectedMatch.team1 : selectedMatch.team2

          // Update the next match with this winner
          updatedMatches.forEach((match, index) => {
            if (match.id === selectedMatch.nextMatchId) {
              if (selectedMatch.nextMatchPosition === "team1") {
                updatedMatches[index] = {
                  ...match,
                  team1: winner,
                }
              } else {
                updatedMatches[index] = {
                  ...match,
                  team2: winner,
                }
              }
            }
          })

          setKnockoutMatches(updatedMatches)
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
          }
        }
        return match
      })

      setTournament({
        ...tournament,
        matches: updatedMatches,
      })
    }

    setSelectedMatch(null)

    toast({
      title: "Score saved",
      description: `Updated result for ${selectedMatch.team1} vs ${selectedMatch.team2}`,
    })
  }

  // Update the calculateStandings function to include legs statistics
  const calculateStandings = (groupIndex) => {
    if (!tournament) return []

    const groupNumber = groupIndex + 1
    const groupMatches = tournament.matches.filter((match) => match.group === groupNumber)
    const teams = tournament.groups[groupIndex]

    const standings = teams.map((team) => ({
      name: team,
      played: 0,
      won: 0,
      lost: 0,
      drawn: 0,
      points: 0,
      legsFor: 0,
      legsAgainst: 0,
      legDiff: 0,
      color: teamColors[team],
    }))

    groupMatches.forEach((match) => {
      if (!match.completed) return

      const team1Index = standings.findIndex((t) => t.name === match.team1)
      const team2Index = standings.findIndex((t) => t.name === match.team2)

      if (team1Index === -1 || team2Index === -1) return

      // Update matches played
      standings[team1Index].played++
      standings[team2Index].played++

      // Update legs statistics
      standings[team1Index].legsFor += match.score1
      standings[team1Index].legsAgainst += match.score2
      standings[team2Index].legsFor += match.score2
      standings[team2Index].legsAgainst += match.score1

      if (match.score1 > match.score2) {
        // Team 1 won
        standings[team1Index].won++
        standings[team1Index].points += 3
        standings[team2Index].lost++
      } else if (match.score1 < match.score2) {
        // Team 2 won
        standings[team2Index].won++
        standings[team2Index].points += 3
        standings[team1Index].lost++
      } else {
        // Draw
        standings[team1Index].drawn++
        standings[team2Index].drawn++
        standings[team1Index].points += 1
        standings[team2Index].points += 1
      }
    })

    // Calculate leg difference
    standings.forEach((team) => {
      team.legDiff = team.legsFor - team.legsAgainst
    })

    // Sort by points (descending), then by leg difference
    return standings.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points
      }
      return b.legDiff - a.legDiff
    })
  }

  // Function to get teams that advance from group stage
  const getAdvancingTeams = () => {
    if (!tournament) return []

    const advancingTeams = []

    tournament.groups.forEach((group, groupIndex) => {
      const standings = calculateStandings(groupIndex)
      // Take top N teams from each group
      const topTeams = standings.slice(0, teamsAdvancing)
      advancingTeams.push(
        ...topTeams.map((team) => ({
          name: team.name,
          group: groupIndex + 1,
          position: advancingTeams.length + 1,
          color: teamColors[team.name],
        })),
      )
    })

    return advancingTeams
  }

  // Create knockout stage matches
  const createKnockoutMatches = () => {
    const advancingTeams = getAdvancingTeams()

    if (advancingTeams.length === 0) {
      toast({
        variant: "destructive",
        title: "Cannot create knockout stage",
        description: "Please complete the group stage matches to determine advancing teams.",
      })
      return
    }

    // Check if we have enough completed matches
    const completedMatches = tournament.matches.filter((match) => match.completed)
    const totalMatches = tournament.matches.length

    if (completedMatches.length < totalMatches) {
      toast({
        variant: "warning",
        title: "Group stage incomplete",
        description: `Only ${completedMatches.length} of ${totalMatches} matches are completed. Standings may change.`,
      })
    }

    // Determine the bracket size (8, 16, 32, etc.)
    let bracketSize = 2
    while (bracketSize < advancingTeams.length) {
      bracketSize *= 2
    }

    // Create knockout matches
    const matches = []
    let matchId = 1
    let currentRound = 1
    let teamsInRound = advancingTeams
    let nextRoundFirstMatchId = Math.ceil(advancingTeams.length / 2) + 1

    // For first round, match teams based on group performance
    // Example: Group A 1st vs Group B 2nd, Group B 1st vs Group A 2nd
    while (teamsInRound.length > 1) {
      const roundMatches = []
      const numMatchesInRound = Math.floor(teamsInRound.length / 2)

      // For the first round, create matchups
      if (currentRound === 1) {
        // Sort teams by position in group
        const sortedTeams = [...teamsInRound].sort((a, b) => {
          // First by group number
          if (a.group !== b.group) return a.group - b.group
          // Then by position within group
          return a.position - b.position
        })

        // Create matchups (1st vs last, 2nd vs 2nd last, etc.)
        for (let i = 0; i < Math.floor(sortedTeams.length / 2); i++) {
          const team1 = sortedTeams[i]
          const team2 = sortedTeams[sortedTeams.length - 1 - i]

          // Calculate which match in the next round this will feed into
          const nextMatchId = currentRound < Math.log2(bracketSize) ? nextRoundFirstMatchId + Math.floor(i / 2) : null
          const nextMatchPosition = i % 2 === 0 ? "team1" : "team2"

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
          })
        }
      } else {
        // For later rounds, create placeholder matches
        for (let i = 0; i < numMatchesInRound; i++) {
          const nextMatchId = currentRound < Math.log2(bracketSize) ? nextRoundFirstMatchId + Math.floor(i / 2) : null
          const nextMatchPosition = i % 2 === 0 ? "team1" : "team2"

          // For matches after the first round, teams will be determined by winners
          const previousRoundFirstIndex = matchId - numMatchesInRound * 2

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
          })
        }
      }

      matches.push(...roundMatches)

      // Prepare for next round
      teamsInRound = roundMatches.map((match) => ({
        name: `Winner of Match ${match.id}`,
        match: match.id,
      }))

      currentRound++
      nextRoundFirstMatchId = matchId
    }

    setKnockoutMatches(matches)
    setActiveTab("finals")

    toast({
      title: "Knockout stage created",
      description: `Created knockout bracket with ${advancingTeams.length} advancing teams.`,
    })
  }

  // Calculate time for knockout match
  const calculateKnockoutMatchTime = (round, matchIndex) => {
    // Use knockout start time for base
    const baseTime = knockoutStartTime
      ? parseTime(knockoutStartTime)
      : parseTime(startTime) + tournament.matches.length * matchDuration * 60000

    // Add time based on round and match index
    const timeOffset = (round - 1) * 60 * 60000 + matchIndex * matchDuration * 60000
    return formatTime(baseTime + timeOffset)
  }

  // Function to check if a team plays in consecutive time slots
  const getTeamSchedule = (teamName) => {
    if (!tournament) return []

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
      }))
  }

  // Get knockout round name
  const getKnockoutRoundName = (round, totalTeams) => {
    const totalRounds = Math.ceil(Math.log2(totalTeams))
    const roundsFromFinal = totalRounds - round

    switch (roundsFromFinal) {
      case 0:
        return "Final"
      case 1:
        return "Semi-Finals"
      case 2:
        return "Quarter-Finals"
      case 3:
        return "Round of 16"
      case 4:
        return "Round of 32"
      default:
        return `Round ${round}`
    }
  }

  // Group knockout matches by round
  const getKnockoutMatchesByRound = () => {
    if (!knockoutMatches.length) return []

    const rounds = []
    const totalTeams = tournament.groups.reduce((acc, group) => acc + Math.min(group.length, teamsAdvancing), 0)

    // Group matches by round
    knockoutMatches.forEach((match) => {
      if (!rounds[match.round - 1]) {
        rounds[match.round - 1] = {
          name: getKnockoutRoundName(match.round, totalTeams),
          matches: [],
        }
      }
      rounds[match.round - 1].matches.push(match)
    })

    return rounds
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading tournament data...</h2>
          <p className="text-muted-foreground">Please wait while we restore your saved tournament.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Dart Tournament Scheduler</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="schedule" disabled={!tournament}>
            Schedule
          </TabsTrigger>
          <TabsTrigger value="standings" disabled={!tournament}>
            Standings
          </TabsTrigger>
          <TabsTrigger value="finals" disabled={!tournament}>
            Finals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Settings</CardTitle>
              <CardDescription>
                Configure your tournament by setting the number of teams, dartboards, and timing details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {tournament && (
                <Alert className="mb-4">
                  <AlertDescription>
                    You have an active tournament. Generating a new tournament will replace the current one.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="teams">Number of Teams</Label>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="teams"
                    type="number"
                    min="2"
                    value={numTeams}
                    onChange={(e) => setNumTeams(Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="boards">Number of Dartboards</Label>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="boards"
                    type="number"
                    min="1"
                    value={numBoards}
                    onChange={(e) => setNumBoards(Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Match Duration (minutes)</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    value={matchDuration}
                    onChange={(e) => setMatchDuration(Number.parseInt(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Input id="start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="teams-advancing">Teams Advancing per Group</Label>
                <div className="flex items-center space-x-2">
                  <Medal className="h-4 w-4 text-muted-foreground" />
                  <Select
                    value={teamsAdvancing.toString()}
                    onValueChange={(value) => setTeamsAdvancing(Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of teams" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Top 1 team</SelectItem>
                      <SelectItem value="2">Top 2 teams</SelectItem>
                      <SelectItem value="3">Top 3 teams</SelectItem>
                      <SelectItem value="4">Top 4 teams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  This determines how many teams from each group will advance to the knockout stage.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Team Names</Label>
                <Card>
                  <CardContent className="p-4">
                    <ScrollArea className="h-[200px] pr-4">
                      <div className="space-y-2">
                        {teamNames.map((name, index) => (
                          <div key={index} className="flex items-center justify-between">
                            {editingTeamIndex === index ? (
                              <div className="flex items-center space-x-2 w-full">
                                <Input
                                  value={editingTeamName}
                                  onChange={(e) => setEditingTeamName(e.target.value)}
                                  className="flex-1"
                                  autoFocus
                                />
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    handleTeamNameChange(index, editingTeamName)
                                    setEditingTeamIndex(null)
                                  }}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full mr-2"
                                    style={{ backgroundColor: teamColors[name] || generateRandomColor() }}
                                  ></div>
                                  <span>{name}</span>
                                </div>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingTeamIndex(index)
                                    setEditingTeamName(name)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
              <Button onClick={generateTournament} className="w-full sm:w-auto">
                <Save className="mr-2 h-4 w-4" />
                Generate Tournament
              </Button>

              {tournament && (
                <Button variant="destructive" onClick={clearSavedData} className="w-full sm:w-auto">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear Tournament Data
                </Button>
              )}
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          {tournament && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Group Assignments</CardTitle>
                  <CardDescription>Teams have been divided into {tournament.groups.length} groups</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tournament.groups.map((group, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">Group {index + 1}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {group.map((team, teamIndex) => (
                              <li key={teamIndex} className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div
                                    className="w-4 h-4 rounded-full mr-2"
                                    style={{ backgroundColor: teamColors[team] }}
                                  ></div>
                                  {team}
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => openTeamNameDialog(team)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Match Schedule</CardTitle>
                  <CardDescription>
                    {tournament.matches.length} matches scheduled across {numBoards} dartboards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 sm:px-4">Time</th>
                          <th className="text-left py-3 px-2 sm:px-4">Board</th>
                          <th className="text-left py-3 px-2 sm:px-4">Group</th>
                          <th className="text-left py-3 px-2 sm:px-4">Match</th>
                          <th className="text-left py-3 px-2 sm:px-4">Result</th>
                          <th className="text-left py-3 px-2 sm:px-4">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tournament.matches.map((match, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-2 sm:px-4">{match.time}</td>
                            <td className="py-3 px-2 sm:px-4">Board {match.board}</td>
                            <td className="py-3 px-2 sm:px-4">Group {match.group}</td>
                            <td className="py-3 px-2 sm:px-4">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <div
                                  className="w-3 h-3 rounded-full inline-block mr-1"
                                  style={{ backgroundColor: teamColors[match.team1] }}
                                ></div>
                                <span className="text-sm sm:text-base">{match.team1}</span>
                                <span className="hidden sm:inline mx-1">vs</span>
                                <div className="flex items-center">
                                  <div
                                    className="w-3 h-3 rounded-full inline-block mr-1"
                                    style={{ backgroundColor: teamColors[match.team2] }}
                                  ></div>
                                  <span className="text-sm sm:text-base">{match.team2}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-2 sm:px-4">
                              {match.completed ? (
                                <Badge variant={match.score1 === match.score2 ? "outline" : "default"}>
                                  {match.score1} - {match.score2}
                                </Badge>
                              ) : (
                                <Badge variant="outline">Pending</Badge>
                              )}
                            </td>
                            <td className="py-3 px-2 sm:px-4">
                              <Button
                                size="sm"
                                variant={match.completed ? "outline" : "default"}
                                onClick={() => openScoreDialog(match)}
                              >
                                {match.completed ? "Update" : "Add Result"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setActiveTab("setup")} className="w-full sm:w-auto">
                    Modify Tournament
                  </Button>
                  <Button onClick={() => setActiveTab("standings")} className="w-full sm:w-auto">
                    View Standings
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="standings">
          {tournament && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Tournament Standings
                  </CardTitle>
                  <CardDescription>Current standings for all groups</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2">
                    {tournament.groups.map((group, groupIndex) => {
                      const standings = calculateStandings(groupIndex)
                      return (
                        <Card key={groupIndex}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">Group {groupIndex + 1}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="overflow-x-auto -mx-4 sm:mx-0">
                          
                              <table className="w-full border-collapse text-sm">
                                <thead>
                                  <tr className="border-b">
                                    <th className="text-left py-2 px-2">Team</th>
                                    <th className="text-center py-2 px-1">P</th>
                                    <th className="text-center py-2 px-1">W</th>
                                    <th className="text-center py-2 px-1">D</th>
                                    <th className="text-center py-2 px-1">L</th>
                                    <th className="text-center py-2 px-1">Diff</th>
                                    <th className="text-center py-2 px-1">Pts</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {standings.map((team, index) => (
                                    <tr
                                      key={index}
                                      className={`border-b hover:bg-muted/50 ${index < teamsAdvancing ? "font-medium" : ""}`}
                                    >
                                      <td className="py-2 px-2">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center">
                                            <div
                                              className="w-3 h-3 rounded-full mr-2"
                                              style={{ backgroundColor: team.color }}
                                            ></div>
                                            {team.name}
                                            {index < teamsAdvancing && (
                                              <Badge variant="secondary" className="ml-2 text-xs">
                                                Advances
                                              </Badge>
                                            )}
                                          </div>
                                          <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-6 w-6"
                                            onClick={() => openTeamNameDialog(team.name)}
                                          >
                                            <Edit className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </td>
                                      <td className="text-center py-2 px-1">{team.played}</td>
                                      <td className="text-center py-2 px-1">{team.won}</td>
                                      <td className="text-center py-2 px-1">{team.drawn}</td>
                                      <td className="text-center py-2 px-1">{team.lost}</td>
                                      
                                      <td
                                        className="text-center py-2 px-1"
                                        className={
                                          team.legDiff > 0 ? "text-green-600" : team.legDiff < 0 ? "text-red-600" : ""
                                        }
                                      >
                                        {team.legDiff > 0 ? "+" : ""}
                                        {team.legDiff}
                                      </td>
                                      <td className="text-center py-2 px-1 font-bold">{team.points}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-2">
                  <Button onClick={() => setActiveTab("schedule")} className="w-full sm:w-auto">
                    Back to Schedule
                  </Button>
                  <Button onClick={() => setActiveTab("finals")} className="w-full sm:w-auto">
                    View Finals
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Team Schedules</CardTitle>
                  <CardDescription>View the complete schedule for each team</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tournament.groups.flat().map((team, index) => {
                      const schedule = getTeamSchedule(team)
                      return (
                        <Card key={index}>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center justify-between">
                              <div className="flex items-center">
                                <div
                                  className="w-4 h-4 rounded-full mr-2"
                                  style={{ backgroundColor: teamColors[team] }}
                                ></div>
                                {team}
                              </div>
                              <Button size="icon" variant="ghost" onClick={() => openTeamNameDialog(team)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2 text-sm">
                              {schedule.map((match, matchIndex) => (
                                <li key={matchIndex} className="flex justify-between items-center">
                                  <span>{match.time}</span>
                                  <span>vs {match.opponent}</span>
                                  <div className="flex items-center gap-2">
                                    {match.completed && <Badge variant="secondary">{match.result}</Badge>}
                                    <Badge variant="outline">Board {match.board}</Badge>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="finals">
          {tournament && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Knockout Stage
                  </CardTitle>
                  <CardDescription>Teams advancing from group stages compete in elimination matches</CardDescription>
                </CardHeader>
                <CardContent>
                  {knockoutMatches.length > 0 ? (
                    <div className="space-y-8">
                      {getKnockoutMatchesByRound().map((round, roundIndex) => (
                        <div key={roundIndex} className="space-y-4">
                          <h3 className="text-lg font-semibold">{round.name}</h3>
                          <div className="grid gap-4 sm:grid-cols-2">
                            {round.matches.map((match, matchIndex) => (
                              <Card key={matchIndex} className="overflow-hidden">
                                <CardHeader className="pb-2 bg-muted/30">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">Match {match.id}</Badge>
                                      <Badge variant="outline">{match.time}</Badge>
                                      <Badge variant="outline">Board {match.board}</Badge>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant={match.completed ? "outline" : "default"}
                                      onClick={() => openScoreDialog(match, true)}
                                      disabled={
                                        !match.team1 ||
                                        match.team1.startsWith("Winner") ||
                                        !match.team2 ||
                                        match.team2.startsWith("Winner")
                                      }
                                    >
                                      {match.completed ? "Update" : "Add Result"}
                                    </Button>
                                  </div>
                                </CardHeader>
                                <CardContent className="pb-4 pt-4">
                                  <div className="flex items-center gap-2 mb-3">
                                    <div className="w-full flex justify-between items-center bg-muted/20 p-2 rounded-md">
                                      <div className="flex items-center gap-2">
                                        {teamColors[match.team1] ? (
                                          <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: teamColors[match.team1] }}
                                          ></div>
                                        ) : (
                                          <div className="w-3 h-3"></div>
                                        )}
                                        <span
                                          className={match.completed && match.winner === match.team1 ? "font-bold" : ""}
                                        >
                                          {match.team1}
                                        </span>
                                      </div>
                                      {match.completed && (
                                        <Badge variant={match.winner === match.team1 ? "default" : "outline"}>
                                          {match.score1}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-full flex justify-between items-center bg-muted/20 p-2 rounded-md">
                                      <div className="flex items-center gap-2">
                                        {teamColors[match.team2] ? (
                                          <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: teamColors[match.team2] }}
                                          ></div>
                                        ) : (
                                          <div className="w-3 h-3"></div>
                                        )}
                                        <span
                                          className={match.completed && match.winner === match.team2 ? "font-bold" : ""}
                                        >
                                          {match.team2}
                                        </span>
                                      </div>
                                      {match.completed && (
                                        <Badge variant={match.winner === match.team2 ? "default" : "outline"}>
                                          {match.score2}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">No Knockout Matches Yet</h3>
                      <p className="text-sm text-muted-foreground mb-6">
                        Complete your group stage matches and generate the knockout bracket to see finals schedule.
                      </p>
                      <Button onClick={createKnockoutMatches}>Create Knockout Stage</Button>
                    </div>
                  )}
                </CardContent>
                {knockoutMatches.length > 0 && (
                  <CardFooter className="flex justify-between">
                    <div className="text-sm text-muted-foreground">
                      Top {teamsAdvancing} {teamsAdvancing === 1 ? "team" : "teams"} from each group advance to knockout
                      stage
                    </div>
                    <Button variant="outline" onClick={createKnockoutMatches}>
                      Regenerate Bracket
                    </Button>
                  </CardFooter>
                )}
              </Card>

              {knockoutMatches.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Advancing Teams</CardTitle>
                    <CardDescription>
                      Teams qualifying for the knockout stage based on group performance
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {tournament.groups.map((_, groupIndex) => {
                        const standings = calculateStandings(groupIndex)
                        const advancingTeams = standings.slice(0, teamsAdvancing)

                        return (
                          <Card key={groupIndex}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">Group {groupIndex + 1} Qualifiers</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <ul className="space-y-2">
                                {advancingTeams.map((team, index) => (
                                  // Also update the advancing teams view in the finals tab to include leg difference
                                  // Find this section in the finals tab:
                                  <li key={index} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      <div
                                        className="w-4 h-4 rounded-full mr-2"
                                        style={{ backgroundColor: team.color }}
                                      ></div>
                                      <div className="flex flex-col">
                                        <span>{team.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {team.points} pts ({team.won}W {team.drawn}D {team.lost}L)
                                        </span>
                                      </div>
                                    </div>
                                    <Badge variant="outline">{index + 1}</Badge>
                                  </li>
                                ))}
                              </ul>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Score Dialog */}
      <Dialog open={!!selectedMatch} onOpenChange={(open) => !open && setSelectedMatch(null)}>
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
            <Button variant="outline" onClick={() => setShowTeamNameDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveTeamName} disabled={!editingTeamName.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
