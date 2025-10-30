import { GoogleGenAI } from "@google/genai";
import type { Symptom, MedicationWithDetails } from "@shared/schema";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
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
    const systemPrompt = `You are a medical AI assistant that helps recommend over-the-counter medications based on multiple symptoms.
    
Guidelines:
- Only recommend medications from the provided list
- Prioritize safety and conservative recommendations
- Always include appropriate warnings
- Rate effectiveness on a scale of 1-5
- Rate priority on a scale of 1-10 (higher = more recommended)
- Consider drug interactions and contraindications
- Recommend seeing a healthcare provider for serious symptoms
- When analyzing multiple symptoms, consider the relationships between them
- Look for common underlying conditions that might cause multiple symptoms
- Prioritize medications that can address multiple symptoms effectively
- Provide specific analysis for each symptom combination

Available symptoms: ${availableSymptoms.map((s) => `${s.name}: ${s.description || "No description"}`).join(", ")}

Available medications: ${availableMedications
      .map(
        (med) =>
          `${med.brandName} (${med.genericName}): ${med.description} - Uses: ${med.uses} - Category: ${med.category}`,
      )
      .join("\n")}

Respond with JSON in this exact format:
{
  "symptomAnalysis": "Comprehensive analysis of the symptom combination, potential causes, and severity assessment",
  "recommendedMedications": [
    {
      "medicationId": "medication_id_from_list",
      "reasoning": "Why this medication is recommended for these specific symptoms",
      "effectiveness": 1-5,
      "priority": 1-10
    }
  ],
  "warnings": ["Important warnings or precautions specific to this symptom combination"],
  "additionalAdvice": "Comprehensive advice including when to see a doctor, lifestyle recommendations, and follow-up care"
}`;

    const symptomCountNote = symptoms.length > 1 
      ? ` Note: The user has reported ${symptoms.length} symptoms together - analyze the combination carefully for potential underlying conditions.`
      : '';

    const userPrompt = `Analyze these symptoms and recommend appropriate medications: ${symptoms.join(", ")}${symptomCountNote}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
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
  // Fallback builder when AI is unavailable
  const buildFallbackComparison = () => {
    const asText = (v: unknown, defaultText = "Not specified") =>
      (v == null || String(v).trim() === "") ? defaultText : String(v);

    const comparison = [
      {
        category: "Category",
        medication1Value: asText(medication1.category, ""),
        medication2Value: asText(medication2.category, ""),
      },
      {
        category: "Uses",
        medication1Value: asText(medication1.uses || medication1.description, ""),
        medication2Value: asText(medication2.uses || medication2.description, ""),
      },
      {
        category: "Dosage",
        medication1Value: asText(medication1.dosage, ""),
        medication2Value: asText(medication2.dosage, ""),
      },
      {
        category: "Side Effects",
        medication1Value: asText((medication1 as any).sideEffects, "Not specified"),
        medication2Value: asText((medication2 as any).sideEffects, "Not specified"),
      },
      {
        category: "Precautions",
        medication1Value: asText((medication1 as any).precautions, ""),
        medication2Value: asText((medication2 as any).precautions, ""),
      },
      {
        category: "Interactions",
        medication1Value: asText((medication1 as any).interactions, ""),
        medication2Value: asText((medication2 as any).interactions, ""),
      },
      {
        category: "Price",
        medication1Value: medication1.price != null ? `$${medication1.price}` : "Not specified",
        medication2Value: medication2.price != null ? `$${medication2.price}` : "Not specified",
      },
    ];

    const summary = `Basic comparison generated without AI. ${medication1.brandName} vs ${medication2.brandName} — review category, uses, dosage, side effects, interactions, and price.`;
    return { comparison, summary };
  };

  async function tryGenerate(attempt: number): Promise<{ comparison: any[]; summary: string }> {
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
Side Effects: ${(medication1 as any).sideEffects}
Price: ${medication1.price || "Not specified"}

Medication 2: ${medication2.brandName} (${medication2.genericName})
Description: ${medication2.description}
Uses: ${medication2.uses}
Category: ${medication2.category}
Dosage: ${medication2.dosage}
Side Effects: ${(medication2 as any).sideEffects}
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

      const rawJson = (response as any).text;
      if (!rawJson) throw new Error("Empty response from Gemini API");
      return JSON.parse(rawJson);
    } catch (error: any) {
      const message = String(error?.message || error);
      const shouldRetry = attempt < 3 && /INTERNAL|ECONNRESET|ENOTFOUND|ETIMEDOUT|503|500/.test(message);
      if (shouldRetry) {
        await new Promise((r) => setTimeout(r, 400 * attempt));
        return tryGenerate(attempt + 1);
      }
      throw error;
    }
  }

  try {
    return await tryGenerate(1);
  } catch (error) {
    console.error("Gemini API error:", error);
    return buildFallbackComparison();
  }
}
