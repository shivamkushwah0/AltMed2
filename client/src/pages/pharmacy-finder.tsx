import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PharmacyCard from "@/components/pharmacy-card";
import { useToast } from "@/hooks/use-toast";
import type { PharmacyWithStock } from "@shared/schema";

export default function PharmacyFinder() {
  const [, setLocation] = useLocation();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const { toast } = useToast();

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Geolocation error:", error);
          setLocationError("Unable to get your location. Using default location.");
          // Default to San Francisco coordinates
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }
  }, []);

  const { data: pharmacies = [], isLoading } = useQuery<PharmacyWithStock[]>({
    queryKey: ["/api/pharmacies/nearby", userLocation?.lat, userLocation?.lng],
    enabled: !!userLocation,
  });

  const handleGoBack = () => {
    setLocation("/");
  };

  // Show location error toast
  useEffect(() => {
    if (locationError) {
      toast({
        title: "Location Access",
        description: locationError,
        variant: "default",
      });
    }
  }, [locationError, toast]);

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white px-6 py-4 border-b border-gray-100">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGoBack} 
            className="p-2 mr-4"
            data-testid="button-back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900" data-testid="text-page-title">
            Find Nearby Pharmacies
          </h1>
        </div>
      </header>

      <main>
        {/* Map Container */}
        <div className="h-64 bg-blue-100 relative overflow-hidden">
          {/* Placeholder map - in a real app, you'd integrate with Google Maps or similar */}
          <div className="w-full h-full bg-gradient-to-br from-blue-200 to-blue-300 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <p className="text-blue-800 font-medium">Interactive Map</p>
              <p className="text-blue-700 text-sm">
                {userLocation 
                  ? `Showing pharmacies near ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
                  : "Getting your location..."
                }
              </p>
            </div>
          </div>
          
          {/* Current Location Marker */}
          {userLocation && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-primary rounded-full border-4 border-white shadow-lg">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>

        {/* Pharmacy List */}
        <div className="px-6 py-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6" data-testid="text-pharmacies-title">
            Pharmacies Near You
          </h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : pharmacies.length > 0 ? (
            <div className="space-y-4">
              {pharmacies.map((pharmacy: any) => (
                <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No Pharmacies Found</h3>
                <p className="text-gray-600 text-sm">
                  We couldn't find any pharmacies in your area. Try expanding your search radius or check your location settings.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
