import api from "@/services/api"; // use @ alias
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, Map, Loader2, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGeoLocation } from '@/hooks/useGeoLocation';
import { useHazardStore } from '@/hooks/useHazardStore';
import { toast } from '@/hooks/use-toast';

const DetectionPage = () => {
  const navigate = useNavigate();
  const { coordinates } = useGeoLocation();
  const { addHazard } = useHazardStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [processedVideo, setProcessedVideo] = useState<string | null>(null);
  const [detectionComplete, setDetectionComplete] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setProcessedVideo(null);
      setDetectionComplete(false);
    }
  };

  const handleDetect = async () => {
    if (!selectedFile || !coordinates) {
      toast({
        title: "Error",
        description: "Please select a video file and enable location services",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setDetectionComplete(false);

    try {
      // Prepare FormData
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('lat', coordinates.lat.toString());
      formData.append('lon', coordinates.lon.toString());

      // Upload video to backend
      const videoBlob = await api.uploadVideo(formData);
      const videoURL = URL.createObjectURL(videoBlob);
      setProcessedVideo(videoURL);
      setDetectionComplete(true);

      addHazard({
        lat: coordinates.lat,
        lon: coordinates.lon,
        timestamp: new Date().toISOString(),
        type: 'video',
      });

      toast({
        title: "Detection Complete",
        description: "Hazards detected and plates blurred successfully",
      });
    } catch (error) {
      console.error("Backend API error:", error);
      toast({
        title: "Backend Unavailable",
        description: "Could not reach backend. Please ensure it is running.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (processedVideo) {
      const a = document.createElement('a');
      a.href = processedVideo;
      a.download = 'processed_video.mp4';
      a.click();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hazard Detection System</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Road Safety Analysis</p>
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
            <CardTitle>Detection Options</CardTitle>
            <CardDescription>
              Upload a road video for analysis or use live camera feed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Video
                </TabsTrigger>
                <TabsTrigger value="live" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Live Camera
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-4">
                  {/* File Input */}
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg p-12 hover:border-primary transition-colors">
                    <Upload className="h-12 w-12 text-muted-foreground mb-4" />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>Select Video File</span>
                      </Button>
                      <input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                    {selectedFile && (
                      <p className="mt-4 text-sm text-muted-foreground">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>

                  {/* Detect Button */}
                  <Button
                    onClick={handleDetect}
                    disabled={!selectedFile || processing || !coordinates}
                    className="w-full gap-2"
                    size="lg"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing video...
                      </>
                    ) : (
                      <>
                        <Camera className="h-5 w-5" />
                        Detect Hazards
                      </>
                    )}
                  </Button>

                  {/* Result Section */}
                  {detectionComplete && processedVideo && (
                    <div className="space-y-4 mt-6">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-semibold">
                          ✅ Detection Complete – Hazards detected and plates blurred
                        </span>
                      </div>

                      <video
                        src={processedVideo}
                        controls
                        className="w-full rounded-lg border"
                      />

                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="w-full gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Result
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="live" className="space-y-4">
                <div className="text-center py-12">
                  <Camera className="h-16 w-16 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Live Detection Mode</h3>
                  <p className="text-muted-foreground mb-6">
                    Access real-time camera feed with continuous hazard detection
                  </p>
                  <Button
                    onClick={() => navigate('/live')}
                    size="lg"
                    className="gap-2"
                  >
                    <Camera className="h-5 w-5" />
                    Go to Live Detection Page
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Location Status */}
        {coordinates && (
          <div className="max-w-4xl mx-auto mt-4">
            <p className="text-xs text-muted-foreground text-center">
              📍 Location enabled: {coordinates.lat.toFixed(4)}, {coordinates.lon.toFixed(4)}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DetectionPage;
