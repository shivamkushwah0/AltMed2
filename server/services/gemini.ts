import { GoogleGenAI } from "@google/genai";
import type { Symptom, MedicationWithDetails } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
console.log(process.env.GEMINI_API_KEY);
interface MedicationRecommendation {
  symptomAnalysis: string;
  recommendedMedications: {
    medicationId: string;
    reasoning: string;
    effectiveness: number; // 1-5 scale
    priority: number; // 1-10 scale
  }[];
  warnings: string[];
  additionalAdvice: string;
}

export async function analyzeSymptomsAndRecommendMedications(
  symptoms: string[],
  availableSymptoms: Symptom[],
  availableMedications: MedicationWithDetails[],
): Promise<MedicationRecommendation> {
  try {
    console.log(process.env.GEMINI_API_KEY);
    const systemPrompt = `You are a medical AI assistant that helps recommend over-the-counter medications based on symptoms.
    
Guidelines:
- Only recommend medications from the provided list
- Prioritize safety and conservative recommendations
- Always include appropriate warnings
- Rate effectiveness on a scale of 1-5
- Rate priority on a scale of 1-10 (higher = more recommended)
- Consider drug interactions and contraindications
- Recommend seeing a healthcare provider for serious symptoms

Available symptoms: ${availableSymptoms.map((s) => `${s.name}: ${s.description || "No description"}`).join(", ")}

Available medications: ${availableMedications
      .map(
        (med) =>
          `${med.brandName} (${med.genericName}): ${med.description} - Uses: ${med.uses} - Category: ${med.category}`,
      )
      .join("\n")}

Respond with JSON in this exact format:
{
  "symptomAnalysis": "Brief analysis of the symptoms",
  "recommendedMedications": [
    {
      "medicationId": "medication_id_from_list",
      "reasoning": "Why this medication is recommended",
      "effectiveness": 1-5,
      "priority": 1-10
    }
  ],
  "warnings": ["Important warnings or precautions"],
  "additionalAdvice": "General advice and when to see a doctor"
}`;

    const userPrompt = `Analyze these symptoms and recommend appropriate medications: ${symptoms.join(", ")}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            symptomAnalysis: { type: "string" },
            recommendedMedications: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  medicationId: { type: "string" },
                  reasoning: { type: "string" },
                  effectiveness: { type: "number" },
                  priority: { type: "number" },
                },
                required: [
                  "medicationId",
                  "reasoning",
                  "effectiveness",
                  "priority",
                ],
              },
            },
            warnings: {
              type: "array",
              items: { type: "string" },
            },
            additionalAdvice: { type: "string" },
          },
          required: [
            "symptomAnalysis",
            "recommendedMedications",
            "warnings",
            "additionalAdvice",
          ],
        },
      },
      contents: userPrompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data: MedicationRecommendation = JSON.parse(rawJson);

      // Validate that recommended medications exist in our database
      data.recommendedMedications = data.recommendedMedications.filter((rec) =>
        availableMedications.some((med) => med.id === rec.medicationId),
      );

      return data;
    } else {
      throw new Error("Empty response from Gemini API");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to analyze symptoms: ${error}`);
  }
}

export async function generateMedicationComparison(
  medication1: MedicationWithDetails,
  medication2: MedicationWithDetails,
): Promise<{
  comparison: {
    category: string;
    medication1Value: string;
    medication2Value: string;
  }[];
  summary: string;
}> {
  try {
    const systemPrompt = `You are a medical AI assistant that helps compare medications.
    
Compare the two medications across these categories:
- Ingredients/Active compounds
- Effectiveness for similar conditions
- Side Effects
- Usage (frequency, method)
- Price (relative comparison)
- Availability (prescription vs OTC)

Respond with JSON in this exact format:
{
  "comparison": [
    {
      "category": "Category name",
      "medication1Value": "Value or description for first medication",
      "medication2Value": "Value or description for second medication"
    }
  ],
  "summary": "Brief summary of which medication might be better for different situations"
}`;

    const userPrompt = `Compare these medications:
    
Medication 1: ${medication1.brandName} (${medication1.genericName})
Description: ${medication1.description}
Uses: ${medication1.uses}
Category: ${medication1.category}
Dosage: ${medication1.dosage}
Side Effects: ${medication1.sideEffects}
Price: ${medication1.price || "Not specified"}

Medication 2: ${medication2.brandName} (${medication2.genericName})
Description: ${medication2.description}
Uses: ${medication2.uses}
Category: ${medication2.category}
Dosage: ${medication2.dosage}
Side Effects: ${medication2.sideEffects}
Price: ${medication2.price || "Not specified"}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            comparison: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  medication1Value: { type: "string" },
                  medication2Value: { type: "string" },
                },
                required: ["category", "medication1Value", "medication2Value"],
              },
            },
            summary: { type: "string" },
          },
          required: ["comparison", "summary"],
        },
      },
      contents: userPrompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from Gemini API");
    }
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error(`Failed to compare medications: ${error}`);
  }
}
