import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function MedicationDetail() {
  const [, params] = useRoute("/medication/:id");
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: medication, isLoading } = useQuery({
    queryKey: ["/api/medications", params?.id],
    enabled: !!params?.id,
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["/api/favorites"],
    enabled: isAuthenticated,
  });

  const isFavorite = favorites.some((fav: any) => fav.id === params?.id);

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (isFavorite) {
        await apiRequest("DELETE", `/api/favorites/${params?.id}`);
      } else {
        await apiRequest("POST", "/api/favorites", { medicationId: params?.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite 
          ? "Medication removed from your favorites" 
          : "Medication added to your favorites",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGoBack = () => {
    setLocation(-1);
  };

  const handleFindPharmacies = () => {
    const searchParams = new URLSearchParams({
      medication: params?.id || '',
    });
    setLocation(`/pharmacies?${searchParams.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="bg-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="p-2 mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <Skeleton className="h-6 w-32" />
          </div>
        </header>
        <main className="px-6 py-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!medication) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="bg-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="p-2 mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Medication Info</h1>
          </div>
        </header>
        <main className="px-6 py-6">
          <p className="text-gray-600">Medication not found.</p>
        </main>
      </div>
    );
  }

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
            Medication Info
          </h1>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* Medication Title */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900" data-testid="text-medication-name">
              {medication.brandName}
            </h2>
            <Badge 
              variant={medication.category === 'otc' ? 'secondary' : 'default'}
              data-testid="badge-medication-category"
            >
              {medication.category === 'otc' ? 'OTC' : 'Prescription'}
            </Badge>
          </div>
          <p className="text-gray-600" data-testid="text-generic-name">
            {medication.genericName}
          </p>
        </div>

        {/* Uses */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid="text-uses-title">
            Uses
          </h3>
          <p className="text-gray-700 leading-relaxed" data-testid="text-uses-content">
            {medication.uses}
          </p>
        </section>

        {/* Dosage */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid="text-dosage-title">
            Dosage
          </h3>
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <p className="text-gray-800" data-testid="text-dosage-content">
                {medication.dosage}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Precautions */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid="text-precautions-title">
            Precautions
          </h3>
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <p className="text-gray-800" data-testid="text-precautions-content">
                {medication.precautions}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Interactions */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-4" data-testid="text-interactions-title">
            Interactions
          </h3>
          <p className="text-gray-700" data-testid="text-interactions-content">
            {medication.interactions}
          </p>
        </section>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <Button 
            className="flex-1 bg-primary text-white py-3 hover:bg-primary/90"
            onClick={handleFindPharmacies}
            data-testid="button-find-pharmacies"
          >
            <MapPin className="w-4 h-4 mr-2" />
            Find Pharmacies
          </Button>
          
          {isAuthenticated && (
            <Button 
              variant="outline"
              className="flex-1 py-3"
              onClick={() => favoriteMutation.mutate()}
              disabled={favoriteMutation.isPending}
              data-testid="button-toggle-favorite"
            >
              <Heart 
                className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} 
              />
              {isFavorite ? 'Saved' : 'Save'}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
