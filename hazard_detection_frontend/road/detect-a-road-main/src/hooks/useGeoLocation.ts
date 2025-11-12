import { useState, useEffect } from 'react';

interface Coordinates {
  lat: number;
  lon: number;
}

export const useGeoLocation = () => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoordinates({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        // Set default coordinates if permission denied
        setCoordinates({ lat: 40.7128, lon: -74.0060 }); // Default to NYC
      }
    );
  }, []);

  return { coordinates, error, loading };
};
