import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { analyzeSymptomsAndRecommendMedications, generateMedicationComparison } from "./services/gemini";
import { insertSearchHistorySchema, insertUserFavoriteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Symptoms routes
  app.get('/api/symptoms', async (req, res) => {
    try {
      const symptoms = await storage.getSymptoms();
      res.json(symptoms);
    } catch (error) {
      console.error("Error fetching symptoms:", error);
      res.status(500).json({ message: "Failed to fetch symptoms" });
    }
  });

  app.get('/api/symptoms/common', async (req, res) => {
    try {
      const symptoms = await storage.getCommonSymptoms();
      res.json(symptoms);
    } catch (error) {
      console.error("Error fetching common symptoms:", error);
      res.status(500).json({ message: "Failed to fetch common symptoms" });
    }
  });

  // Medication routes
  app.get('/api/medications', async (req, res) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error) {
      console.error("Error fetching medications:", error);
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  app.get('/api/medications/:id', async (req, res) => {
    try {
      const medication = await storage.getMedicationById(req.params.id);
      if (!medication) {
        return res.status(404).json({ message: "Medication not found" });
      }
      res.json(medication);
    } catch (error) {
      console.error("Error fetching medication:", error);
      res.status(500).json({ message: "Failed to fetch medication" });
    }
  });

  // AI-powered symptom search
  app.post('/api/search/symptoms', async (req, res) => {
    try {
      const { symptoms: symptomNames, userId } = req.body;
      
      if (!Array.isArray(symptomNames) || symptomNames.length === 0) {
        return res.status(400).json({ message: "Symptoms array is required" });
      }

      // Get matching symptoms from database
      const allSymptoms = await storage.getSymptoms();
      const matchingSymptoms = allSymptoms.filter(symptom => 
        symptomNames.some(name => 
          symptom.name.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(symptom.name.toLowerCase())
        )
      );

      if (matchingSymptoms.length === 0) {
        return res.status(404).json({ message: "No matching symptoms found" });
      }

      // Get medications for these symptoms
      const symptomIds = matchingSymptoms.map(s => s.id);
      const medications = await storage.getMedicationsBySymptom(symptomIds);

      // Use Gemini to analyze and recommend
      const aiRecommendation = await analyzeSymptomsAndRecommendMedications(
        symptomNames,
        allSymptoms,
        medications
      );

      // Save search history if user is authenticated
      if (userId) {
        try {
          await storage.addSearchHistory({
            userId,
            searchQuery: symptomNames.join(', '),
            symptomIds,
          });
        } catch (error) {
          console.error("Error saving search history:", error);
          // Don't fail the request if search history fails
        }
      }

      // Sort medications by AI priority
      const sortedMedications = medications
        .map(med => {
          const aiRec = aiRecommendation.recommendedMedications.find(r => r.medicationId === med.id);
          return {
            ...med,
            aiPriority: aiRec?.priority || 0,
            aiEffectiveness: aiRec?.effectiveness || 0,
            aiReasoning: aiRec?.reasoning || '',
          };
        })
        .sort((a, b) => b.aiPriority - a.aiPriority);

      res.json({
        symptoms: matchingSymptoms,
        medications: sortedMedications,
        aiAnalysis: {
          symptomAnalysis: aiRecommendation.symptomAnalysis,
          warnings: aiRecommendation.warnings,
          additionalAdvice: aiRecommendation.additionalAdvice,
        },
      });
    } catch (error) {
      console.error("Error searching symptoms:", error);
      res.status(500).json({ message: "Failed to search symptoms" });
    }
  });

  // Medication comparison
  app.post('/api/medications/compare', async (req, res) => {
    try {
      const { medication1Id, medication2Id } = req.body;
      
      if (!medication1Id || !medication2Id) {
        return res.status(400).json({ message: "Both medication IDs are required" });
      }

      const [medication1, medication2] = await Promise.all([
        storage.getMedicationById(medication1Id),
        storage.getMedicationById(medication2Id),
      ]);

      if (!medication1 || !medication2) {
        return res.status(404).json({ message: "One or both medications not found" });
      }

      const comparison = await generateMedicationComparison(medication1, medication2);
      
      res.json({
        medication1,
        medication2,
        ...comparison,
      });
    } catch (error) {
      console.error("Error comparing medications:", error);
      res.status(500).json({ message: "Failed to compare medications" });
    }
  });

  // Pharmacy routes
  app.get('/api/pharmacies/nearby', async (req, res) => {
    try {
      const { lat, lng, radius = 10 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }

      const pharmacies = await storage.getNearbyPharmacies(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseFloat(radius as string)
      );

      res.json(pharmacies);
    } catch (error) {
      console.error("Error fetching nearby pharmacies:", error);
      res.status(500).json({ message: "Failed to fetch nearby pharmacies" });
    }
  });

  // User favorites (protected routes)
  app.get('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post('/api/favorites', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { medicationId } = insertUserFavoriteSchema.parse({
        ...req.body,
        userId,
      });

      const favorite = await storage.addFavorite({ userId, medicationId });
      res.json(favorite);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      console.error("Error adding favorite:", error);
      res.status(500).json({ message: "Failed to add favorite" });
    }
  });

  app.delete('/api/favorites/:medicationId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { medicationId } = req.params;

      await storage.removeFavorite(userId, medicationId);
      res.json({ message: "Favorite removed successfully" });
    } catch (error) {
      console.error("Error removing favorite:", error);
      res.status(500).json({ message: "Failed to remove favorite" });
    }
  });

  // Search history (protected route)
  app.get('/api/search/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const history = await storage.getUserSearchHistory(userId);
      res.json(history);
    } catch (error) {
      console.error("Error fetching search history:", error);
      res.status(500).json({ message: "Failed to fetch search history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
