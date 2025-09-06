// src/contexts/PocketBaseContext.jsx
import React, { createContext } from "react";
import { pb } from "../lib/pocketbase";

// Creamos el contexto
export const PBContext = createContext({ pb });

// Creamos el provider
export function PBProvider({ children }) {
  return (
    <PBContext.Provider value={{ pb }}>
      {children}
    </PBContext.Provider>
  );
}
