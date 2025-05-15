import { Card } from "../../components/ui/card";
import { Match } from "@/types/tournament";
import { MatchCard } from "./MatchCard";
import { useEffect, useState, useCallback } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import { cn } from "../../lib/utils";
import useEmblaCarousel from "embla-carousel-react";

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
  tournamentName?: string;
}

export function MatchBoardGrid({
  matches,
  numBoards,
  teamColors,
  onScoreClick,
  onScoreChange,
  onScoreSave,
  showGroup = false,
  tournamentName,
}: MatchBoardGridProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false });

  // Handle slide change
  const onSlideChange = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  // Set up carousel event listeners
  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", onSlideChange);
    onSlideChange();

    return () => {
      emblaApi.off("select", onSlideChange);
    };
  }, [emblaApi, onSlideChange]);

  // Check if we're on mobile when component mounts and window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    // Initial check
    checkIfMobile();

    // Add resize listener
    window.addEventListener("resize", checkIfMobile);

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Scroll to a specific slide
  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  // Mobile swiper view
  if (isMobile) {
    return (
      <div className="w-full">
        <div className="text-center text-sm text-muted-foreground mb-2">
          <span>Swipe to view all boards</span>
          <div className="flex items-center justify-center gap-1 mt-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 8l4 4-4 4" />
              <path d="M3 12h18" />
            </svg>
          </div>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {Array.from({ length: numBoards }, (_, boardIdx) => {
              const boardMatches = matches.filter(
                (m) => m.board === boardIdx + 1
              );
              return (
                <div key={boardIdx} className="min-w-0 flex-[0_0_100%] pl-0">
                  <div className="flex flex-col gap-2 p-1">
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
                          tournamentName={tournamentName}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Board number indicator */}
        <div className="text-center text-sm mt-3 mb-2">
          Board {currentSlide + 1} of {numBoards}
        </div>

        {/* Pagination indicators */}
        <div className="flex justify-center mt-2 space-x-2">
          {Array.from({ length: numBoards }, (_, i) => (
            <button
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                currentSlide === i ? "bg-primary" : "bg-muted"
              }`}
              onClick={() => scrollTo(i)}
              aria-label={`Go to board ${i + 1}`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-center w-full mt-4 gap-2">
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={currentSlide === 0}
            className={`rounded-full flex items-center justify-center w-8 h-8 border ${
              currentSlide === 0
                ? "text-muted-foreground border-muted"
                : "border-border"
            }`}
            aria-label="Previous board"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={currentSlide === numBoards - 1}
            className={`rounded-full flex items-center justify-center w-8 h-8 border ${
              currentSlide === numBoards - 1
                ? "text-muted-foreground border-muted"
                : "border-border"
            }`}
            aria-label="Next board"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Desktop grid view
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
