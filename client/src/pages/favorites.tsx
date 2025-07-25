import { useQuery } from "@tanstack/react-query";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import MedicationCard from "@/components/medication-card";
import BottomNavigation from "@/components/bottom-navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import type { MedicationWithDetails } from "@shared/schema";

export default function Favorites() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const { data: favorites = [], isLoading } = useQuery<MedicationWithDetails[]>({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  const handleGoBack = () => {
    setLocation('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen relative pb-20">
        <header className="bg-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="p-2 mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Favorites</h1>
          </div>
        </header>
        <main className="px-6 py-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Sign In Required</h3>
              <p className="text-gray-600 text-sm mb-4">
                Please sign in to view your favorite medications.
              </p>
              <Button onClick={() => window.location.href = '/api/login'}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </main>
        <BottomNavigation currentPage="favorites" />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative pb-20">
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
            Favorites
          </h1>
        </div>
      </header>

      <main className="px-6 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="space-y-4">
            {favorites.map((medication) => (
              <MedicationCard
                key={medication.id}
                medication={medication}
                onCompare={() => {
                  const searchParams = new URLSearchParams({
                    med1: medication.id,
                  });
                  setLocation(`/compare?${searchParams.toString()}`);
                }}
                onViewDetails={() => setLocation(`/medication/${medication.id}`)}
                showFavoriteButton={false}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2" data-testid="text-empty-title">
                No Favorites Yet
              </h3>
              <p className="text-gray-600 text-sm" data-testid="text-empty-description">
                Start exploring medications and save your favorites for quick access.
              </p>
              <Button 
                className="mt-4" 
                onClick={() => setLocation('/')}
                data-testid="button-explore"
              >
                Explore Medications
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <BottomNavigation currentPage="favorites" />
    </div>
  );
}
