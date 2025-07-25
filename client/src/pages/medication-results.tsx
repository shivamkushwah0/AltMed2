import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MedicationCard from "@/components/medication-card";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import type { Symptom, MedicationWithDetails } from "@shared/schema";

interface SearchResults {
  symptoms: Symptom[];
  medications: MedicationWithDetails[];
  aiAnalysis: {
    symptomAnalysis: string;
    warnings: string[];
    additionalAdvice: string;
  };
}

export default function MedicationResults() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/results");
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const searchMutation = useMutation<SearchResults, Error, string[]>({
    mutationFn: async (symptoms: string[]) => {
      const response = await apiRequest("POST", "/api/search/symptoms", {
        symptoms,
        userId: user?.id || null,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data);
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: "Failed to search for medications. Please try again.",
        variant: "destructive",
      });
      console.error("Search error:", error);
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const symptomsParam = urlParams.get('symptoms');
    
    if (symptomsParam) {
      const symptoms = symptomsParam.split(',').map(s => s.trim()).filter(Boolean);
      if (symptoms.length > 0) {
        searchMutation.mutate(symptoms);
      }
    }
  }, []);

  const handleGoBack = () => {
    setLocation('/');
  };

  if (searchMutation.isPending) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="bg-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="p-2 mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <Skeleton className="h-6 w-24" />
          </div>
        </header>
        <main className="px-6 py-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!searchResults) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen">
        <header className="bg-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="p-2 mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Search Results</h1>
          </div>
        </header>
        <main className="px-6 py-6">
          <p className="text-gray-600">No results found. Please try a different search.</p>
        </main>
      </div>
    );
  }

  const prescriptionMeds = searchResults.medications.filter((med: any) => med.category === 'prescription');
  const otcMeds = searchResults.medications.filter((med: any) => med.category === 'otc');

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
          <h1 className="text-xl font-semibold text-gray-900" data-testid="text-search-results-title">
            {searchResults.symptoms.map(s => s.name).join(', ')}
          </h1>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* AI Analysis */}
        {searchResults.aiAnalysis && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-900">AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-blue-800 text-sm">{searchResults.aiAnalysis.symptomAnalysis}</p>
              
              {searchResults.aiAnalysis.warnings.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Important Warnings:</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {searchResults.aiAnalysis.warnings.map((warning, index) => (
                      <li key={index} className="text-blue-800 text-sm">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-blue-900 mb-2">Additional Advice:</h4>
                <p className="text-blue-800 text-sm">{searchResults.aiAnalysis.additionalAdvice}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Prescription Medications */}
        {prescriptionMeds.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4" data-testid="text-prescription-meds-title">
              Prescription Medications
            </h2>
            <div className="space-y-4">
              {prescriptionMeds.map((medication: any) => (
                <Card key={medication.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 mt-1">
                        <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{medication.brandName}</h3>
                        <p className="text-gray-600 text-sm mt-1">{medication.description}</p>
                        {medication.aiReasoning && (
                          <p className="text-primary text-sm mt-2">
                            <strong>AI Recommendation:</strong> {medication.aiReasoning}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* OTC Alternatives */}
        {otcMeds.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <span className="text-secondary">OTC Alternatives</span>
            </h2>
            <div className="space-y-4">
              {otcMeds.map((medication: any) => (
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
                />
              ))}
            </div>
          </section>
        )}

        {searchResults.medications.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No medications found for the specified symptoms. Please try different search terms or consult a healthcare professional.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
