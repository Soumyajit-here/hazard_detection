  // use @ alias
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { ArrowLeft, Trash2, Camera, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useHazardStore } from '@/hooks/useHazardStore';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import type { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when coordinates change
function MapRecenter({ center }: { center: LatLngExpression }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center as L.LatLngExpression, map.getZoom());
  }, [center, map]);
  return null;
}

const MapDashboardPage = () => {
  const navigate = useNavigate();
  const { hazards, clearHazards } = useHazardStore();
  const { coordinates } = useGeoLocation();
  const [mapCenter, setMapCenter] = useState<LatLngExpression>([40.7128, -74.0060]);

  useEffect(() => {
    if (coordinates) {
      setMapCenter([coordinates.lat, coordinates.lon]);
    }
  }, [coordinates]);

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all hazard markers?')) {
      clearHazards();
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/detect')}
                variant="ghost"
                size="icon"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Hazard Map</h1>
                <p className="text-sm text-muted-foreground">
                  {hazards.length} hazard{hazards.length !== 1 ? 's' : ''} detected
                </p>
              </div>
            </div>
            {hazards.length > 0 && (
              <Button
                onClick={handleClearAll}
                variant="destructive"
                className="gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Detection Locations</CardTitle>
              <CardDescription>
                Interactive map showing all detected hazards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg overflow-hidden border-2 border-border" style={{ height: '60vh', minHeight: '500px' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  scrollWheelZoom={true}
                  style={{ height: '100%', width: '100%' }}
                >
                  <>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapRecenter center={mapCenter} />
                    
                    {hazards.map((hazard, index) => (
                      <Marker
                        key={`${hazard.timestamp}-${index}`}
                        position={[hazard.lat, hazard.lon] as LatLngExpression}
                      >
                        <Popup>
                          <div className="text-sm space-y-2">
                            <div className="font-bold text-base flex items-center gap-2">
                              {hazard.type === 'video' ? (
                                <Video className="h-4 w-4 text-primary" />
                              ) : (
                                <Camera className="h-4 w-4 text-primary" />
                              )}
                              📍 Hazard Detected
                            </div>
                            <div>
                              <span className="font-semibold">Type:</span>{' '}
                              {hazard.type === 'video' ? 'Video Upload' : 'Live Capture'}
                            </div>
                            <div>
                              <span className="font-semibold">Time:</span>{' '}
                              {formatDate(hazard.timestamp)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Coordinates: {hazard.lat.toFixed(6)}, {hazard.lon.toFixed(6)}
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </>
                </MapContainer>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar with hazard list */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Recent Detections</CardTitle>
              <CardDescription>
                Latest hazard recordings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hazards.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hazards detected yet</p>
                  <Button
                    onClick={() => navigate('/detect')}
                    variant="outline"
                    className="mt-4"
                  >
                    Start Detection
                  </Button>
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(60vh-2rem)] overflow-y-auto">
                  {[...hazards].reverse().map((hazard, index) => (
                    <div
                      key={`${hazard.timestamp}-${index}`}
                      className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {hazard.type === 'video' ? (
                            <Video className="h-5 w-5 text-primary" />
                          ) : (
                            <Camera className="h-5 w-5 text-accent" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="font-semibold text-sm">
                            {hazard.type === 'video' ? 'Video Detection' : 'Live Capture'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(hazard.timestamp)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            📍 {hazard.lat.toFixed(4)}, {hazard.lon.toFixed(4)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">{hazards.length}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Hazards</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {hazards.filter(h => h.type === 'video').length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Video Detections</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">
                  {hazards.filter(h => h.type === 'live').length}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Live Captures</div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-success">
                  {hazards.length > 0 ? '✓' : '—'}
                </div>
                <div className="text-sm text-muted-foreground mt-1">Active Monitoring</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MapDashboardPage;
