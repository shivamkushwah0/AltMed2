import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ComparisonData {
  medication1: any;
  medication2: any;
  comparison: {
    category: string;
    medication1Value: string;
    medication2Value: string;
  }[];
  summary: string;
}

export default function Comparison() {
  const [, setLocation] = useLocation();
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const { toast } = useToast();

  const compareMutation = useMutation({
    mutationFn: async ({ med1, med2 }: { med1: string; med2: string }) => {
      const response = await apiRequest("POST", "/api/medications/compare", {
        medication1Id: med1,
        medication2Id: med2,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setComparisonData(data);
    },
    onError: (error) => {
      toast({
        title: "Comparison Failed",
        description: "Failed to compare medications. Please try again.",
        variant: "destructive",
      });
      console.error("Comparison error:", error);
    },
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const med1 = urlParams.get('med1');
    const med2 = urlParams.get('med2');
    
    if (med1 && med2) {
      compareMutation.mutate({ med1, med2 });
    } else if (med1 && !med2) {
      // If only one medication is provided, we need to let user select the second one
      // For now, we'll show an error
      toast({
        title: "Missing Medication",
        description: "Please select a second medication to compare.",
        variant: "destructive",
      });
    }
  }, []);

  const handleGoBack = () => {
    setLocation("/");
  };

  if (compareMutation.isPending) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen relative pb-20">
        <header className="bg-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="p-2 mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <Skeleton className="h-6 w-24" />
          </div>
        </header>
        <main className="px-6 py-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </main>
        
      </div>
    );
  }

  if (!comparisonData) {
    return (
      <div className="max-w-md mx-auto bg-white min-h-screen relative pb-20">
        <header className="bg-white px-6 py-4 border-b border-gray-100">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleGoBack} className="p-2 mr-4">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900">Compare</h1>
          </div>
        </header>
        <main className="px-6 py-6">
          <p className="text-gray-600">Unable to load comparison data. Please try again.</p>
        </main>
        
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
            Compare
          </h1>
        </div>
      </header>

      <main className="px-6 py-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6" data-testid="text-comparison-title">
          {comparisonData.medication1.brandName} vs. {comparisonData.medication2.brandName}
        </h2>
        
        {/* Comparison Table */}
        <Card className="rounded-xl border border-gray-200 overflow-hidden mb-6">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              {/* Left Column */}
              <div className="space-y-0 divide-y divide-gray-200">
                <div className="p-4 bg-gray-50">
                  <span className="text-primary font-medium" data-testid="text-medication1-name">
                    {comparisonData.medication1.brandName}
                  </span>
                </div>
                
                {comparisonData.comparison.map((item, index) => (
                  <div key={index}>
                    <div className="p-4 bg-gray-50">
                      <span className="text-primary font-medium">{item.category}</span>
                    </div>
                    <div className="p-4">
                      <span className="text-gray-900 font-medium" data-testid={`text-med1-value-${index}`}>
                        {item.medication1Value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Right Column */}
              <div className="space-y-0 divide-y divide-gray-200">
                <div className="p-4 bg-gray-50">
                  <span className="text-primary font-medium" data-testid="text-medication2-name">
                    {comparisonData.medication2.brandName}
                  </span>
                </div>
                
                {comparisonData.comparison.map((item, index) => (
                  <div key={index}>
                    <div className="p-4 bg-gray-50">
                      <span className="text-gray-400 text-sm">{item.category}</span>
                    </div>
                    <div className="p-4">
                      <span className="text-gray-900 font-medium" data-testid={`text-med2-value-${index}`}>
                        {item.medication2Value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        {comparisonData.summary && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Summary</h3>
              <p className="text-blue-800 text-sm" data-testid="text-comparison-summary">
                {comparisonData.summary}
              </p>
            </CardContent>
          </Card>
        )}
      </main>

      
    </div>
  );
}
