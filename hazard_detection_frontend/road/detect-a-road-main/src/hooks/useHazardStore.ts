import { useState, useEffect } from 'react';

export interface HazardPoint {
  lat: number;
  lon: number;
  timestamp: string;
  type: 'video' | 'live';
}

const STORAGE_KEY = 'hazard_detections';

export const useHazardStore = () => {
  const [hazards, setHazards] = useState<HazardPoint[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setHazards(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading hazard data:', e);
      }
    }
  }, []);

  const addHazard = (hazard: HazardPoint) => {
    const updated = [...hazards, hazard];
    setHazards(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearHazards = () => {
    setHazards([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { hazards, addHazard, clearHazards };
};
