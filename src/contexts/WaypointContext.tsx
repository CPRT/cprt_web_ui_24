'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LatLngTuple = [number, number];

interface WaypointContextType {
  waypoints: LatLngTuple[];
  addWaypoint: (wp: LatLngTuple) => void;
  removeWaypoint: (index: number) => void;
  clearWaypoints: () => void;
}

const WaypointContext = createContext<WaypointContextType | undefined>(undefined);

export const WaypointProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [waypoints, setWaypoints] = useState<LatLngTuple[]>([]);

  const addWaypoint = (wp: LatLngTuple) =>
    setWaypoints((prev) => [...prev, wp]);

  const removeWaypoint = (index: number) =>
    setWaypoints((prev) => prev.filter((_, i) => i !== index));

  const clearWaypoints = () => setWaypoints([]);

  return (
    <WaypointContext.Provider
      value={{ waypoints, addWaypoint, removeWaypoint, clearWaypoints }}
    >
      {children}
    </WaypointContext.Provider>
  );
};

export const useWaypoints = (): WaypointContextType => {
  const context = useContext(WaypointContext);
  if (!context) {
    throw new Error('useWaypoints must be used within a WaypointProvider');
  }
  return context;
};

