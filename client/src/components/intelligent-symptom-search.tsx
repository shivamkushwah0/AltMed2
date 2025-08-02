import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Symptom } from "@shared/schema";

interface IntelligentSymptomSearchProps {
  onSymptomSelect: (symptoms: string[]) => void;
  placeholder?: string;
  className?: string;
}

// Fuzzy search function that scores matches based on various criteria
function fuzzyScore(query: string, text: string): number {
  if (!query) return 0;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match gets highest score
  if (textLower === queryLower) return 1000;
  
  // Starts with query gets high score
  if (textLower.startsWith(queryLower)) return 800;
  
  // Contains query as whole word gets good score
  if (textLower.includes(` ${queryLower} `) || textLower.includes(` ${queryLower}`)) return 600;
  
  // Contains query gets medium score
  if (textLower.includes(queryLower)) return 400;
  
  // Character-by-character matching for typos
  let score = 0;
  let queryIndex = 0;
  let consecutiveMatches = 0;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      queryIndex++;
      consecutiveMatches++;
      score += consecutiveMatches * 2; // Bonus for consecutive matches
    } else {
      consecutiveMatches = 0;
    }
  }
  
  // Bonus if all characters are found
  if (queryIndex === queryLower.length) {
    score += 100;
  }
  
  return score;
}

// Enhanced search function that considers multiple fields and common variations
function searchSymptoms(symptoms: Symptom[], query: string): Symptom[] {
  if (!query.trim()) return symptoms.slice(0, 8); // Show first 8 when no query
  
  const scoredSymptoms = symptoms.map(symptom => {
    const nameScore = fuzzyScore(query, symptom.name);
    const descScore = symptom.description ? fuzzyScore(query, symptom.description) * 0.5 : 0;
    
    // Handle common variations and synonyms
    let synonymScore = 0;
    const synonyms = getSymptomSynonyms(symptom.name);
    for (const synonym of synonyms) {
      synonymScore = Math.max(synonymScore, fuzzyScore(query, synonym) * 0.7);
    }
    
    const totalScore = Math.max(nameScore, descScore, synonymScore);
    
    return {
      symptom,
      score: totalScore
    };
  }).filter(item => item.score > 50) // Minimum threshold
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Show top 10 matches
  
  return scoredSymptoms.map(item => item.symptom);
}

// Common symptom synonyms and variations
function getSymptomSynonyms(symptomName: string): string[] {
  const synonymMap: Record<string, string[]> = {
    "headache": ["head pain", "migraine", "head ache"],
    "stomach ache": ["belly pain", "abdominal pain", "tummy ache"],
    "fever": ["high temperature", "temperature", "hot"],
    "cough": ["coughing", "dry cough", "wet cough"],
    "runny nose": ["nasal congestion", "stuffy nose", "blocked nose"],
    "sore throat": ["throat pain", "painful throat"],
    "nausea": ["feeling sick", "queasy", "sick feeling"],
    "diarrhea": ["loose stools", "stomach upset", "runny stomach"],
    "constipation": ["can't poop", "blocked", "hard stools"],
    "fatigue": ["tired", "exhausted", "tiredness", "weakness"],
    "dizziness": ["dizzy", "lightheaded", "vertigo"],
    "muscle pain": ["muscle ache", "body pain", "muscle soreness"],
    "joint pain": ["arthritis", "joint ache", "stiff joints"],
    "chest pain": ["heart pain", "chest tightness"],
    "shortness of breath": ["breathing problems", "can't breathe", "breathless"],
    "insomnia": ["can't sleep", "sleeplessness", "sleep problems"],
    "anxiety": ["worried", "nervous", "stress", "panic"],
    "depression": ["sad", "down", "low mood"],
    "rash": ["skin rash", "itchy skin", "skin irritation"],
    "bloating": ["swollen stomach", "gas", "stomach swelling"],
    "heartburn": ["acid reflux", "indigestion", "burning stomach"]
  };
  
  const normalizedName = symptomName.toLowerCase();
  return synonymMap[normalizedName] || [];
}

export default function IntelligentSymptomSearch({ 
  onSymptomSelect, 
  placeholder = "Type your symptoms...",
  className = ""
}: IntelligentSymptomSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: allSymptoms = [] } = useQuery<Symptom[]>({
    queryKey: ["/api/symptoms"],
  });

  const filteredSymptoms = useMemo(() => {
    return searchSymptoms(allSymptoms, query).filter(
      symptom => !selectedSymptoms.includes(symptom.name)
    );
  }, [allSymptoms, query, selectedSymptoms]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [filteredSymptoms]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsDropdownOpen(value.length > 0);
  };

  const handleInputFocus = () => {
    if (query.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isDropdownOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredSymptoms.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : 0);
        break;
      case "Enter":
        e.preventDefault();
        if (filteredSymptoms[highlightedIndex]) {
          selectSymptom(filteredSymptoms[highlightedIndex].name);
        }
        break;
      case "Escape":
        setIsDropdownOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const selectSymptom = (symptomName: string) => {
    const newSymptoms = [...selectedSymptoms, symptomName];
    setSelectedSymptoms(newSymptoms);
    setQuery("");
    setIsDropdownOpen(false);
    inputRef.current?.focus();
    
    // Trigger search immediately when a symptom is selected
    onSymptomSelect(newSymptoms);
  };

  const removeSymptom = (symptomName: string) => {
    const newSymptoms = selectedSymptoms.filter(s => s !== symptomName);
    setSelectedSymptoms(newSymptoms);
    if (newSymptoms.length > 0) {
      onSymptomSelect(newSymptoms);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSymptoms.length > 0) {
      onSymptomSelect(selectedSymptoms);
    } else if (query.trim()) {
      // If user types something and presses enter, add it as a custom symptom
      const newSymptoms = [query.trim()];
      setSelectedSymptoms(newSymptoms);
      onSymptomSelect(newSymptoms);
      setQuery("");
      setIsDropdownOpen(false);
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <form onSubmit={handleSubmit}>
        {/* Selected Symptoms */}
        {selectedSymptoms.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedSymptoms.map((symptom) => (
              <div 
                key={symptom}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
              >
                <span>{symptom}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-primary/20"
                  onClick={() => removeSymptom(symptom)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            ref={inputRef}
            type="text"
            placeholder={selectedSymptoms.length > 0 ? "Add another symptom..." : placeholder}
            className="w-full pl-12 pr-4 py-4 bg-gray-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary/20 text-gray-700"
            value={query}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            data-testid="input-symptom-search"
          />
        </div>
      </form>

      {/* Dropdown */}
      {isDropdownOpen && filteredSymptoms.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {filteredSymptoms.map((symptom, index) => (
            <div
              key={symptom.id}
              className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                index === highlightedIndex 
                  ? "bg-primary/5 text-primary" 
                  : "hover:bg-gray-50"
              }`}
              onClick={() => selectSymptom(symptom.name)}
            >
              <div className="font-medium">{symptom.name}</div>
              {symptom.description && (
                <div className="text-sm text-gray-500 mt-1">
                  {symptom.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {isDropdownOpen && query && filteredSymptoms.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 px-4 py-3 text-gray-500 text-center">
          No symptoms found. Press Enter to search for "{query}"
        </div>
      )}
    </div>
  );
}