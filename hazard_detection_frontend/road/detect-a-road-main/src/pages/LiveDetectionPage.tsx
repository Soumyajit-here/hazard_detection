import api from "@/services/api";  // use @ alias
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Camera, StopCircle, Play, ArrowLeft, Map, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useHazardStore } from '@/hooks/useHazardStore';
import { toast } from '@/hooks/use-toast';

const LiveDetectionPage = () => {
  const navigate = useNavigate();
  const webcamRef = useRef<Webcam>(null);
  const { coordinates } = useGeoLocation();
  const { addHazard } = useHazardStore();

  const [isDetecting, setIsDetecting] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedFrame, setCapturedFrame] = useState<string | null>(null);

  const handleStartDetection = () => {
    if (!coordinates) {
      toast({
        title: "Location Required",
        description: "Please enable location services to use live detection",
        variant: "destructive",
      });
      return;
    }

    setIsDetecting(true);
    setIsCameraActive(true);
    toast({
      title: "Live Detection Started",
      description: "Monitoring for road hazards...",
    });
  };

  const handleCaptureFrame = () => {
    if (webcamRef.current && coordinates) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedFrame(imageSrc);
        
        // Save hazard detection
        addHazard({
          lat: coordinates.lat,
          lon: coordinates.lon,
          timestamp: new Date().toISOString(),
          type: 'live',
        });

        toast({
          title: "Hazard Detected",
          description: "Frame captured and location saved",
        });

        // Simulate detection overlay for demo purposes
        setTimeout(() => {
          setCapturedFrame(null);
        }, 3000);
      }
    }

    /* Future backend integration placeholder:
    
    const sendFrameToBackend = async (imageData: string) => {
      try {
        const blob = await fetch(imageData).then(r => r.blob());
        const formData = new FormData();
        formData.append('frame', blob, 'frame.jpg');
        formData.append('lat', coordinates.lat.toString());
        formData.append('lon', coordinates.lon.toString());
        
        const response = await axios.post(
          'https://hazard-api.onrender.com/detect-live',
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        // Handle detection results
        console.log(response.data);
      } catch (error) {
        console.error('Frame detection error:', error);
      }
    };
    */
  };

  const handleStopFeed = () => {
    setIsDetecting(false);
    setIsCameraActive(false);
    toast({
      title: "Detection Stopped",
      description: "Camera feed closed",
    });
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
                <h1 className="text-2xl font-bold text-foreground">Live Detection</h1>
                <p className="text-sm text-muted-foreground">Real-time camera monitoring</p>
              </div>
            </div>
            <Button onClick={() => navigate('/map')} variant="outline" className="gap-2">
              <Map className="h-4 w-4" />
              View Map
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>Live Camera Feed</CardTitle>
            <CardDescription>
              Real-time hazard detection using your device camera
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Camera Feed */}
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-border">
              {isCameraActive ? (
                <>
                  <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{
                      width: 1280,
                      height: 720,
                      facingMode: 'environment'
                    }}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Detection Overlay */}
                  {isDetecting && (
                    <div className="absolute top-4 left-4 right-4 bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
                      <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                      <span className="font-semibold">Detecting hazards...</span>
                    </div>
                  )}

                  {/* Simulated Detection Box (for demo) */}
                  {capturedFrame && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-4 border-warning w-1/2 h-1/3 rounded-lg animate-pulse">
                        <div className="bg-warning/90 text-warning-foreground px-2 py-1 text-xs font-bold">
                          Pothole Detected
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Crosshair overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Crosshair className="h-12 w-12 text-primary/30" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Camera feed inactive - Start detection to begin
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {!isCameraActive ? (
                <Button
                  onClick={handleStartDetection}
                  disabled={!coordinates}
                  size="lg"
                  className="gap-2 sm:col-span-3"
                >
                  <Play className="h-5 w-5" />
                  Start Live Detection
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleCaptureFrame}
                    disabled={!isDetecting}
                    variant="default"
                    size="lg"
                    className="gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    Capture Frame
                  </Button>
                  
                  <Button
                    onClick={handleStopFeed}
                    variant="destructive"
                    size="lg"
                    className="gap-2 sm:col-span-2"
                  >
                    <StopCircle className="h-5 w-5" />
                    Stop Feed
                  </Button>
                </>
              )}
            </div>

            {/* Info Box */}
            <div className="bg-secondary/50 rounded-lg p-4 text-sm space-y-2">
              <p className="font-semibold text-secondary-foreground">How it works:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Click "Start Live Detection" to activate your camera</li>
                <li>Point your camera at the road ahead while driving/walking</li>
                <li>Click "Capture Frame" to save detected hazards to the map</li>
                <li>Hazard locations are automatically logged with GPS coordinates</li>
              </ul>
            </div>

            {/* Location Status */}
            {coordinates && (
              <p className="text-xs text-muted-foreground text-center">
                📍 Current location: {coordinates.lat.toFixed(4)}, {coordinates.lon.toFixed(4)}
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default LiveDetectionPage;
