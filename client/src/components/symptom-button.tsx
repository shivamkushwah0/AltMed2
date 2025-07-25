import { Button } from "@/components/ui/button";

import type { Symptom } from "@shared/schema";

interface SymptomButtonProps {
  symptom: Symptom;
  onClick: () => void;
}

export default function SymptomButton({ symptom, onClick }: SymptomButtonProps) {
  // Map icon names to actual icons (simplified)
  const getIconForSymptom = (name: string) => {
    const iconMap: Record<string, string> = {
      headache: "🤕",
      cough: "😷", 
      "skin rash": "🩹",
      allergies: "👁️",
    };
    
    return iconMap[name.toLowerCase()] || "💊";
  };

  return (
    <Button
      variant="outline"
      className="flex items-center p-4 bg-white border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-200 h-auto justify-start"
      onClick={onClick}
      data-testid={`button-symptom-${symptom.name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <span className="text-xl mr-3">{getIconForSymptom(symptom.name)}</span>
      <span className="font-medium text-gray-800">{symptom.name}</span>
    </Button>
  );
}
