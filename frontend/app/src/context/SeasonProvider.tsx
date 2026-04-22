import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import type { Temporada } from "../types";
import { seasonAPI } from "../services/season.service";
import { useAuth } from "../hooks/useAuth";
import { SeasonContext } from "./SeasonContext";

export const SeasonProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [seasons, setSeasons] = useState<Temporada[]>([]);
  const [currentSeason, setCurrentSeasonState] = useState<Temporada | null>(null);
  const [isLoadingSeasons, setIsLoadingSeasons] = useState<boolean>(true);

  const fetchSeasons = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingSeasons(true);
    try {
      const data = await seasonAPI.getTemporadas();
      setSeasons(data);

      if (data.length > 0) {
        // Find the active season first
        const activeSeason = data.find(s => s.activa);

        // Restore from localStorage only if the stored season exists in data
        const storedSeasonId = localStorage.getItem("selectedSeasonId");
        if (storedSeasonId) {
          const found = data.find(s => s.id === parseInt(storedSeasonId));
          if (found) {
            setCurrentSeasonState(found);
            setIsLoadingSeasons(false);
            return;
          }
        }

        // Default: use active season, fallback to last
        setCurrentSeasonState(activeSeason ?? data[data.length - 1]);
      }
    } catch (error) {
      console.error("Error cargando temporadas:", error);
    } finally {
      setIsLoadingSeasons(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSeasons();
  }, [fetchSeasons]);

  const setCurrentSeason = (season: Temporada) => {
    setCurrentSeasonState(season);
    localStorage.setItem("selectedSeasonId", season.id.toString());
  };

  const refreshSeasons = async () => {
    await fetchSeasons();
  };

  return (
    <SeasonContext.Provider
      value={{
        seasons,
        currentSeason,
        isLoadingSeasons,
        setCurrentSeason,
        refreshSeasons,
      }}
    >
      {children}
    </SeasonContext.Provider>
  );
};
