import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import BottomNavigation from "@/components/bottom-navigation";
import SymptomButton from "@/components/symptom-button";
import IntelligentSymptomSearch from "@/components/intelligent-symptom-search";
import { useAuth } from "@/hooks/useAuth";
import type { Symptom, SearchHistory } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const { data: commonSymptoms = [] } = useQuery<Symptom[]>({
    queryKey: ["/api/symptoms/common"],
  });

  const { data: searchHistory = [] } = useQuery<SearchHistory[]>({
    queryKey: ["/api/search/history"],
    enabled: !!user,
  });

  const handleSymptomSearch = (symptoms: string[]) => {
    const searchParams = new URLSearchParams({
      symptoms: symptoms.join(',')
    });
    setLocation(`/results?${searchParams.toString()}`);
  };



  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative pb-20">
      {/* Header */}
      <header className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900" data-testid="text-app-title">
              AltMed
            </h1>
            <p className="text-gray-600 text-sm">Find alternative medications</p>
          </div>
          <Button 
            size="sm" 
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"
            variant="ghost"
            data-testid="button-add"
          >
            <Plus className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
        
        {/* Intelligent Symptom Search */}
        <IntelligentSymptomSearch
          onSymptomSelect={handleSymptomSearch}
          placeholder="Enter your symptoms"
        />
      </header>

      {/* Main Content */}
      <main className="px-6 py-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6" data-testid="text-common-symptoms-title">
          Common symptoms
        </h2>
        
        {/* Common Symptoms Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {commonSymptoms.map((symptom) => (
            <SymptomButton
              key={symptom.id}
              symptom={symptom}
              onClick={() => handleSymptomSearch([symptom.name])}
            />
          ))}
        </div>

        {/* Recent Searches */}
        {searchHistory.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="text-recent-searches-title">
              Recent searches
            </h3>
            <div className="space-y-3">
              {searchHistory.slice(0, 3).map((search) => (
                <Card 
                  key={search.id} 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleSymptomSearch([search.searchQuery])}
                  data-testid={`card-recent-search-${search.id}`}
                >
                  <CardContent className="p-3">
                    <span className="text-gray-800 font-medium">{search.searchQuery}</span>
                    <span className="text-gray-500 text-sm block">
                      {search.createdAt ? new Date(search.createdAt).toLocaleDateString() : ''}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNavigation currentPage="search" />
    </div>
  );
}
