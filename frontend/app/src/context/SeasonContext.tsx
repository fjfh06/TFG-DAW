import { createContext } from "react";
import type { Temporada } from "../types";


interface SeasonContextType {
  seasons: Temporada[];
  currentSeason: Temporada | null;
  isLoadingSeasons: boolean;
  setCurrentSeason: (season: Temporada) => void;
  refreshSeasons: () => Promise<void>;
}

export const SeasonContext = createContext<SeasonContextType | undefined>(undefined);


