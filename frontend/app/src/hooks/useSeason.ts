import { useContext } from "react";
import { SeasonContext } from "../context/SeasonContext";

export const useSeason = () => {
  const context = useContext(SeasonContext);
  if (context === undefined) {
    throw new Error("useSeason debe ser usado dentro de un SeasonProvider");
  }
  return context;
};
