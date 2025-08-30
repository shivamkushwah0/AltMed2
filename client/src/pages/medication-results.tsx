import { useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MedicationCard from "@/components/medication-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

import type { Symptom, MedicationWithDetails } from "@shared/schema";

interface AiAnalysisResponse {
  searchedSymptoms: string[];
  symptomCount: number;
  aiAnalysis: {
    symptomAnalysis: string;
    warnings: string[];
    additionalAdvice: string;
  };
  aiRecommendations: {
    medicationId: string;
    reasoning: string;
    effectiveness: number;
    priority: number;
  }[];
}

interface MedicationsResponse {
  symptoms: Symptom[];
  medications: MedicationWithDetails[];
  searchedSymptoms: string[];
  symptomCount: number;
}

export default function MedicationResults() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/results");
  const [searchedSymptoms, setSearchedSymptoms] = useState<string[]>([]);
  const [symptomCount, setSymptomCount] = useState<number>(0);
  const [symptomsList, setSymptomsList] = useState<Symptom[]>([]);
  const [medications, setMedications] = useState<MedicationWithDetails[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AiAnalysisResponse["aiAnalysis"] | null>(null);
  const [aiRecs, setAiRecs] = useState<AiAnalysisResponse["aiRecommendations"]>([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const [firstCompareMedId, setFirstCompareMedId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const medicationsMutation = useMutation<MedicationsResponse, Error, string[]>({
    mutationFn: async (symptoms: string[]) => {
      const response = await apiRequest("POST", "/api/search/symptoms/medications", {
        symptoms,
        userId: user?.id || null,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setSymptomsList(data.symptoms);
      setMedications(enrichAndSortWithAi(data.medications, aiRecs));
      setSearchedSymptoms(data.searchedSymptoms);
      setSymptomCount(data.symptomCount);
    },
    onError: (error) => {
      toast({
        title: "Loading medications failed",
        description: "Could not fetch medications. Please try again.",
        variant: "destructive",
      });
      console.error("Medications search error:", error);
    },
  });

  const aiMutation = useMutation<AiAnalysisResponse, Error, string[]>({
    mutationFn: async (symptoms: string[]) => {
      const response = await apiRequest("POST", "/api/search/symptoms/ai", {
        symptoms,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setAiAnalysis(data.aiAnalysis);
      setAiRecs(data.aiRecommendations);
      // if medications already loaded, enrich and resort
      setMedications((prev) => enrichAndSortWithAi(prev, data.aiRecommendations));
      // also set searched symptoms if not set by meds yet (e.g., meds 404)
      if (searchedSymptoms.length === 0) {
        setSearchedSymptoms(data.searchedSymptoms);
        setSymptomCount(data.symptomCount);
      }
    },
    onError: (error) => {
      toast({
        title: "AI Overview failed",
        description: "Could not generate AI analysis. You can still view medications.",
        variant: "destructive",
      });
      console.error("AI analysis error:", error);
    },
  });

  function enrichAndSortWithAi(
    meds: MedicationWithDetails[],
    recs: AiAnalysisResponse["aiRecommendations"],
  ): (MedicationWithDetails & { aiPriority?: number; aiEffectiveness?: number; aiReasoning?: string })[] {
    if (!recs || recs.length === 0) return meds;
    const map = new Map(recs.map((r) => [r.medicationId, r]));
    const enriched = meds.map((m) => {
      const r = map.get(m.id);
      return {
        ...m,
        aiPriority: r?.priority || 0,
        aiEffectiveness: r?.effectiveness || 0,
        aiReasoning: r?.reasoning || "",
      };
    });
    return enriched.sort((a, b) => (b.aiPriority || 0) - (a.aiPriority || 0));
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const symptomsParam = urlParams.get('symptoms');
    
    if (symptomsParam) {
      const symptoms = symptomsParam.split(',').map(s => s.trim()).filter(Boolean);
      if (symptoms.length > 0) {
        medicationsMutation.mutate(symptoms);
        aiMutation.mutate(symptoms);
      }
    }
  }, []);

  const handleGoBack = () => {
    setLocation('/');
  };

  const isLoadingMeds = medicationsMutation.isPending;
  const isLoadingAi = aiMutation.isPending;

  if (isLoadingMeds && isLoadingAi && medications.length === 0 && !aiAnalysis) {
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
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm text-gray-600">AI Overview</div>
              <Skeleton className="h-24 w-full" />
            </div>
            <div>
              <div className="mb-2 text-sm text-gray-600">Loading medications</div>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (medications.length === 0 && !aiAnalysis && !(isLoadingMeds || isLoadingAi)) {
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

  const prescriptionMeds = medications.filter((med: any) => med.category === 'prescription');
  const otcMeds = medications.filter((med: any) => med.category === 'otc');

  const openCompareFor = (medId: string) => {
    setFirstCompareMedId(medId);
    setCompareOpen(true);
  };

  const handleSelectSecondMed = (secondId: string) => {
    if (!firstCompareMedId) return;
    const params = new URLSearchParams({ med1: firstCompareMedId, med2: secondId });
    setCompareOpen(false);
    setLocation(`/compare?${params.toString()}`);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="bg-white px-6 py-4 border-b border-gray-100">
        <div className="flex items-center mb-4">
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
            Search Results
          </h1>
        </div>
        
        {/* Display searched symptoms */}
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Searched for {symptomCount} symptom{symptomCount !== 1 ? 's' : ''}:
          </p>
          <div className="flex flex-wrap gap-2">
            {searchedSymptoms.map((symptom, index) => (
              <Badge key={index} variant="secondary" className="text-sm">
                {symptom}
              </Badge>
            ))}
          </div>
        </div>
      </header>

      <main className="px-6 py-6 space-y-6">
        {/* AI Analysis */}
        <section>
          <div className="mb-2 text-sm text-gray-600">AI Overview</div>
          {isLoadingAi && !aiAnalysis && (
            <Skeleton className="h-24 w-full" />
          )}
          {!isLoadingAi && aiAnalysis && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-blue-900">AI Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-blue-800 text-sm">{aiAnalysis.symptomAnalysis}</p>
                {aiAnalysis.warnings.length > 0 && (
                  <div>
                    <h4 className="font-medium text-blue-900 mb-2">Important Warnings:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {aiAnalysis.warnings.map((warning, index) => (
                        <li key={index} className="text-blue-800 text-sm">{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">Additional Advice:</h4>
                  <p className="text-blue-800 text-sm">{aiAnalysis.additionalAdvice}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Prescription Medications */}
        <section>
          <div className="mb-2 text-sm text-gray-600">{isLoadingMeds ? 'Loading medications' : 'Prescription Medications'}</div>
          {isLoadingMeds && medications.length === 0 ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : (
            prescriptionMeds.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4" data-testid="text-prescription-meds-title">
                  Prescription Medications
                </h2>
                <div className="space-y-4">
                  {prescriptionMeds.map((medication: any) => (
                    <MedicationCard
                      key={medication.id}
                      medication={medication}
                      onCompare={() => openCompareFor(medication.id)}
                      onViewDetails={() => setLocation(`/medication/${medication.id}`)}
                    />
                  ))}
                </div>
              </section>
            )
          )}
        </section>

        {/* OTC Alternatives */}
        {!isLoadingMeds && otcMeds.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              <span className="text-secondary">OTC Alternatives</span>
            </h2>
            <div className="space-y-4">
              {otcMeds.map((medication: any) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication}
                  onCompare={() => openCompareFor(medication.id)}
                  onViewDetails={() => setLocation(`/medication/${medication.id}`)}
                />
              ))}
            </div>
          </section>
        )}

        {!isLoadingMeds && medications.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600">
              No medications found for the specified symptoms. Please try different search terms or consult a healthcare professional.
            </p>
          </div>
        )}
      </main>

      {/* Compare Selection Dialog */}
      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select a medicine to compare</DialogTitle>
          </DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {medications
              .filter((m) => m.id !== firstCompareMedId)
              .map((m) => (
                <button
                  key={m.id}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  onClick={() => handleSelectSecondMed(m.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{m.brandName}</div>
                      {m.genericName && (
                        <div className="text-sm text-gray-500">{m.genericName}</div>
                      )}
                    </div>
                    <Badge variant={m.category === 'otc' ? 'secondary' : 'default'} className="text-xs">
                      {m.category === 'otc' ? 'OTC' : 'Rx'}
                    </Badge>
                  </div>
                </button>
              ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button variant="outline" onClick={() => setCompareOpen(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
